<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import OverlayPanel from 'primevue/overlaypanel';
import Scrollbar from '../../components/Scrollbar.vue';

const sortPanel = ref();
const createMenuRef = ref<HTMLDivElement | null>(null);
const isCreateActive = ref(false);
const libraryViewMode = ref<'compact-list' | 'list' | 'grid' | 'compact-grid'>('list');

const libraryCoverUrl = 'https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e';

const libraryItems = [
	{ id: 'ost', title: 'OST', subtitle: 'Playlist • Emerarudo', coverUrl: libraryCoverUrl },
	{ id: 'focus-flow', title: 'Focus Flow', subtitle: 'Playlist • Spotify', coverUrl: libraryCoverUrl },
	{ id: 'midnight-blend', title: 'Midnight Blend', subtitle: 'Blend • Spotify', coverUrl: libraryCoverUrl },
	{ id: 'studio-folder', title: 'Studio Folder', subtitle: 'Folder • Library', coverUrl: libraryCoverUrl },
	{ id: 'daily-mix', title: 'Daily Mix', subtitle: 'Playlist • Spotify', coverUrl: libraryCoverUrl },
	{ id: 'indie-discovery', title: 'Indie Discovery', subtitle: 'Playlist • Emerarudo', coverUrl: libraryCoverUrl },
	{ id: 'liked-songs', title: 'Liked Songs', subtitle: 'Playlist • Spotify', coverUrl: libraryCoverUrl },
	{ id: 'archive', title: 'Archive', subtitle: 'Folder • Emerarudo', coverUrl: libraryCoverUrl },
];

const createOptions = [
	{ id: 'playlist', label: 'Playlist' },
	{ id: 'blend', label: 'Blend' },
	{ id: 'folder', label: 'Folder' },
] as const;

const toggleSortPanel = (event: Event) => {
	sortPanel.value?.toggle(event);
};

const toggleCreate = () => {
	isCreateActive.value = !isCreateActive.value;
};

const setLibraryViewMode = (mode: 'compact-list' | 'list' | 'grid' | 'compact-grid') => {
	libraryViewMode.value = mode;
};

const handleCreateOption = () => {
	isCreateActive.value = false;
};

const handleDocumentPointerDown = (event: PointerEvent) => {
	if (!isCreateActive.value) {
		return;
	}

	const target = event.target as Node | null;
	if (!target) {
		return;
	}

	const createButton = document.querySelector('.create-button');
	if (createMenuRef.value?.contains(target) || createButton?.contains(target)) {
		return;
	}

	isCreateActive.value = false;
};

onMounted(() => {
	document.addEventListener('pointerdown', handleDocumentPointerDown);
});

onBeforeUnmount(() => {
	document.removeEventListener('pointerdown', handleDocumentPointerDown);
});
</script>

