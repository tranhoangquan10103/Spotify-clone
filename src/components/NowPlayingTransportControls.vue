<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
	isShuffleActive: boolean;
	playPauseLabel: string;
	playPauseIcon: string;
	repeatLabel: string;
	currentTimeLabel: string;
	durationLabel: string;
	progressPercent: number;
	resolvedDuration: number;
	hasTrack: boolean;
}>();

const emit = defineEmits<{
	(event: 'toggle-shuffle'): void;
	(event: 'skip-previous'): void;
	(event: 'toggle-play'): void;
	(event: 'skip-next'): void;
	(event: 'toggle-repeat'): void;
	(event: 'seek', nextTime: number): void;
}>();

const progressBarRef = ref<HTMLDivElement | null>(null);
const isScrubbing = ref(false);

const emitSeek = (clientX: number) => {
	const bar = progressBarRef.value;
	if (!bar || !props.resolvedDuration) {
		return;
	}

	const rect = bar.getBoundingClientRect();
	if (rect.width <= 0) {
		return;
	}

	const clampedX = Math.min(rect.width, Math.max(0, clientX - rect.left));
	const nextTime = (clampedX / rect.width) * props.resolvedDuration;
	emit('seek', nextTime);
};

const onProgressPointerMove = (event: PointerEvent) => {
	if (!isScrubbing.value) {
		return;
	}

	emitSeek(event.clientX);
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
	if (!props.resolvedDuration) {
		return;
	}

	isScrubbing.value = true;
	emitSeek(event.clientX);
	window.addEventListener('pointermove', onProgressPointerMove);
	window.addEventListener('pointerup', onProgressPointerUp);
};

onBeforeUnmount(() => {
	window.removeEventListener('pointermove', onProgressPointerMove);
	window.removeEventListener('pointerup', onProgressPointerUp);
});
</script>

<template>
	<div class="now-playing-center">
		<button v-tooltip.top="{ value: 'Shuffle', showDelay: 300 }" class="player-btn" type="button" aria-label="Shuffle" :class="{ 'is-active': isShuffleActive }" @click="emit('toggle-shuffle')">
			<img alt="Shuffle" src="../assets/svg/shuffle.svg">
		</button>
		<button v-tooltip.top="{ value: 'Previous', showDelay: 300 }" class="player-btn" type="button" aria-label="Previous" @click="emit('skip-previous')">
			<img alt="Previous" src="../assets/svg/skip-previous.svg">
		</button>
		<button
			v-tooltip.top="{ value: playPauseLabel, showDelay: 300 }"
			class="player-btn player-play-btn"
			type="button"
			:aria-label="playPauseLabel"
			:disabled="!hasTrack"
			@click="emit('toggle-play')"
		>
			<img :alt="playPauseLabel" :src="playPauseIcon">
		</button>
		<button v-tooltip.top="{ value: 'Next', showDelay: 300 }" class="player-btn" type="button" aria-label="Next" @click="emit('skip-next')">
			<img alt="Next" src="../assets/svg/skip-next.svg">
		</button>
		<button v-tooltip.top="{ value: repeatLabel, showDelay: 300 }" class="player-btn" type="button" :aria-label="repeatLabel" :class="{ 'is-active': repeatLabel !== 'Repeat' }" @click="emit('toggle-repeat')">
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
</template>

<style scoped>
.now-playing-center {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	grid-column: 2;
	grid-row: 1;
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
</style>
