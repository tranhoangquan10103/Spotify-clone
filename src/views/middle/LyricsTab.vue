<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useLyricsSync } from '../../composables/useLyricsSync';
import { usePlayerStore } from '../../stores/usePlayerStore';

const playerStore = usePlayerStore();
const lyricsContainerRef = ref<HTMLDivElement | null>(null);

// Track current playback time
const currentTime = ref(0);
let timeTrackingId: number | null = null;
let resumeAutoScrollTimeoutId: number | null = null;
let autoScrollAnimationTimeoutId: number | null = null;
let isProgrammaticScroll = false;
const autoScrollDelayMs = 8000;
const autoScrollAnimationMs = 700;
const isPlaying = ref(false);

const getAudioElement = () => document.querySelector('audio.now-playing-audio') as HTMLAudioElement | null;

// Start tracking time
const trackTime = () => {
	const audio = getAudioElement();
	if (audio) {
		currentTime.value = audio.currentTime;
		isPlaying.value = !audio.paused && !audio.ended;
	} else {
		isPlaying.value = false;
	}
	timeTrackingId = requestAnimationFrame(trackTime);
};

const { allLyrics, currentLyricIndex, isLoading, error } = useLyricsSync(() => currentTime.value);

const clearResumeAutoScrollTimeout = () => {
	if (resumeAutoScrollTimeoutId !== null) {
		window.clearTimeout(resumeAutoScrollTimeoutId);
		resumeAutoScrollTimeoutId = null;
	}
};

const clearAutoScrollAnimationLock = () => {
	if (autoScrollAnimationTimeoutId !== null) {
		window.clearTimeout(autoScrollAnimationTimeoutId);
		autoScrollAnimationTimeoutId = null;
	}

	isProgrammaticScroll = false;
};

const lockProgrammaticScroll = (animate: boolean) => {
	clearAutoScrollAnimationLock();
	isProgrammaticScroll = true;

	if (!animate) {
		requestAnimationFrame(() => {
			isProgrammaticScroll = false;
		});
		return;
	}

	autoScrollAnimationTimeoutId = window.setTimeout(() => {
		autoScrollAnimationTimeoutId = null;
		isProgrammaticScroll = false;
	}, autoScrollAnimationMs);
};

const lastUserScrollAt = ref(0);

const shouldAutoScroll = () => isPlaying.value && Date.now() - lastUserScrollAt.value >= autoScrollDelayMs;

// Auto-scroll to current lyric
const scrollToCurrentLyric = (index = currentLyricIndex.value, animate = false) => {
	const container = lyricsContainerRef.value;
	if (!container) return;

	const currentLines = container.querySelectorAll('.lyric-line');

	if (index >= 0 && index < currentLines.length) {
		const currentLine = currentLines[index] as HTMLElement;
		const containerHeight = container.clientHeight;
		const lineTop = currentLine.offsetTop;
		const lineHeight = currentLine.clientHeight;
		const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;
		const nextScrollTop = Math.max(0, scrollTop);

		lockProgrammaticScroll(animate);

		if (animate) {
			container.scrollTo({
				top: nextScrollTop,
				behavior: 'smooth',
			});
			return;
		}

		container.scrollTop = nextScrollTop;
	}
};

const scheduleAutoScrollResume = () => {
	clearResumeAutoScrollTimeout();
	const elapsed = Date.now() - lastUserScrollAt.value;
	const remainingDelay = Math.max(0, autoScrollDelayMs - elapsed);

	resumeAutoScrollTimeoutId = window.setTimeout(() => {
		resumeAutoScrollTimeoutId = null;
		if (shouldAutoScroll()) {
			scrollToCurrentLyric(currentLyricIndex.value, true);
		}
	}, remainingDelay);
};

const handleLyricsScroll = () => {
	if (isProgrammaticScroll) {
		return;
	}

	lastUserScrollAt.value = Date.now();
	scheduleAutoScrollResume();
};