<template>
	<div class="library-section">
		<div class="library-header">
			<h4>Your Library</h4>
			<button type="button" :class="['create-button', { active: isCreateActive }]" @click="toggleCreate">
				<i class="pi pi-plus create-button-icon"></i>
				<span class="create-button-label">Create</span>
			</button>
			<div v-if="isCreateActive" ref="createMenuRef" class="create-panel">
				<div class="create-panel-content">
					<button
						v-for="option in createOptions"
						:key="option.id"
						type="button"
						class="create-option"
						@click="handleCreateOption"
					>
						<span class="create-option-icon" :class="`is-${option.id}`"></span>
						<span class="create-option-label">{{ option.label }}</span>
					</button>
				</div>
			</div>
		</div>

		<div class="library-tags">
			<div class="tags">Playlists</div>
			<div class="tags">Artists</div>
			<div class="tags">Albums</div>
		</div>

		<Scrollbar style="width: 100%;" class="library-scroll">
			<div class="library-search">
				<IconField iconPosition="left">
					<InputIcon class="pi pi-search"> </InputIcon>
					<InputText placeholder="Search in Your Library" class="inputtext" />
				</IconField>
				<div class="library-sort">
					<span class="sort-label">Recents</span>
					<button class="sort-button" type="button" @click="toggleSortPanel($event)">
						<img src="../../assets/svg/burger-dot.svg" alt="Sort" />
					</button>
					<OverlayPanel ref="sortPanel" class="sort-panel" appendTo="body" :showCloseIcon="false">
						<div class="sort-panel-content">
							<div class="sort-title">Sort by</div>
							<div class="sort-options">
								<button type="button" class="sort-option active">
									<span>Recents</span>
									<i class="pi pi-check"></i>
								</button>
								<button type="button" class="sort-option">
									<span>Recently Added</span>
								</button>
								<button type="button" class="sort-option">
									<span>Alphabetical</span>
								</button>
								<button type="button" class="sort-option">
									<span>Creator</span>
								</button>
							</div>
							<div class="sort-divider"></div>
							<div class="view-title">View as</div>
							<div class="view-options">
								<button
									class="view-option"
									type="button"
									aria-label="Compact list"
									:class="{ 'is-active': libraryViewMode === 'compact-list' }"
									:aria-pressed="libraryViewMode === 'compact-list'"
									@click="setLibraryViewMode('compact-list')"
									v-tooltip.bottom="{ value: 'Compact list', showDelay: 300, pt: { arrow: { style: { borderWidth: '6px' } }, text: 'bg-primary font-medium' } }"
								>
									<i class="pi pi-bars"></i>
								</button>
								<button
									class="view-option"
									type="button"
									aria-label="List"
									:class="{ 'is-active': libraryViewMode === 'list' }"
									:aria-pressed="libraryViewMode === 'list'"
									@click="setLibraryViewMode('list')"
									v-tooltip.bottom="{ value: 'List', showDelay: 300, pt: { arrow: { style: { borderWidth: '6px' } }, text: 'bg-primary font-medium' } }"
								>
									<i class="pi pi-list"></i>
								</button>
								<button
									class="view-option"
									type="button"
									aria-label="Grid"
									:class="{ 'is-active': libraryViewMode === 'grid' }"
									:aria-pressed="libraryViewMode === 'grid'"
									@click="setLibraryViewMode('grid')"
									v-tooltip.bottom="{ value: 'Grid', showDelay: 300, pt: { arrow: { style: { borderWidth: '6px' } }, text: 'bg-primary font-medium' } }"
								>
									<span class="material-symbols-outlined">apps</span>
								</button>
								<button
									class="view-option"
									type="button"
									aria-label="Compact grid"
									:class="{ 'is-active': libraryViewMode === 'compact-grid' }"
									:aria-pressed="libraryViewMode === 'compact-grid'"
									@click="setLibraryViewMode('compact-grid')"
									v-tooltip.bottom="{ value: 'Compact grid', showDelay: 300, pt: { arrow: { style: { borderWidth: '6px' } }, text: 'bg-primary font-medium' } }"
								>
									<i class="pi pi-th-large"></i>
								</button>
							</div>
						</div>
					</OverlayPanel>
				</div>
			</div>

			<div class="library-items" :class="[`is-${libraryViewMode}`]">
				<button
					v-for="item in libraryItems"
					:key="item.id"
					type="button"
					class="library-item"
				>
					<img class="library-item-cover" :src="item.coverUrl" :alt="item.title" />
					<div class="library-item-text">
						<div class="library-item-title">{{ item.title }}</div>
						<div class="library-item-subtitle">{{ item.subtitle }}</div>
					</div>
				</button>
			</div>
		</Scrollbar>
	</div>
</template>

<style>
/* LIBRARY SECTION */

.library-section {
	display: flex;
	flex-direction: column;
	flex-grow: 0.5;
	max-width: 28rem;
}

.library-header {
	display: flex;
	flex-flow: row wrap;
	position: relative;
	margin-left: 0.8rem;
}

