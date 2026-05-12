<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useLyricsSync } from '../../composables/useLyricsSync';
import { usePlayerStore } from '../../stores/usePlayerStore';

const playerStore = usePlayerStore();
const lyricsContainerRef = ref<HTMLDivElement | null>(null);

// Track current playback time
const currentTime = ref(0);
let timeTrackingId: number | null = null;
let scrollUpdateId: number | null = null;

// Start tracking time
const trackTime = () => {
	const audio = document.querySelector('audio.now-playing-audio') as HTMLAudioElement | null;
	if (audio) {
		currentTime.value = audio.currentTime;
	}
	timeTrackingId = requestAnimationFrame(trackTime);
};

const { allLyrics, currentLyricIndex, isLoading, error } = useLyricsSync(() => currentTime.value);

// Auto-scroll to current lyric
const scrollToCurrentLyric = () => {
	const container = lyricsContainerRef.value;
	if (!container) return;

	const currentLines = container.querySelectorAll('.lyric-line');
	const currentIndex = currentLyricIndex.value;

	if (currentIndex >= 0 && currentIndex < currentLines.length) {
		const currentLine = currentLines[currentIndex] as HTMLElement;
		const containerHeight = container.clientHeight;
		const lineTop = currentLine.offsetTop;
		const lineHeight = currentLine.clientHeight;
		const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;
		container.scrollTop = Math.max(0, scrollTop);
	}
};

// Watch for changes in current lyric and scroll
const updateScroll = () => {
	scrollToCurrentLyric();
	scrollUpdateId = requestAnimationFrame(updateScroll);
};

onMounted(() => {
	trackTime();
	updateScroll();
});

onUnmounted(() => {
	if (timeTrackingId !== null) {
		cancelAnimationFrame(timeTrackingId);
	}
	if (scrollUpdateId !== null) {
		cancelAnimationFrame(scrollUpdateId);
	}
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

		<div v-else ref="lyricsContainerRef" class="lyrics-content">
			<div
				v-for="(line, index) in allLyrics"
				:key="`${line.time}-${index}`"
				class="lyric-line"
				:class="{ 'is-current': index === currentLyricIndex }"
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