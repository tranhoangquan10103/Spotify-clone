<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import InputText from 'primevue/inputtext';
import LibraryTab from './left/LibraryTab.vue';
import TrackTab from './middle/TrackTab.vue';
import NowPlayingTab from './right/NowPlayingTab.vue';
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

const getSvgUrl = (name: string) => {
	return new URL(`../assets/svg/${name}.svg`, import.meta.url).href;
};
const menuItems = ref([
	{ label: 'Account', svgName: 'link' }, 
	{ label: 'Profile', svgName: 'person' },
	{ label: 'Recents', svgName: 'history' }, 
	{ label: 'Upgrade to Premium', svgName: 'link' },
	{ label: 'Support', svgName: 'link' },
	{ label: 'Download', svgName: 'link' },
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
							<button v-tooltip.bottom="'Home'" class="toolbar-icon-button" type="button" aria-label="Home">
								<img src="../assets/svg/home.svg" alt="Home" />
							</button>
							<div class="toolbar-search">
								<img class="toolbar-search-icon" src="../assets/svg/search.svg" alt="Search" />
								<InputText
									placeholder="What do you want to play?"
									class="toolbar-search-input"
								/>
							</div>
							<button v-tooltip.bottom="'Browse'" class="toolbar-icon-button" type="button" aria-label="Browse">
								<img src="../assets/svg/browse.svg" alt="Browse" />
							</button>
						</div>
						<div class="toolbar-right">
							<div v-if="!isAuthenticated" class="toolbar-auth">
								<button class="toolbar-auth-button" type="button" @click="goToSignUp">Sign up</button>
								<button class="toolbar-auth-button is-primary" type="button" @click="goToLogIn">Log in</button>
							</div>
							<div v-else class="toolbar-auth">
								<button v-tooltip.bottom="'Notifications'" class="toolbar-icon-button-right" type="button" aria-label="Notifications">
									<img src="../assets/svg/bell.svg" alt="Notifications" />
								</button>
								<button v-tooltip.bottom="'Friends'" class="toolbar-icon-button-right" type="button" aria-label="Friends">
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

				<!-- CONTAINER MIDDLE -->
				<div class="center-content">
					<LibraryTab />

					<!-- CONTAINER MAIN CONTENT -->
					<div class="content-section">
						<TrackTab />
					</div>

					<!-- CONTAINER SUBMAIN CONTENT -->
					<div class="song-section">
						<NowPlayingTab />
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
						<button v-tooltip.top="'Shuffle'" class="player-btn" type="button" aria-label="Shuffle">
							<img alt="Shuffle" src="../assets/svg/shuffle.svg">
						</button>
						<button v-tooltip.top="'Previous'" class="player-btn" type="button" aria-label="Previous">
							<img alt="Previous" src="../assets/svg/skip-previous.svg">
						</button>
						<button
							v-tooltip.top="playPauseLabel"
							class="player-btn player-play-btn"
							type="button"
							:aria-label="playPauseLabel"
							:disabled="!currentTrack"
							@click="togglePlay"
						>
							<img :alt="playPauseLabel" :src="playPauseIcon">
						</button>
						<button v-tooltip.top="'Next'" class="player-btn" type="button" aria-label="Next">
							<img alt="Next" src="../assets/svg/skip-next.svg">
						</button>
						<button v-tooltip.top="'Repeat'" class="player-btn" type="button" aria-label="Repeat">
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
						<button v-tooltip.top="'Lyrics'" class="player-btn" type="button" aria-label="Lyrics">
							<img alt="lyrics" src="../assets/svg/lyrics.svg">
						</button>
							<button v-tooltip.top="'Queue'" class="player-btn" type="button" aria-label="Queue">
							<img alt="Queue" src="../assets/svg/queue.svg">
						</button>
						<button v-tooltip.top="'Connect to a device'" class="player-btn" type="button" aria-label="Connect to a device">
							<img alt="Connect to a device" src="../assets/svg/connect-device.svg">
						</button>
						<button v-tooltip.top="'Mini player'" class="player-btn" type="button" aria-label="Mini player">
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