<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import LibraryTab from './left/LibraryTab.vue';

import AlbumTab from './middle/AlbumTab.vue';
import ArtistTab from './middle/ArtistTab.vue';
import LyricsTab from './middle/LyricsTab.vue';
import PlaylistTab from './middle/PlaylistTab.vue';
import ProfileTab from './middle/ProfileTab.vue';
import SettingsTab from './middle/SettingsTab.vue';
import TrackTab from './middle/TrackTab.vue';
import TrackDetailTab from './middle/TrackDetailTab.vue';

import NowPlayingTab from './right/NowPlayingTab.vue';
import QueueTab from './right/QueueTab.vue';
import ConnectTab from './right/ConnectTab.vue';

import NowPlayingSection from '../components/NowPlayingSection.vue';
import ToolbarSection from '../components/ToolbarSection.vue';


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
type MiddleTab = 'album' | 'artist' | 'feed' | 'lyrics' | 'profile' | 'recents' | 'settings' | 'track' | 'trackdetail';
const activeMiddleTab = ref<MiddleTab>('track');
let activeResizer: 'left' | 'right' | null = null;
let resizeStartX = 0;
let resizeStartLeft = 0;
let resizeStartRight = 0;

const toggleRightTab = (tab: RightTab) => {
	activeRightTab.value = activeRightTab.value === tab ? 'nowPlaying' : tab;
};
const toggleMiddleTab = (tab: MiddleTab) => {
	activeMiddleTab.value = activeMiddleTab.value === tab ? 'track' : tab;
};
const handleGoHome = () => {
  activeMiddleTab.value = 'track';
};

const getPanelStyle = (widthValue: number) => ({
    flex: `0 0 ${widthValue}px`,
    width: `${widthValue}px`,
});
const leftPanelStyle = computed(() => getPanelStyle(leftPanelWidth.value));
const middlePanelStyle = computed(() => getPanelStyle(middlePanelWidth.value));
const rightPanelStyle = computed(() => getPanelStyle(rightPanelWidth.value));

const getCenterWidth = () => centerContentRef.value?.getBoundingClientRect().width || 0;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const setPanelWidths = (left: number, middle: number, right: number) => {
    leftPanelWidth.value = left;
    middlePanelWidth.value = middle;
    rightPanelWidth.value = right;
};
const getAvailableCenterWidth = (containerWidth: number, includeResizers = true) => 
    Math.max(0, containerWidth - (includeResizers ? resizerWidth * 2 : 0));

const initializePanels = (availableWidth: number) => {
    if (!availableWidth) return;
    const maxSideWidth = Math.max(minSideWidth, Math.floor((availableWidth - minMiddleWidth) / 2));
    const sideWidth = clamp(Math.round(availableWidth * 0.22), minSideWidth, maxSideWidth);
    const middleWidth = Math.max(minMiddleWidth, availableWidth - sideWidth * 2);
    const finalSide = middleWidth === minMiddleWidth 
        ? Math.max(minSideWidth, Math.floor((availableWidth - middleWidth) / 2)) 
        : sideWidth;
        
    setPanelWidths(finalSide, availableWidth - finalSide * 2, finalSide);
};

const applyProportionalWidths = (baseWidths: {left: number, middle: number, right: number}, availableWidth: number) => {
    const total = baseWidths.left + baseWidths.middle + baseWidths.right;
    if (!total) return initializePanels(availableWidth);

    const nextLeft = Math.round((baseWidths.left / total) * availableWidth);
    const nextRight = Math.round((baseWidths.right / total) * availableWidth);
    const nextMiddle = availableWidth - nextLeft - nextRight;

    if (nextLeft < minSideWidth || nextRight < minSideWidth || nextMiddle < minMiddleWidth) {
        return initializePanels(availableWidth);
    }
    setPanelWidths(nextLeft, nextMiddle, nextRight);
};

const handleCenterResize = () => {
    const containerWidth = getCenterWidth();
    if (!containerWidth) return;

    if (containerWidth <= compactBreakpoint) {
        if (!isCompactLayout.value) {
            savedPanelWidths.value = { left: leftPanelWidth.value, middle: middlePanelWidth.value, right: rightPanelWidth.value };
        }
        isCompactLayout.value = true;
        setPanelWidths(0, getAvailableCenterWidth(containerWidth, false), 0);
        return;
    }

    const availableWidth = getAvailableCenterWidth(containerWidth, true);
    if (isCompactLayout.value) {
        isCompactLayout.value = false;
        applyProportionalWidths(savedPanelWidths.value, availableWidth);
    } else {
        applyProportionalWidths({
            left: leftPanelWidth.value, middle: middlePanelWidth.value, right: rightPanelWidth.value
        }, availableWidth);
    }
};

