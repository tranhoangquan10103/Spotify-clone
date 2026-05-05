<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import InputText from 'primevue/inputtext';

import LibraryTab from './left/LibraryTab.vue';

import AlbumTab from './middle/AlbumTab.vue';
import ArtistTab from './middle/ArtistTab.vue';
import LyricsTab from './middle/LyricsTab.vue';
import PlaylistTab from './middle/PlaylistTab.vue';
import ProfileTab from './middle/ProfileTab.vue';
import SettingsTab from './middle/SettingsTab.vue';
import TrackTab from './middle/TrackTab.vue';

import NowPlayingTab from './right/NowPlayingTab.vue';
import QueueTab from './right/QueueTab.vue';
import ConnectTab from './right/ConnectTab.vue';

import { useAuthStore } from '../stores/useAuthStore';
import { usePlayerStore } from '../stores/usePlayerStore';


const menu = ref();
const router = useRouter();
const authStore = useAuthStore();
const playerStore = usePlayerStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const progressBarRef = ref<HTMLDivElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isScrubbing = ref(false);
const fallbackCoverUrl = 'https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e';
const centerContentRef = ref<HTMLDivElement | null>(null);
const leftPanelWidth = ref(0);
const middlePanelWidth = ref(0);
const rightPanelWidth = ref(0);
const resizerWidth = 6;
const minSideWidth = 260;
const minMiddleWidth = 520;
const compactBreakpoint = minMiddleWidth + minSideWidth * 2 + resizerWidth * 2;
const isCompactLayout = ref(false);
const savedPanelWidths = ref({ left: 0, middle: 0, right: 0 });
type RightTab = 'nowPlaying' | 'queue' | 'connect';
const activeRightTab = ref<RightTab>('nowPlaying');
type MiddleTab = 'album' | 'artist' | 'feed' | 'lyrics' | 'profile' | 'recents' | 'settings' | 'track';
const activeMiddleTab = ref<MiddleTab>('track');
let activeResizer: 'left' | 'right' | null = null;
let resizeStartX = 0;
let resizeStartLeft = 0;
let resizeStartRight = 0;

const getSvgUrl = (name: string) => {
	return new URL(`../assets/svg/${name}.svg`, import.meta.url).href;
};
const menuItems = ref([
	{ label: 'Account', svgName: 'link' }, 
	{ label: 'Profile', svgName: 'person' },
	{ label: 'Recents', svgName: 'history' }, 
	{ label: 'Upgrade to Premium', svgName: 'link', command: () => window.open('https://www.spotify.com/vn-en/premium/?ref=web_loggedin_upgrade_menu', '_blank') },
	{ label: 'Support', svgName: 'link', command: () => window.open('https://support.spotify.com/', '_blank') },
	{ label: 'Download', svgName: 'link', command: () => window.open('https://spotify.com/download', '_blank') },
	{ label: 'Settings', svgName: 'settings' },
	{ separator: true },
	{ label: 'Log out', svgName: 'logout', command: () => authStore.logOut() }
]);

const toggle = (event: Event) => {
	menu.value?.toggle(event);
};

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentTrack = computed(() => playerStore.currentTrack);
const displayTitle = computed(() => currentTrack.value?.trackName ?? 'Select a track');
const displayArtist = computed(() => currentTrack.value?.artistsText ?? '');
const displayCover = computed(() => currentTrack.value?.coverUrl ?? fallbackCoverUrl);
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

const leftPanelStyle = computed(() => ({
	flex: `0 0 ${leftPanelWidth.value}px`,
	width: `${leftPanelWidth.value}px`,
}));
const middlePanelStyle = computed(() => ({
	flex: `0 0 ${middlePanelWidth.value}px`,
	width: `${middlePanelWidth.value}px`,
}));
const rightPanelStyle = computed(() => ({
	flex: `0 0 ${rightPanelWidth.value}px`,
	width: `${rightPanelWidth.value}px`,
}));

const toggleRightTab = (tab: RightTab) => {
	activeRightTab.value = activeRightTab.value === tab ? 'nowPlaying' : tab;
};

const getCenterWidth = () => {
	const container = centerContentRef.value;
	if (!container) {
		return 0;
	}
	return container.getBoundingClientRect().width;
};

