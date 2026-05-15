<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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
const volumeStorageKey = 'spotify-player-volume';
const previousVolumeStorageKey = 'spotify-player-previous-volume';
const volume = ref(100);
const previousVolume = ref(100);
const isMuted = computed(() => volume.value === 0);
const volumeIconName = computed(() => {
	if (volume.value === 0) {
		return 'muted';
	}

	if (volume.value <= 33) {
		return 'volume-1';
	}

	if (volume.value <= 66) {
		return 'volume-2';
	}

	return 'volume-3';
});
const volumeIconUrl = computed(() => getSvgUrl(volumeIconName.value));
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

const applyVolumeToAudio = (nextVolume: number) => {
	const audio = audioRef.value;
	if (!audio) {
		return;
	}

	const normalizedVolume = Math.min(100, Math.max(0, Math.round(nextVolume)));
	audio.volume = normalizedVolume / 100;
	audio.muted = normalizedVolume === 0;
};

const persistVolume = (nextVolume: number) => {
	try {
		window.localStorage.setItem(volumeStorageKey, String(nextVolume));
	} catch {
		// Ignore storage failures and keep the current in-memory volume.
	}
};

const persistPreviousVolume = (nextVolume: number) => {
	try {
		window.localStorage.setItem(previousVolumeStorageKey, String(nextVolume));
	} catch {
		// Ignore storage failures and keep the current in-memory volume.
	}
};

const setVolume = (nextVolume: number, shouldPersist = true) => {
	const normalizedVolume = Math.min(100, Math.max(0, Math.round(nextVolume)));
	volume.value = normalizedVolume;
	if (normalizedVolume > 0) {
		previousVolume.value = normalizedVolume;
		persistPreviousVolume(normalizedVolume);
	}
	applyVolumeToAudio(normalizedVolume);

	if (shouldPersist) {
		persistVolume(normalizedVolume);
	}
};

const toggleMute = () => {
	if (isMuted.value) {
		const restoredVolume = previousVolume.value > 0 ? previousVolume.value : 100;
		setVolume(restoredVolume);
		return;
	}

	previousVolume.value = volume.value;
	persistPreviousVolume(previousVolume.value);
	setVolume(0);
};

const initializeVolume = () => {
	let savedVolume = 100;
	let savedPreviousVolume = 100;

	try {
		const parsedVolume = Number(window.localStorage.getItem(volumeStorageKey));
		if (Number.isFinite(parsedVolume)) {
			savedVolume = parsedVolume;
		}

		const parsedPreviousVolume = Number(window.localStorage.getItem(previousVolumeStorageKey));
		if (Number.isFinite(parsedPreviousVolume) && parsedPreviousVolume > 0) {
			savedPreviousVolume = parsedPreviousVolume;
		}
	} catch {
		// Use the default volume when storage is unavailable.
	}

	previousVolume.value = savedVolume > 0 ? savedVolume : savedPreviousVolume;
	setVolume(savedVolume, false);
	persistVolume(savedVolume);
	persistPreviousVolume(previousVolume.value);
};

const handleVolumeInput = (event: Event) => {
	const input = event.target as HTMLInputElement | null;
	if (!input) {
		return;
	}

	const nextVolume = Number(input.value);
	if (!Number.isFinite(nextVolume)) {
		return;
	}

	setVolume(nextVolume);
};

const handleVolumeChange = () => {
	const audio = audioRef.value;
	if (!audio) {
		return;
	}

	const nextVolume = Math.round(audio.volume * 100);
	if (nextVolume !== volume.value) {
		volume.value = nextVolume;
		if (nextVolume > 0) {
			previousVolume.value = nextVolume;
			persistPreviousVolume(nextVolume);
		}
		persistVolume(nextVolume);
	}
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
		applyVolumeToAudio(volume.value);
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

		applyVolumeToAudio(volume.value);

		try {
			await audio.play();
		} catch {
			isPlaying.value = false;
		}
	},
);

onMounted(() => {
	initializeVolume();
});

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
				class="player-btn now-playing-icon-button icon-lyrics"
				type="button"
				aria-label="Lyrics"
				:aria-pressed="props.activeMiddleTab === 'lyrics'"
				@click="emit('toggle-middle-tab', 'lyrics')"
			></button>
			<button
				v-tooltip.top="{ value: 'Queue', showDelay: 300 }"
				class="player-btn now-playing-icon-button icon-queue"
				type="button"
				aria-label="Queue"
				:aria-pressed="props.activeRightTab === 'queue'"
				@click="emit('toggle-right-tab', 'queue')"
			></button>
			<button
				v-tooltip.top="{ value: 'Connect to a device', showDelay: 300 }"
				class="player-btn now-playing-icon-button icon-connect"
				type="button"
				aria-label="Connect to a device"
				:aria-pressed="props.activeRightTab === 'connect'"
				@click="emit('toggle-right-tab', 'connect')"
			></button>
			<div class="volume-control">
				<button
					v-tooltip.top="{ value: isMuted ? 'Unmute' : 'Mute', showDelay: 300 }"
					class="volume-toggle-button"
					type="button"
					:aria-label="isMuted ? 'Unmute' : 'Mute'"
					:aria-pressed="isMuted"
					@click="toggleMute"
				>
					<img class="volume-icon" :alt="isMuted ? 'Muted' : 'Volume'" :src="volumeIconUrl">
				</button>
				<input
					class="volume-slider"
					type="range"
					min="0"
					max="100"
					step="1"
					:value="volume"
					:style="{ '--volume-percent': `${volume}%` }"
					aria-label="Volume"
					:aria-valuenow="volume"
					aria-valuemin="0"
					aria-valuemax="100"
					@input="handleVolumeInput"
				/>
			</div>
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
				@volumechange="handleVolumeChange"
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
	grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1.15fr);
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
	background: rgb(0, 84, 29);
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
	gap: 0.6rem;
	grid-row: 1 / -1;
	color: #b3b3b3;
	min-width: 0;
	flex-wrap: nowrap;
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

