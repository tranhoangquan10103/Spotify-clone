<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import { usePlayerStore } from '../stores/usePlayerStore';

type RightTab = 'nowPlaying' | 'queue' | 'connect';
type MiddleTab = 'album' | 'artist' | 'feed' | 'lyrics' | 'profile' | 'recents' | 'settings' | 'track' | 'trackdetail';

const props = defineProps<{
	activeRightTab: RightTab;
	activeMiddleTab: MiddleTab;
}>();

const emit = defineEmits<{
	(event: 'toggle-right-tab', tab: RightTab): void;
	(event: 'toggle-middle-tab', tab: MiddleTab): void;
}>();

const playerStore = usePlayerStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const progressBarRef = ref<HTMLDivElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isScrubbing = ref(false);
const fallbackCoverUrl = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW1wdmIwamRsMWs0MHdwdWdnMnM3b2F4andudXhkdmZkMHM4a2RxZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bdcVgamzkEGNB2hAl6/giphy.gif';

const getSvgUrl = (name: string) => new URL(`../assets/svg/${name}.svg`, import.meta.url).href;

const currentTrack = computed(() => playerStore.currentTrack);
const displayTitle = computed(() => currentTrack.value?.trackName);
const displayArtist = computed(() => currentTrack.value?.artistsText);
const displayCover = computed(() => currentTrack.value?.coverUrl ?? fallbackCoverUrl);
const isShuffleActive = computed(() => playerStore.isShuffled);
const repeatLabel = computed(() => {
	if (playerStore.repeatMode === 'one') {
		return 'Repeat one';
	}

	if (playerStore.repeatMode === 'all') {
		return 'Repeat all';
	}

	return 'Repeat';
});
const resolvedDuration = computed(() => {
	if (duration.value > 0) {
		return duration.value;
	}

	const trackDuration = currentTrack.value?.durationMs ?? 0;
	return trackDuration > 0 ? trackDuration / 1000 : 0;
});
const progressPercent = computed(() => {
	const total = resolvedDuration.value;
	if (!total) {
		return 0;
	}

	const ratio = currentTime.value / total;
	return Math.min(100, Math.max(0, ratio * 100));
});
const currentTimeLabel = computed(() => formatTime(currentTime.value));
const durationLabel = computed(() => formatTime(resolvedDuration.value));
const playPauseIcon = computed(() => getSvgUrl(isPlaying.value ? 'pause' : 'play'));
const playPauseLabel = computed(() => (isPlaying.value ? 'Pause' : 'Play'));

const formatTime = (valueSeconds: number) => {
	if (!Number.isFinite(valueSeconds)) {
		return '0:00';
	}

	const totalSeconds = Math.max(0, Math.floor(valueSeconds));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const syncDuration = () => {
	const audio = audioRef.value;
	if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
		return;
	}

	duration.value = audio.duration;
};

const handleTimeUpdate = () => {
	const audio = audioRef.value;
	if (!audio || isScrubbing.value) {
		return;
	}

	currentTime.value = audio.currentTime;
};

const handlePlay = () => {
	isPlaying.value = true;
};

const handlePause = () => {
	isPlaying.value = false;
};

const handleEnded = () => {
	isPlaying.value = false;
	currentTime.value = 0;
	if (audioRef.value) {
		audioRef.value.currentTime = 0;
	}
	playerStore.handleEnded();
};

const skipNext = () => {
	playerStore.skipNext();
};

const skipPrevious = () => {
	playerStore.skipPrevious();
};

const toggleShuffle = () => {
	playerStore.toggleShuffle();
};

const toggleRepeat = () => {
	playerStore.cycleRepeatMode();
};

const togglePlay = async () => {
	const audio = audioRef.value;
	if (!audio || !currentTrack.value) {
		return;
	}

	if (audio.paused) {
		try {
			await audio.play();
		} catch {
			isPlaying.value = false;
		}
		return;
	}

	audio.pause();
};

const seekToClientX = (clientX: number) => {
	const bar = progressBarRef.value;
	const audio = audioRef.value;
	if (!bar || !audio) {
		return;
	}

	const rect = bar.getBoundingClientRect();
	if (rect.width <= 0) {
		return;
	}

	const clampedX = Math.min(rect.width, Math.max(0, clientX - rect.left));
	const total = resolvedDuration.value;
	if (!total) {
		return;
	}

	const nextTime = (clampedX / rect.width) * total;
	audio.currentTime = nextTime;
	currentTime.value = nextTime;
};

const onProgressPointerMove = (event: PointerEvent) => {
	if (!isScrubbing.value) {
		return;
	}

	seekToClientX(event.clientX);
};