const getAvailableCenterWidth = (containerWidth: number, includeResizers = true) => {
	const reserved = includeResizers ? resizerWidth * 2 : 0;
	return Math.max(0, containerWidth - reserved);
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));
const setPanelWidths = (left: number, middle: number, right: number) => {
	leftPanelWidth.value = left;
	middlePanelWidth.value = middle;
	rightPanelWidth.value = right;
};

const initializePanels = (availableWidth: number) => {
	if (!availableWidth) {
		return;
	}
	const maxSideWidth = Math.max(minSideWidth, Math.floor((availableWidth - minMiddleWidth) / 2));
	let sideWidth = Math.round(availableWidth * 0.22);
	sideWidth = clamp(sideWidth, minSideWidth, maxSideWidth);
	let middleWidth = availableWidth - sideWidth * 2;
	if (middleWidth < minMiddleWidth) {
		middleWidth = minMiddleWidth;
		sideWidth = Math.max(minSideWidth, Math.floor((availableWidth - middleWidth) / 2));
	}

	setPanelWidths(sideWidth, availableWidth - sideWidth * 2, sideWidth);
};

const syncPanelsToContainer = (availableWidth: number) => {
	if (!availableWidth) {
		return;
	}
	const total = leftPanelWidth.value + middlePanelWidth.value + rightPanelWidth.value;
	if (!total) {
		initializePanels(availableWidth);
		return;
	}

	let nextLeft = Math.round((leftPanelWidth.value / total) * availableWidth);
	let nextRight = Math.round((rightPanelWidth.value / total) * availableWidth);
	let nextMiddle = availableWidth - nextLeft - nextRight;
	if (nextLeft < minSideWidth || nextRight < minSideWidth || nextMiddle < minMiddleWidth) {
		initializePanels(availableWidth);
		return;
	}

	setPanelWidths(nextLeft, nextMiddle, nextRight);
};

const restorePanelWidths = (availableWidth: number) => {
	const saved = savedPanelWidths.value;
	const total = saved.left + saved.middle + saved.right;
	if (!total) {
		initializePanels(availableWidth);
		return;
	}
	let nextLeft = Math.round((saved.left / total) * availableWidth);
	let nextRight = Math.round((saved.right / total) * availableWidth);
	let nextMiddle = availableWidth - nextLeft - nextRight;
	if (nextLeft < minSideWidth || nextRight < minSideWidth || nextMiddle < minMiddleWidth) {
		initializePanels(availableWidth);
		return;
	}
	setPanelWidths(nextLeft, nextMiddle, nextRight);
};

const handleCenterResize = () => {
	const containerWidth = getCenterWidth();
	if (!containerWidth) {
		return;
	}

	const shouldCompact = containerWidth <= compactBreakpoint;
	if (shouldCompact) {
		if (!isCompactLayout.value) {
			savedPanelWidths.value = {
				left: leftPanelWidth.value,
				middle: middlePanelWidth.value,
				right: rightPanelWidth.value,
			};
		}
		isCompactLayout.value = true;
		const availableWidth = getAvailableCenterWidth(containerWidth, false);
		setPanelWidths(0, availableWidth, 0);
		return;
	}

	const availableWidth = getAvailableCenterWidth(containerWidth, true);
	if (isCompactLayout.value) {
		isCompactLayout.value = false;
		restorePanelWidths(availableWidth);
		return;
	}

	syncPanelsToContainer(availableWidth);
};

const stopResize = () => {
	activeResizer = null;
	window.removeEventListener('pointermove', handleResizeMove);
	window.removeEventListener('pointerup', stopResize);
	document.body.style.cursor = '';
};

const startResize = (resizer: 'left' | 'right', event: PointerEvent) => {
	if (isCompactLayout.value) {
		return;
	}
	const containerWidth = getCenterWidth();
	const availableWidth = getAvailableCenterWidth(containerWidth, true);
	if (!availableWidth) {
		return;
	}

	event.preventDefault();
	activeResizer = resizer;
	resizeStartX = event.clientX;
	resizeStartLeft = leftPanelWidth.value;
	resizeStartRight = rightPanelWidth.value;
	window.addEventListener('pointermove', handleResizeMove);
	window.addEventListener('pointerup', stopResize);
	document.body.style.cursor = 'col-resize';
};