.create-button {
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	padding: 0.7rem 1rem;
	align-self: flex-start;
	border-radius: 999px;
	background-color: #1f1f1f;
	border: none;
	color: #ffffff;
	font: inherit;
	font-weight: 600;
	cursor: pointer;
	scale: 80%;
	position: absolute;
	right: 0px;
}

.create-button.active,
.create-button:hover {
	background-color: #2A2A2A;
}

.create-button-icon {
	transition: transform 200ms ease;
	display: inline-block;
	transform-origin: center;
}

.create-button.active .create-button-icon {
	transform: rotate(45deg);
}

.create-button-label {
	line-height: 1;
}

.create-panel {
	position: absolute;
	top: calc(100% + 0.55rem);
	right: 0;
	z-index: 20;
	background: transparent;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
	border-radius: 14px;
	min-width: 12rem;
}

.create-panel-content {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	background: #1f1f1f;
	color: #f2f2f2;
	padding: 0.6rem;
	border-radius: 14px;
	min-width: 12rem;
	overflow: hidden;
}

.create-option {
	width: 100%;
	border: none;
	background: transparent;
	color: #f2f2f2;
	padding: 0.7rem 0.8rem;
	border-radius: 10px;
	display: flex;
	align-items: center;
	gap: 0.7rem;
	cursor: pointer;
	text-align: left;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.create-option:hover {
	background: #2a2a2a;
}

.create-option:active {
	background: #353535;
}

.create-option-icon {
	width: 0.8rem;
	height: 0.8rem;
	border-radius: 999px;
	flex: 0 0 auto;
	background: #5a5a5a;
}

.create-option-icon.is-playlist {
	background: #1db954;
}

.create-option-icon.is-blend {
	background: #8b5cf6;
}

.create-option-icon.is-folder {
	background: #f59e0b;
}

.create-option-label {
	font-weight: 600;
}

.library-tags {
	display: flex;
	flex-flow: row wrap;
	-ms-user-select: none;
	user-select: none;
}

.library-tags .tags {
	background-color: #2a2a2a;
	border-radius: 999px;
	padding: 0.5rem 1rem;
	margin: 0.3rem 0.3rem 0 0;
	cursor: pointer;
}

.library-tags .tags:hover {
	background-color: #3a3a3a;
}

.library-tags .tags:active {
	background-color: #444444;
	transition: background-color .2s ease-out;
}

.inputtext.p-inputtext {
	display: flex;
	background: #292929;
	font-size: 0.8rem;
	height: 2.6rem;
	border: none;
	justify-content: center;
	align-items: center;
	width: 12rem;
	color: #bbbbbb;
}

.inputtext.p-inputtext::placeholder,
.library-search .p-input-icon,
.library-search .pi-search {
	color: #bbbbbb;
}

.inputtext.p-inputtext:focus {
	outline: none;
	box-shadow: none;
}

.library-search {
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: 0.6rem;
	margin-bottom: 0.8rem;
	container-type: inline-size;
}

.library-search .p-icon-field {
	flex: 1;
	min-width: 0;
}

.library-sort {
	margin-left: 3rem;
	padding-right: 0.8rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #bbbbbb;
	font-size: 0.85rem;
}

.sort-label {
	font-weight: 600;
	color: #bbbbbb;
}

@container (max-width: 20rem) {
	.sort-label {
		display: none;
	}

	.library-sort {
		margin-left: auto;
	}
}

.sort-button {
	width: 2.2rem;
	height: 2.2rem;
	border-radius: 999px;
	border: none;
	background-color: #121212;
	color: #e6e6e6;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.sort-panel.p-overlaypanel {
	background: transparent;
	border: none;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.sort-panel .p-overlaypanel-content {
	background: #2a2a2a;
	color: #eaeaea;
	padding: 0.9rem;
	border-radius: 12px;
	min-width: 220px;
	overflow: hidden;
}

.sort-panel.p-overlaypanel:before,
.sort-panel.p-overlaypanel:after {
	display: none;
}

.sort-panel-content {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.sort-title,
.view-title {
	font-size: 0.8rem;
	color: #bbbbbb;
	font-weight: 600;
}

.sort-options {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.sort-option {
	background: transparent;
	border: none;
	color: #e5e5e5;
	padding: 0.45rem 0.5rem;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	font-size: 0.9rem;
	text-align: left;
}

.sort-option:hover {
	background: rgba(255, 255, 255, 0.06);
}

.sort-option.active {
	color: #1ed760;
}

.sort-divider {
	height: 1px;
	background: #3a3a3a;
	margin: 0.4rem 0;
}

.view-options {
	display: flex;
	gap: 0.4rem;
}

.view-option {
	width: 2rem;
	height: 2rem;
	border-radius: 6px;
	border: 1px solid #333333;
	background: #222222;
	color: #bbbbbb;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.view-option:hover {
	border-color: #4a4a4a;
}

.view-option.is-active {
	color: #1ed760;
	border-color: #1ed760;
}

.library-items {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	padding-bottom: 0.4rem;
}

.library-items.is-compact-list {
	gap: 0.15rem;
}

.library-items.is-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
	gap: 0.7rem;
	padding: 0.4rem 0.5rem 0.8rem;
}

.library-items.is-compact-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(7.75rem, 1fr));
	gap: 0.55rem;
	padding: 0.35rem 0.5rem 0.75rem;
}

.library-scroll {
	margin-top: 0.8rem;
	border-radius: 12px;
	background-color: #121212;
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
}

.library-item {
	width: calc(100% - 1rem);
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.45rem 0.5rem;
	margin-bottom: 0.2rem;
	border: none;
	border-radius: 10px;
	background: transparent;
	color: inherit;
	text-align: left;
	cursor: pointer;
	transition: background-color 0.15s ease, transform 0.15s ease;
}

.library-item:hover {
	background: #29292A;
	transform: translateY(-1px);
}

.library-item-cover {
	width: 48px;
	height: 48px;
	border-radius: 4px;
	object-fit: cover;
	flex: 0 0 auto;
}

.library-item-text {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.library-items.is-compact-list .library-item {
	padding: 0.3rem 0.45rem;
	gap: 0.75rem;
}

.library-items.is-compact-list .library-item-cover {
	width: 36px;
	height: 36px;
}

.library-items.is-compact-list .library-item-title {
	font-size: 0.98rem;
}

.library-items.is-compact-list .library-item-subtitle {
	font-size: 0.8rem;
}

.library-items.is-grid .library-item,
.library-items.is-compact-grid .library-item {
	width: auto;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.55rem;
	padding: 0.6rem;
	border-radius: 14px;
	background: #181818;
}

.library-items.is-grid .library-item-cover,
.library-items.is-compact-grid .library-item-cover {
	width: 100%;
	height: auto;
	aspect-ratio: 1 / 1;
	border-radius: 10px;
}

.library-items.is-grid .library-item-text,
.library-items.is-compact-grid .library-item-text {
	width: 100%;
}

.library-items.is-grid .library-item-title,
.library-items.is-compact-grid .library-item-title {
	white-space: normal;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.library-items.is-grid .library-item-subtitle {
	white-space: normal;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
}

.library-items.is-compact-grid .library-item {
	gap: 0.4rem;
	padding: 0.45rem;
}

.library-items.is-compact-grid .library-item-title {
	font-size: 0.92rem;
	-webkit-line-clamp: 1;
}

.library-items.is-compact-grid .library-item-subtitle {
	display: none;
}

.library-item-title {
	font-size: 1.05rem;
	font-weight: 700;
	color: #f2f2f2;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.library-item-subtitle {
	font-size: 0.92rem;
	color: #b3b3b3;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
