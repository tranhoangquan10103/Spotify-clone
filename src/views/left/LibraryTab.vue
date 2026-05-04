<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import OverlayPanel from 'primevue/overlaypanel';
import Scrollbar from '../../components/scrollbar.vue';

const sortPanel = ref();

const toggleSortPanel = (event: Event) => {
	sortPanel.value?.toggle(event);
};
</script>

<template>
	<div class="library-section">
		<div class="library-header">
			<h4>Your Library</h4>
			<Button label="Create" icon="pi pi-plus" class="create-button" />
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
								<button class="view-option is-active" type="button" aria-label="Compact list">
									<i class="pi pi-bars"></i>
								</button>
								<button class="view-option" type="button" aria-label="List">
									<i class="pi pi-list"></i>
								</button>
								<button class="view-option" type="button" aria-label="Grid">
									<i class="material-symbols-outlined"> apps </i>
								</button>
								<button class="view-option" type="button" aria-label="Compact grid">
									<i class="pi pi-th-large"></i>
								</button>
							</div>
						</div>
					</OverlayPanel>
				</div>
			</div>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
			<button class="library-item" type="button">
				<img
					class="library-item-cover"
					src="https://i.scdn.co/image/ab67616d000011eb838be058f3d9ade37d66054e"
					alt="cover"
				/>
				<div class="library-item-text">
					<div class="library-item-title">OST</div>
					<div class="library-item-subtitle">Playlist • Emerarudo</div>
				</div>
			</button>
		</Scrollbar>
	</div>
</template>

<style>
@import '../../assets/style/tabs/librarytab.css';
</style>
