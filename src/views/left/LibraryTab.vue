<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import OverlayPanel from 'primevue/overlaypanel';
import Scrollbar from '../../components/Scrollbar.vue';

const sortPanel = ref();
const isCreateActive = ref(false);

const toggleSortPanel = (event: Event) => {
	sortPanel.value?.toggle(event);
};

const toggleCreate = () => {
    isCreateActive.value = !isCreateActive.value;
};
</script>

<template>
	<div class="library-section">
		<div class="library-header">
			<h4>Your Library</h4>
			<Button
				label="Create"
				icon="pi pi-plus"
				:class="['create-button', { active: isCreateActive }]"
				@click="toggleCreate"
			/>
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
								<button class="view-option" type="button" aria-label="Compact list"
									v-tooltip.bottom="{
										value: 'Compact list',
										showDelay: 300,
										pt: {
											arrow: {
												style: {
													borderWidth: '6px',
												}
											},
											text: 'bg-primary font-medium'
										}
									}">
									<i class="pi pi-bars"></i>
								</button>
								<button class="view-option" type="button" aria-label="List"
									v-tooltip.bottom="{
										value: 'List',
										showDelay: 300,
										pt: {
											arrow: {
												style: {
													borderWidth: '6px',
												}
											},
											text: 'bg-primary font-medium'
										}
									}">
									<i class="pi pi-list"></i>
								</button>
								<button class="view-option" type="button" aria-label="Grid"
									v-tooltip.bottom="{
										value: 'Grid',
										showDelay: 300,
										pt: {
											arrow: {
												style: {
													borderWidth: '6px',
												}
											},
											text: 'bg-primary font-medium'
										}
									}">
									<span class="material-symbols-outlined">apps</span>
								</button>
								<button class="view-option" type="button" aria-label="Compact grid"
									v-tooltip.bottom="{
										value: 'Compact grid',
										showDelay: 300,
										pt: {
											arrow: {
												style: {
													borderWidth: '6px',
												}
											},
											text: 'bg-primary font-medium'
										}
									}">
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
	align-self: flex-start;
	border-radius: 999px;
	background-color: #1f1f1f;
	border: none;
	scale: 80%;
	position: absolute;
	right: 0px;
}

.create-button.p-button:hover {
	background-color: #2A2A2A;
}

.create-button .pi-plus {
	transition: transform 200ms ease;
	display: inline-block;
	transform-origin: center;
}

.create-button.active .pi-plus {
	transform: rotate(45deg);
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

.inputtext.p-inputtext:focus{
	outline: none;
	box-shadow: none;
}

.library-search {
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: 0.6rem;
	margin-bottom: 0.8rem;
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
}

.library-item:hover {
	background: #29292A;
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