const handleResizeMove = (event: PointerEvent) => {
    if (!activeResizer) return;
    const availableWidth = getAvailableCenterWidth(getCenterWidth(), true);
    if (!availableWidth) return;

    const deltaX = event.clientX - resizeStartX;
    const isLeft = activeResizer === 'left';
    
    const fixedWidth = isLeft ? resizeStartRight : resizeStartLeft;
    const maxAdjustableWidth = availableWidth - fixedWidth - minMiddleWidth;

    const baseTargetWidth = isLeft ? resizeStartLeft + deltaX : resizeStartRight - deltaX;
    const newTargetWidth = clamp(baseTargetWidth, minSideWidth, maxAdjustableWidth);
    
    const newMiddleWidth = availableWidth - fixedWidth - newTargetWidth;

    if (isLeft) {
        setPanelWidths(newTargetWidth, newMiddleWidth, fixedWidth);
    } else {
        setPanelWidths(fixedWidth, newMiddleWidth, newTargetWidth);
    }
};

const startResize = (resizer: 'left' | 'right', event: PointerEvent) => {
    if (isCompactLayout.value || !getAvailableCenterWidth(getCenterWidth(), true)) return;
    event.preventDefault();
    activeResizer = resizer;
    resizeStartX = event.clientX;
    resizeStartLeft = leftPanelWidth.value;
    resizeStartRight = rightPanelWidth.value;
    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', stopResize);
    document.body.style.cursor = 'grabbing';
};

const stopResize = () => {
    activeResizer = null;
    window.removeEventListener('pointermove', handleResizeMove);
    window.removeEventListener('pointerup', stopResize);
    document.body.style.cursor = '';
};