const onProgressPointerUp = () => {
	if (!isScrubbing.value) {
		return;
	}

	isScrubbing.value = false;
	window.removeEventListener('pointermove', onProgressPointerMove);
	window.removeEventListener('pointerup', onProgressPointerUp);
};

const onProgressPointerDown = (event: PointerEvent) => {
	if (!resolvedDuration.value) {
		return;
	}

	isScrubbing.value = true;
	seekToClientX(event.clientX);
	window.addEventListener('pointermove', onProgressPointerMove);
	window.addEventListener('pointerup', onProgressPointerUp);
};

watch(
	() => playerStore.currentTrack,
	async (track) => {
		const audio = audioRef.value;
		if (!audio) {
			return;
		}

		if (!track) {
			audio.pause();
			audio.removeAttribute('src');
			audio.load();
			isPlaying.value = false;
			currentTime.value = 0;
			duration.value = 0;
			return;
		}

		currentTime.value = 0;
		duration.value = track.durationMs / 1000;
		isPlaying.value = false;
		await nextTick();
		audio.load();
		audio.currentTime = 0;
	},
);

watch(
	() => playerStore.playRequestId,
	async () => {
		const audio = audioRef.value;
		if (!audio || !currentTrack.value) {
			return;
		}

		await nextTick();
		if (audio.currentSrc !== currentTrack.value.audioUrl) {
			audio.load();
		}

		try {
			await audio.play();
		} catch {
			isPlaying.value = false;
		}
	},
);

onBeforeUnmount(() => {
	window.removeEventListener('pointermove', onProgressPointerMove);
	window.removeEventListener('pointerup', onProgressPointerUp);
});
</script>

<template>
	<div class="now-playing-section">
		<div class="now-playing-left">
			<div class="now-playing-cover">
				<img
					:src="displayCover"
					:alt="displayTitle"
					class="now-playing-img"
				/>
			</div>
			<div class="now-playing-info">
				<div
					class="now-playing-title"
					:aria-pressed="props.activeMiddleTab === 'trackdetail'"
					@click="emit('toggle-middle-tab', 'trackdetail')"
				>
					{{ displayTitle }}
				</div>
				<div
					class="now-playing-artist"
					:aria-pressed="props.activeMiddleTab === 'artist'"
					@click="emit('toggle-middle-tab', 'artist')"
				>
					{{ displayArtist }}
				</div>
			</div>
		</div>

		<div class="now-playing-center">
			<button v-tooltip.top="{ value: 'Shuffle', showDelay: 300 }" class="player-btn" type="button" aria-label="Shuffle" :class="{ 'is-active': isShuffleActive }" @click="toggleShuffle">
				<img alt="Shuffle" src="../assets/svg/shuffle.svg">
			</button>
			<button v-tooltip.top="{ value: 'Previous', showDelay: 300 }" class="player-btn" type="button" aria-label="Previous" @click="skipPrevious">
				<img alt="Previous" src="../assets/svg/skip-previous.svg">
			</button>
			<button
				v-tooltip.top="{ value: playPauseLabel, showDelay: 300 }"
				class="player-btn player-play-btn"
				type="button"
				:aria-label="playPauseLabel"
				:disabled="!currentTrack"
				@click="togglePlay"
			>
				<img :alt="playPauseLabel" :src="playPauseIcon">
			</button>
			<button v-tooltip.top="{ value: 'Next', showDelay: 300 }" class="player-btn" type="button" aria-label="Next" @click="skipNext">
				<img alt="Next" src="../assets/svg/skip-next.svg">
			</button>
			<button v-tooltip.top="{ value: repeatLabel, showDelay: 300 }" class="player-btn" type="button" :aria-label="repeatLabel" :class="{ 'is-active': playerStore.repeatMode !== 'off' }" @click="toggleRepeat">
				<img alt="Repeat" src="../assets/svg/repeat.svg">
			</button>
		</div>

		<div class="now-playing-progress-container">
			<span class="now-playing-time">{{ currentTimeLabel }}</span>
			<div
				class="now-playing-progress-bar"
				ref="progressBarRef"
				@pointerdown="onProgressPointerDown"
			>
				<div class="now-playing-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
				<div class="now-playing-progress-handle" :style="{ left: `${progressPercent}%` }"></div>
			</div>
			<span class="now-playing-time">{{ durationLabel }}</span>
		</div>

		<div class="now-playing-right">
			<button
				v-tooltip.top="{ value: 'Lyrics', showDelay: 300 }"
				class="player-btn"
				type="button"
				aria-label="Lyrics"
				:aria-pressed="props.activeMiddleTab === 'lyrics'"
				@click="emit('toggle-middle-tab', 'lyrics')"
			>
				<img alt="lyrics" src="../assets/svg/lyrics.svg">
			</button>
			<button
				v-tooltip.top="{ value: 'Queue', showDelay: 300 }"
				class="player-btn"
				type="button"
				aria-label="Queue"
				:aria-pressed="props.activeRightTab === 'queue'"
				@click="emit('toggle-right-tab', 'queue')"
			>
				<img alt="Queue" src="../assets/svg/queue.svg">
			</button>
			<button
				v-tooltip.top="{ value: 'Connect to a device', showDelay: 300 }"
				class="player-btn"
				type="button"
				aria-label="Connect to a device"
				:aria-pressed="props.activeRightTab === 'connect'"
				@click="emit('toggle-right-tab', 'connect')"
			>
				<img alt="Connect to a device" src="../assets/svg/connect-device.svg">
			</button>
			<button v-tooltip.top="{ value: 'Mini player', showDelay: 300 }" class="player-btn" type="button" aria-label="Mini player">
				<img alt="Mini player" src="../assets/svg/mini-player.svg">
			</button>
		</div>

		<audio
			ref="audioRef"
			:src="currentTrack?.audioUrl ?? ''"
			preload="metadata"
			@timeupdate="handleTimeUpdate"
			@loadedmetadata="syncDuration"
			@durationchange="syncDuration"
			@play="handlePlay"
			@pause="handlePause"
			@ended="handleEnded"
			class="now-playing-audio"
		></audio>
	</div>