const handleManualScrollStart = () => {
	if (!isProgrammaticScroll) {
		return;
	}

	clearAutoScrollAnimationLock();
	lastUserScrollAt.value = Date.now();
	scheduleAutoScrollResume();
};

const seekToLyric = async (time: number, index: number) => {
	const audio = getAudioElement();
	if (!audio) {
		return;
	}

	const shouldResumePlayback = audio.paused || audio.ended;
	audio.currentTime = time;
	currentTime.value = time;

	if (shouldResumePlayback) {
		try {
			await audio.play();
		} catch {
			// Keep the seek even if playback cannot resume.
		}
	}

	scrollToCurrentLyric(index, false);
};

onMounted(() => {
	trackTime();
});

watch(currentLyricIndex, () => {
	if (shouldAutoScroll()) {
		scrollToCurrentLyric(currentLyricIndex.value, true);
	}
});

watch(isPlaying, (playing) => {
	if (playing && shouldAutoScroll()) {
		scrollToCurrentLyric(currentLyricIndex.value, true);
	}
});

watch(
	() => playerStore.currentTrack,
	() => {
		lastUserScrollAt.value = 0;
		clearResumeAutoScrollTimeout();
		clearAutoScrollAnimationLock();
	},
);

onBeforeUnmount(() => {
	if (timeTrackingId !== null) {
		cancelAnimationFrame(timeTrackingId);
	}
	clearResumeAutoScrollTimeout();
	clearAutoScrollAnimationLock();
});

const hasLyrics = computed(() => allLyrics.value.length > 0);
const noLyricsMessage = computed(() => {
	if (isLoading.value) return 'Loading lyrics...';
	if (error.value) return `You caught us, we're still working on getting lyrics for this song`;
	if (!playerStore.currentTrack) return `No track is currently playing`;
	return `You caught us, we're still working on getting lyrics for this song`;
});
</script>

<template>
	<div class="lyrics-container">
		<div v-if="!hasLyrics" class="no-lyrics">
			<p>{{ noLyricsMessage }}</p>
		</div>

		<div
			v-else
			ref="lyricsContainerRef"
			class="lyrics-content"
			@scroll="handleLyricsScroll"
			@wheel="handleManualScrollStart"
			@touchmove="handleManualScrollStart"
		>
			<div
				v-for="(line, index) in allLyrics"
				:key="`${line.time}-${index}`"
				class="lyric-line"
				:class="{ 'is-current': index === currentLyricIndex }"
				@click="seekToLyric(line.time, index)"
			>
				{{ line.text }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.lyrics-container {
	display: flex;
	flex-direction: column;
	height: 100%;
    width: 100%;
	overflow: hidden;
	background: #015500;
}

h2 {
	font: 1.5rem 'Spotify Circular', -apple-system, BlinkMacSystemFont, sans-serif;
	font-weight: 700;
	font-size: 1.3rem;
	color: #fff;
	margin: 1rem 0 0 1rem;
	flex-shrink: 0;
}

.no-lyrics {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	color: #a1f8a2;
	font-size: 4.5rem;
    font-weight: 700;
	padding: 0 2rem;
	text-align: center;
}

.lyrics-content {
	flex: 1;
	overflow-y: auto;
	padding: 2rem 3rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.lyrics-content::-webkit-scrollbar {
	display: none;
}

.lyric-line {
	font-size: 1.9rem;
	line-height: 1.5;
	color: #a1f8a2;
	text-align: left;
	transition: all 0.3s ease;
	padding: 0.5rem;
    font-weight: 700;
}

.lyric-line.is-current {
	color: #FFFFFF;
	font-size: 2.0rem;
	font-weight: 700;
	opacity: 1;
}

.lyric-line:hover, .lyric-line.is-current:hover {
    text-decoration: underline;
    cursor: pointer;
	color: #FFFFFF;
}
</style>