onBeforeUnmount(() => {
	stopResize();
	window.removeEventListener('resize', handleCenterResize);
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
        <ToolbarSection @go-home="handleGoHome" />

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
						<TrackDetailTab v-else-if="activeMiddleTab === 'trackdetail'" />
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

				<NowPlayingSection
					:active-right-tab="activeRightTab"
					:active-middle-tab="activeMiddleTab"
					@toggle-right-tab="toggleRightTab"
					@toggle-middle-tab="toggleMiddleTab"
				/>

			</div>
		</main>
		
		
	</div>
</template>

<style>
.toolbar-menu .p-menuitem-link {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.toolbar-menu .p-menuitem-icon {
  order: 2 !important;
  margin-left: 12px !important;
  margin-right: 0 !important;
}

.toolbar-menu .p-menuitem-text {
  order: 1 !important;
}

.avatar-tiered-menu .p-menuitem-link {
  background: #282828;
  color: #fff;
  border-radius: 3px;
}

.avatar-tiered-menu .p-menuitem-link {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.avatar-tiered-menu .p-menuitem-icon {
  order: 2;
  margin-left: 12px;
  margin-right: 0;
}

.avatar-tiered-menu .p-menuitem-text {
  order: 1;
}
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #000000;
}

.app-container {
  display: flex;
  height: 100vh;
}

.main-content {
  display: flex;
  flex-grow: 1;
  background: #000000;
  overflow: hidden;
  color: white;
}

.all-container{
  display: flex;
  flex-direction: column;
  margin: 9px;
  height: auto;
  flex-grow: 1;
  overflow: hidden;
}

.all-container > * {
  display: flex;
  border-radius: 16px;
  padding: 10px;
  flex: 1;
  background-color: #121212;
  overflow: hidden;
}

.toolbar-section{
  display: flex;
  gap: 9px;
  height: auto;
  max-height: 3.5rem;
  background: #000000;
  flex: 0 0 auto;
  padding: 0;
  margin-bottom: 7px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  height: 3.5rem;
  padding: 0 1rem 0 1rem;
  background: #000000;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.toolbar-logo {
  width: 50px;
  height: 50px;
  display: block;
  filter: brightness(0) invert(1);
}

.toolbar-icon-button,
.toolbar-icon-button-right {
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 999px;
  border: none;
  background: #1f1f1f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.toolbar-icon-button:hover,
.toolbar-icon-button-right:hover{
  transform: scale(1.05);
}

.toolbar-icon-button-right {
  background: transparent;
}

.toolbar-icon-button img {
  width: 1.5rem;
  height: 1.5rem;
  display: block;
}

.toolbar-search {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #1f1f1f;
  border-radius: 999px;
  padding: 0 0.9rem;
  margin-top: 0px;
  height: 2.9rem;
  width: clamp(14rem, 36vw, 28rem);
}

.toolbar-search-icon {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.toolbar-search-icon:hover{
  transform: scale(1.1);
}

.toolbar-search-input.p-inputtext {
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  color: #eaeaea;
  font-size: 0.95rem;
  padding: 0;
  box-shadow: none;
}

.toolbar-search-input.p-inputtext::placeholder {
  color: #b3b3b3;
}

.toolbar-search-input.p-inputtext:focus {
  outline: none;
  box-shadow: none;
}

.toolbar-avatar{
  width: 48px;
  height: 48px;
  border: #292929 solid 8px;
  cursor: pointer;
}

.toolbar-auth {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.toolbar-auth-button {
  height: 2.6rem;
  padding: 0 1.3rem;
  border-radius: 999px;
  border: 1px solid #3a3a3a;
  background: transparent;
  color: #e5e5e5;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
}

.toolbar-auth-button:hover {
  transform: translateY(-1px);
  border-color: #5a5a5a;
  background: rgba(255, 255, 255, 0.06);
}

.toolbar-auth-button.is-primary {
  background: #ffffff;
  color: #111111;
  border-color: #ffffff;
}

.toolbar-auth-button.is-primary:hover {
  background: #f2f2f2;
  border-color: #f2f2f2;
}

.toolbar-menu {
  margin-top: 0.5rem;
  background: #282828;
  border: none;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  border-radius: 3px;
  padding: 5px;
  width: 300px;
  font-size: 14px;
}

.p-menu-list {
  padding: 4px;
  border: none;
}

.p-menuitem,
.p-menuitem-content {
  background: transparent;
  border: none;
}

.p-menuitem-link {
  padding: 8px 8px 8px 12px;
}

.p-menuitem-link:hover {
  background: #3E3E3E;
  border-radius: 3px;
}

.custom-menu-item{
  color: #d3d3d3;
}

.p-menuitem-separator {
  border-top: 1px solid #4e4e4e;
}

.menu-svg-icon {
  width: 20px;
  height: 20px;
}

.p-menu.toolbar-menu.p-menu-overlay {
    margin-top: 12px !important;
}

.center-content{
  display: flex;
  gap: 5px;
  height: auto;
  overflow: hidden;
  background: #000000;
  padding: 0px;
  flex-grow: 10;
  align-items: stretch;
}

.center-panel {
  background: #121212;
  border-radius: 12px;
  padding: 10px;
  overflow: hidden;
  min-width: 0;
}

.library-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.layout-resizer {
  width: 6px;
  cursor: grab;
  position: relative;
  touch-action: none;
  transition: background-color .15s ease-out, opacity .25s ease-out;
}

.layout-resizer:active {
  cursor: grabbing;
}

.layout-resizer::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 999px;
}

.layout-resizer:hover::after {
  background: #7c7c7c;
  transition: background-color .15s ease-out,opacity .25s ease-out;
}

.layout-resizer:active::after {
  background: #f2f2f2;
  transition: background-color .15s ease-out,opacity .25s ease-out;
}

.center-content.is-compact .layout-resizer {
  display: none;
}

.center-content.is-compact .library-panel,
.center-content.is-compact .song-section {
  display: none;
}

.center-content.is-compact .content-section {
  flex: 1 1 auto;
  width: auto;
}

.library-panel .library-section {
  max-width: none;
  flex-grow: 1;
  width: 100%;
  min-height: 0;
}


/* MAIN SECTION*/

.content-section {
  display: flex;
  flex-flow: row wrap;
  position: relative;
  min-width: 0;
}

/* SUBMAIN SECTION*/

.song-section {
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: stretch;
  min-width: 0;
  min-height: 0;
  padding: 19px;
}

/* NOW PLAYING SECTION */

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

/* Left Section: Cover + Info */
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

/* Center Section: Player Controls */
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

/* Progress Bar */
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

/* Right Section: Extra Controls */
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