const handleResizeMove = (event: PointerEvent) => {
	if (!activeResizer) {
		return;
	}
	const containerWidth = getCenterWidth();
	const availableWidth = getAvailableCenterWidth(containerWidth, true);
	if (!availableWidth) {
		return;
	}
	const deltaX = event.clientX - resizeStartX;

	if (activeResizer === 'left') {
		const fixedRight = resizeStartRight;
		let nextLeft = clamp(
			resizeStartLeft + deltaX,
			minSideWidth,
			availableWidth - fixedRight - minMiddleWidth,
		);
		let nextMiddle = availableWidth - fixedRight - nextLeft;
		if (nextMiddle < minMiddleWidth) {
			nextMiddle = minMiddleWidth;
			nextLeft = availableWidth - fixedRight - nextMiddle;
		}
		setPanelWidths(nextLeft, nextMiddle, fixedRight);
		return;
	}

	const fixedLeft = resizeStartLeft;
	let nextRight = clamp(
		resizeStartRight - deltaX,
		minSideWidth,
		availableWidth - fixedLeft - minMiddleWidth,
	);
	let nextMiddle = availableWidth - fixedLeft - nextRight;
	if (nextMiddle < minMiddleWidth) {
		nextMiddle = minMiddleWidth;
		nextRight = availableWidth - fixedLeft - nextMiddle;
	}
	setPanelWidths(fixedLeft, nextMiddle, nextRight);
};

const goToSignUp = () => {
	router.push('/signup');
};

const goToLogIn = () => {
	router.push('/login');
};

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
	stopResize();
	window.removeEventListener('resize', handleCenterResize);
	window.removeEventListener('pointermove', onProgressPointerMove);
	window.removeEventListener('pointerup', onProgressPointerUp);
});

onMounted(() => {
	handleCenterResize();
	window.addEventListener('resize', handleCenterResize);
});

</script>