.now-playing-icon-button {
	padding: 0;
	background-color: #ffffff !important;
	transition: background-color 0.2s ease, transform 0.1s ease;
	-webkit-mask-repeat: no-repeat;
	mask-repeat: no-repeat;
	-webkit-mask-position: center;
	mask-position: center;
	-webkit-mask-size: 16px 16px;
	mask-size: 16px 16px;
}

.now-playing-icon-button[aria-pressed='true'] {
	background-color: #1ed760 !important;
}

.now-playing-icon-button:not([aria-pressed='true']):hover {
	background-color: #ffffff !important;
}

.now-playing-icon-button:hover {
	transform: scale(1.05);
}

.icon-lyrics {
	-webkit-mask-image: url('../assets/svg/lyrics.svg');
	mask-image: url('../assets/svg/lyrics.svg');
}

.icon-queue {
	-webkit-mask-image: url('../assets/svg/queue.svg');
	mask-image: url('../assets/svg/queue.svg');
}

.icon-connect {
	-webkit-mask-image: url('../assets/svg/connect-device.svg');
	mask-image: url('../assets/svg/connect-device.svg');
}

.volume-control {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	flex: 0 1 6.55rem;
	min-width: 5.35rem;
	max-width: 6.7rem;
	overflow: hidden;
}

.volume-toggle-button {
	width: 1.1rem;
	height: 1.1rem;
	border: none;
	background: transparent;
	color: #ffffff;
	padding: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 0 0 auto;
	cursor: pointer;
	transition: color 0.2s ease;
}

.volume-toggle-button:hover {
	color: #ffffff;
}

.volume-icon {
	width: 1.1rem;
	height: 1.1rem;
	flex: 0 0 auto;
	filter: brightness(0) saturate(0%) invert(72%);
	transition: filter 0.2s ease, color 0.2s ease;
}

.volume-toggle-button:hover .volume-icon {
	filter: brightness(0) saturate(0%) invert(100%);
}

.volume-slider {
	width: 100%;
	min-width: 0;
	height: 20px;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	appearance: none;
	-webkit-appearance: none;
	--volume-fill-color: #ffffff;
	--volume-track-color: #404040;
	--volume-thumb-opacity: 0;
	--volume-thumb-scale: 0.88;
	cursor: pointer;
}

.volume-control:hover .volume-slider,
.volume-slider:focus-visible {
	--volume-fill-color: #1db954;
	--volume-thumb-opacity: 1;
	--volume-thumb-scale: 1;
}

.volume-slider::-webkit-slider-runnable-track {
	height: 4px;
	border-radius: 999px;
	background: linear-gradient(to right, var(--volume-fill-color) 0 var(--volume-percent), var(--volume-track-color) var(--volume-percent) 100%);
	transition: background 0.2s ease;
}

.volume-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 12px;
	height: 12px;
	margin-top: -4px;
	border: none;
	border-radius: 50%;
	background: #ffffff;
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
	opacity: var(--volume-thumb-opacity);
	transform: scale(var(--volume-thumb-scale));
	transition: opacity 0.15s ease, transform 0.15s ease;
}

.volume-slider::-moz-range-track {
	height: 4px;
	border: none;
	border-radius: 999px;
	background: var(--volume-track-color);
}

.volume-slider::-moz-range-progress {
	height: 4px;
	border: none;
	border-radius: 999px;
	background: var(--volume-fill-color);
}

.volume-slider::-moz-range-thumb {
	width: 12px;
	height: 12px;
	border: none;
	border-radius: 50%;
	background: #ffffff;
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
	opacity: var(--volume-thumb-opacity);
	transform: scale(var(--volume-thumb-scale));
	transition: opacity 0.15s ease, transform 0.15s ease;
}

.volume-slider::-ms-track {
	height: 4px;
	border-color: transparent;
	color: transparent;
	background: transparent;
}

.volume-slider::-ms-fill-lower {
	background: var(--volume-fill-color);
	border-radius: 999px;
}

.volume-slider::-ms-fill-upper {
	background: var(--volume-track-color);
	border-radius: 999px;
}

.volume-slider::-ms-thumb {
	width: 12px;
	height: 12px;
	border: none;
	border-radius: 50%;
	background: #ffffff;
	opacity: var(--volume-thumb-opacity);
	transform: scale(var(--volume-thumb-scale));
	transition: opacity 0.15s ease, transform 0.15s ease;
}
</style>