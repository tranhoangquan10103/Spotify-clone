<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { usePlayerStore } from '../stores/usePlayerStore';
import NowPlayingTransportControls from './NowPlayingTransportControls.vue';
import NowPlayingUtilityControls from './NowPlayingUtilityControls.vue';

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
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volumeStorageKey = 'spotify-player-volume';
const previousVolumeStorageKey = 'spotify-player-previous-volume';
const volume = ref(100);
const previousVolume = ref(100);
const isMuted = computed(() => volume.value === 0);
const fallbackCoverUrl = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW1wdmIwamRsMWs0MHdwdWdnMnM3b2F4andudXhkdmZkMHM4a2RxZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bdcVgamzkEGNB2hAl6/giphy.gif';

const getSvgUrl = (name: string) => new URL(`../assets/svg/${name}.svg`, import.meta.url).href;

const currentTrack = computed(() => playerStore.currentTrack);
const displayTitle = computed(() => currentTrack.value?.trackName);
const displayArtist = computed(() => currentTrack.value?.artistsText);
const displayCover = computed(() => currentTrack.value?.coverUrl ?? fallbackCoverUrl);
const isShuffleActive = computed(() => playerStore.isShuffled);
const shuffleIcon = computed(() => (isShuffleActive.value ? getSvgUrl('shuffle-active') : getSvgUrl('shuffle')));
const repeatLabel = computed(() => {
	if (playerStore.repeatMode === 'one') {
		return 'Repeat one';
	}

	if (playerStore.repeatMode === 'all') {
		return 'Repeat all';
	}

	return 'Repeat';
});
const repeatIcon = computed(() => {
	if (playerStore.repeatMode === 'one') {
		return getSvgUrl('repeat-one-active');
	}

	if (playerStore.repeatMode === 'all') {
		return getSvgUrl('repeat-active');
	}

	return getSvgUrl('repeat');
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
	if (!audio) {
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

const handleVolumeInput = (nextVolume: number) => {
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

const seekToTime = (nextTime: number) => {
	const audio = audioRef.value;
	if (!audio || !resolvedDuration.value) {
		return;
	}

	const clampedTime = Math.min(resolvedDuration.value, Math.max(0, nextTime));
	audio.currentTime = clampedTime;
	currentTime.value = clampedTime;
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

		<NowPlayingTransportControls
			:is-shuffle-active="isShuffleActive"
			:shuffle-icon="shuffleIcon"
			:play-pause-label="playPauseLabel"
			:play-pause-icon="playPauseIcon"
			:repeat-icon="repeatIcon"
			:repeat-label="repeatLabel"
			:current-time-label="currentTimeLabel"
			:duration-label="durationLabel"
			:progress-percent="progressPercent"
			:resolved-duration="resolvedDuration"
			:has-track="!!currentTrack"
			@toggle-shuffle="toggleShuffle"
			@skip-previous="skipPrevious"
			@toggle-play="togglePlay"
			@skip-next="skipNext"
			@toggle-repeat="toggleRepeat"
			@seek="seekToTime"
		/>
		<NowPlayingUtilityControls
			:active-right-tab="activeRightTab"
			:active-middle-tab="activeMiddleTab"
			:volume="volume"
			@toggle-right-tab="emit('toggle-right-tab', $event)"
			@toggle-middle-tab="emit('toggle-middle-tab', $event)"
			@toggle-mute="toggleMute"
			@volume-input="handleVolumeInput"
		/>

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
	background: transparent;
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

.now-playing-audio {
	display: none;
}
</style>