<template>
	<div class="app-container">
		<main class="main-content">
			<div class="all-container">
				<!-- CONTAINER TOOLBAR -->
				<div class="toolbar-section">
					<div class="toolbar">
						<div class="toolbar-left">
							<img class="toolbar-logo" src="../assets/svg/logo.svg" alt="Spotify" />
						</div>
						<div class="toolbar-center">
							<button v-tooltip.bottom="{ value: 'Home', showDelay: 300 }" class="toolbar-icon-button" type="button" aria-label="Home">
								<img src="../assets/svg/home.svg" alt="Home" />
							</button>
							<div class="toolbar-search">
								<img class="toolbar-search-icon" src="../assets/svg/search.svg" alt="Search" />
								<InputText
									placeholder="What do you want to play?"
									class="toolbar-search-input"
								/>
							</div>
							<button v-tooltip.bottom="{ value: 'Browse', showDelay: 300 }" class="toolbar-icon-button" type="button" aria-label="Browse">
								<img src="../assets/svg/browse.svg" alt="Browse" />
							</button>
						</div>
						<div class="toolbar-right">
							<div v-if="!isAuthenticated" class="toolbar-auth">
								<button class="toolbar-auth-button" type="button" @click="goToSignUp">Sign up</button>
								<button class="toolbar-auth-button is-primary" type="button" @click="goToLogIn">Log in</button>
							</div>
							<div v-else class="toolbar-auth">
								<button v-tooltip.bottom="{ value: 'Notifications', showDelay: 300 }" class="toolbar-icon-button-right" type="button" aria-label="Notifications">
									<img src="../assets/svg/bell.svg" alt="Notifications" />
								</button>
								<button v-tooltip.bottom="{ value: 'Friends', showDelay: 300 }" class="toolbar-icon-button-right" type="button" aria-label="Friends">
									<img src="../assets/svg/friends.svg" alt="Friends" />
								</button>
								<Avatar type="button" @click="toggle" aria-haspopup="true" aria-controls="overlay_tmenu" image="https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png" shape="circle" class="toolbar-avatar"/>
								<Menu ref="menu" :popup="true" id="overlay_tmenu" :model="menuItems" class="toolbar-menu">
									<template #item="{ item, props }">
										<a v-bind="props.action" class="flex align-items-center custom-menu-item">
											<span class="menu-label">{{ item.label }}</span>
											<img 
												v-if="item.svgName" 
												:src="getSvgUrl(item.svgName)"
												class="menu-svg-icon" 
											/>
										</a>
									</template>
								</Menu>
							</div>
						</div>
					</div>
				</div>

				<!-- CONTAINER CENTER MIDDLE -->
				<div class="center-content" :class="{ 'is-compact': isCompactLayout }" ref="centerContentRef">
					<!-- CONTAINER LEFT CONTENT -->
					<div class="center-panel library-panel" :style="leftPanelStyle">
						<LibraryTab />
					</div>

					<div
						class="layout-resizer"
						role="separator"
						aria-orientation="vertical"
						@pointerdown="startResize('left', $event)"
					></div>

					<!-- CONTAINER MIDDLE CONTENT -->
					<div class="center-panel content-section" :style="middlePanelStyle">
						<TrackTab v-if="activeMiddleTab === 'track'" />
						<AlbumTab v-else-if="activeMiddleTab === 'album'" />
						<ArtistTab v-else-if="activeMiddleTab === 'artist'" />
						<LyricsTab v-else-if="activeMiddleTab === 'lyrics'" />
						<PlaylistTab v-else-if="activeMiddleTab === 'feed'" />
						<ProfileTab v-else-if="activeMiddleTab === 'profile'" />
						<SettingsTab v-else />
					</div>

					<div
						class="layout-resizer"
						role="separator"
						aria-orientation="vertical"
						@pointerdown="startResize('right', $event)"
					></div>

					<!-- CONTAINER RIGHT CONTENT -->
					<div class="center-panel song-section" :style="rightPanelStyle">
						<NowPlayingTab v-if="activeRightTab === 'nowPlaying'" />
						<QueueTab v-else-if="activeRightTab === 'queue'" />
						<ConnectTab v-else />
					</div>
				</div>

				<!-- CONTAINER PLAYING SONG -->
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
							<div class="now-playing-title">{{ displayTitle }}</div>
							<div class="now-playing-artist">{{ displayArtist }}</div>
						</div>
					</div>

					<!-- Center: Player Controls -->
					<div class="now-playing-center">
						<button v-tooltip.top="{ value: 'Shuffle', showDelay: 300 }" class="player-btn" type="button" aria-label="Shuffle">
							<img alt="Shuffle" src="../assets/svg/shuffle.svg">
						</button>
						<button v-tooltip.top="{ value: 'Previous', showDelay: 300 }" class="player-btn" type="button" aria-label="Previous">
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
						<button v-tooltip.top="{ value: 'Next', showDelay: 300 }" class="player-btn" type="button" aria-label="Next">
							<img alt="Next" src="../assets/svg/skip-next.svg">
						</button>
						<button v-tooltip.top="{ value: 'Repeat', showDelay: 300 }" class="player-btn" type="button" aria-label="Repeat">
							<img alt="Repeat" src="../assets/svg/repeat.svg">
						</button>
					</div>

					<!-- Progress Bar -->
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

					<!-- Extra Controls -->
					<div class="now-playing-right">
						<i class="pi pi-shuffle"></i>
						<button v-tooltip.top="{ value: 'Lyrics', showDelay: 300 }" class="player-btn" type="button" aria-label="Lyrics">
							<img alt="lyrics" src="../assets/svg/lyrics.svg">
						</button>
							<button
								v-tooltip.top="{ value: 'Queue', showDelay: 300 }"
								class="player-btn"
								type="button"
								aria-label="Queue"
								:aria-pressed="activeRightTab === 'queue'"
								@click="toggleRightTab('queue')"
							>
							<img alt="Queue" src="../assets/svg/queue.svg">
						</button>
							<button
								v-tooltip.top="{ value: 'Connect to a device', showDelay: 300 }"
								class="player-btn"
								type="button"
								aria-label="Connect to a device"
								:aria-pressed="activeRightTab === 'connect'"
								@click="toggleRightTab('connect')"
							>
							<img alt="Connect to a device" src="../assets/svg/connect-device.svg">
						</button>
						<button v-tooltip.top="{ value: 'Mini player', showDelay: 300 }" class="player-btn" type="button" aria-label="Mini player">
							<img alt="Mini player" src="../assets/svg/mini-player.svg">
						</button>
					</div>
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
		</main>
		
		
	</div>
</template>

<style>
@import '../assets/style/home.css';
</style>  