</template>

<style>
.now-playing-section {
	height: auto;
	min-height: 6rem;
	background: #000000;
	display: grid;
	grid-template-columns: 1fr 2fr 1fr;
	grid-template-rows: auto auto;
	align-items: center;
	padding: 0.5rem 1rem;
}

.now-playing-left {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	min-width: 0;
	grid-row: 1 / -1;
}

.now-playing-cover {
	width: 3.5rem;
	height: 3.5rem;
	border-radius: 3px;
	overflow: hidden;
	flex: 0 0 auto;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.now-playing-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.now-playing-info {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.now-playing-title {
	font-size: 0.95rem;
	font-weight: 700;
	color: #fff;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
}

.now-playing-title:hover {
	color: #1ed760;
}

.now-playing-artist {
	font-size: 0.85rem;
	color: #b3b3b3;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
}

.now-playing-artist:hover {
	color: #1ed760;
}

.now-playing-center {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	grid-column: 2;
	grid-row: 1;
}

.player-btn {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 50%;
	border: none;
	background: transparent;
	color: #b3b3b3;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.1rem;
	transition: color 0.2s, transform 0.1s;
}

.player-btn:hover {
	transform: scale(1.05);
}

.player-btn.is-active {
	background: rgba(30, 215, 96, 0.14);
}

.player-play-btn {
	background: #ffffff;
	width: 2rem;
	height: 2rem;
}

.player-play-btn img {
	filter: brightness(0);
	width: 1.2rem;
	height: 1.2rem;
}

.player-play-btn:hover {
	background: #ffffff;
}

.now-playing-progress-container {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	grid-column: 2;
	grid-row: 2;
	width: 100%;
}

.now-playing-time {
	font-size: 0.75rem;
	color: #b3b3b3;
	min-width: 2.5rem;
	text-align: center;
}

.now-playing-progress-bar {
	flex: 1;
	height: 4px;
	background: #404040;
	border-radius: 2px;
	cursor: pointer;
	position: relative;
	display: flex;
	align-items: center;
	touch-action: none;
}

.now-playing-progress-bar:hover {
	height: 6px;
}

.now-playing-progress-fill {
	height: 100%;
	background: #ffffff;
	border-radius: 2px;
	transition: width 0.1s, background-color 0.2s;
}

.now-playing-progress-bar:hover .now-playing-progress-fill {
	background: #1db954;
}

.now-playing-progress-handle {
	width: 12px;
	height: 12px;
	background: #fff;
	border-radius: 50%;
	position: absolute;
	top: 50%;
	left: 0;
	transform: translate(-50%, -50%);
	opacity: 0;
	transition: opacity 0.2s;
	pointer-events: none;
}

.now-playing-progress-bar:hover .now-playing-progress-handle {
	opacity: 1;
}

.now-playing-audio {
	display: none;
}

.now-playing-right {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.8rem;
	grid-row: 1 / -1;
	color: #b3b3b3;
}

.now-playing-right i {
	cursor: pointer;
	transition: color 0.2s;
	font-size: 1rem;
}

.now-playing-right i:hover {
	color: #1ed760;
}

.now-playing-right .player-btn {
	width: 2rem;
	height: 2rem;
	font-size: 0.95rem;
}
</style>