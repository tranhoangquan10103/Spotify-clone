<script setup lang="ts">
import { computed } from 'vue';

type RightTab = 'nowPlaying' | 'queue' | 'connect';
type MiddleTab = 'album' | 'artist' | 'feed' | 'lyrics' | 'profile' | 'recents' | 'settings' | 'track' | 'trackdetail';

const props = defineProps<{
	activeRightTab: RightTab;
	activeMiddleTab: MiddleTab;
	volume: number;
}>();

const emit = defineEmits<{
	(event: 'toggle-right-tab', tab: RightTab): void;
	(event: 'toggle-middle-tab', tab: MiddleTab): void;
	(event: 'toggle-mute'): void;
	(event: 'volume-input', nextVolume: number): void;
}>();

const getSvgUrl = (name: string) => new URL(`../assets/svg/${name}.svg`, import.meta.url).href;

const lyricsIcon = computed(() => (props.activeMiddleTab === 'lyrics' ? getSvgUrl('lyrics-active') : getSvgUrl('lyrics')));
const queueIcon = computed(() => (props.activeRightTab === 'queue' ? getSvgUrl('queue-active') : getSvgUrl('queue')));
const connectIcon = computed(() => (props.activeRightTab === 'connect' ? getSvgUrl('connect-device-active') : getSvgUrl('connect-device')));

const isMuted = computed(() => props.volume === 0);
const volumeIconName = computed(() => {
	if (props.volume === 0) {
		return 'muted';
	}

	if (props.volume <= 33) {
		return 'volume-1';
	}

	if (props.volume <= 66) {
		return 'volume-2';
	}

	return 'volume-3';
});
const volumeIconUrl = computed(() => getSvgUrl(volumeIconName.value));

const handleVolumeInput = (event: Event) => {
	const input = event.target as HTMLInputElement | null;
	if (!input) {
		return;
	}

	const nextVolume = Number(input.value);
	if (!Number.isFinite(nextVolume)) {
		return;
	}

	emit('volume-input', nextVolume);
};
</script>

<template>
	<div class="now-playing-right">
		<button
			v-tooltip.top="{ value: 'Lyrics', showDelay: 300 }"
			class="player-btn"
			type="button"
			aria-label="Lyrics"
			:aria-pressed="activeMiddleTab === 'lyrics'"
			@click="emit('toggle-middle-tab', 'lyrics')"
		>
			<img :alt="'Lyrics'" :src="lyricsIcon">
		</button>
		<button
			v-tooltip.top="{ value: 'Queue', showDelay: 300 }"
			class="player-btn"
			type="button"
			aria-label="Queue"
			:aria-pressed="activeRightTab === 'queue'"
			@click="emit('toggle-right-tab', 'queue')"
		>
			<img :alt="'Queue'" :src="queueIcon">
		</button>
		<button
			v-tooltip.top="{ value: 'Connect to a device', showDelay: 300 }"
			class="player-btn"
			type="button"
			aria-label="Connect to a device"
			:aria-pressed="activeRightTab === 'connect'"
			@click="emit('toggle-right-tab', 'connect')"
		>
			<img :alt="'Connect'" :src="connectIcon">
		</button>
		<div class="volume-control">
			<button
				v-tooltip.top="{ value: isMuted ? 'Unmute' : 'Mute', showDelay: 300 }"
				class="volume-toggle-button"
				type="button"
				:aria-label="isMuted ? 'Unmute' : 'Mute'"
				:aria-pressed="isMuted"
				@click="emit('toggle-mute')"
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
</template>

<style scoped>
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

.now-playing-right .player-btn {
	width: 2rem;
	height: 2rem;
	font-size: 0.95rem;
	padding: 0;
	background: transparent;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: transform 0.1s ease;
}

.now-playing-right .player-btn:hover {
	transform: scale(1.05);
}

.now-playing-right .player-btn img {
	width: 16px;
	height: 16px;
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
