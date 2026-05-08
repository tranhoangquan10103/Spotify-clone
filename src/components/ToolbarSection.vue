<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import InputText from 'primevue/inputtext';

import { useAuthStore } from '../stores/useAuthStore';

const menu = ref();
const router = useRouter();
const authStore = useAuthStore();
const emit = defineEmits<{
	(e: 'go-home'): void;
	(e: 'open-profile'): void;
}>();

const getSvgUrl = (name: string) => new URL(`../assets/svg/${name}.svg`, import.meta.url).href;

const menuItems = ref([
	{ label: 'Account', svgName: 'link' },
	{ label: 'Profile', svgName: 'person', command: () => emit('open-profile') },
	{ label: 'Recents', svgName: 'history' },
	{ label: 'Upgrade to Premium', svgName: 'link', command: () => window.open('https://www.spotify.com/vn-en/premium/?ref=web_loggedin_upgrade_menu', '_blank') },
	{ label: 'Support', svgName: 'link', command: () => window.open('https://support.spotify.com/', '_blank') },
	{ label: 'Download', svgName: 'link', command: () => window.open('https://spotify.com/download', '_blank') },
	{ label: 'Settings', svgName: 'settings' },
	{ separator: true },
	{ label: 'Log out', svgName: 'logout', command: () => authStore.logOut() },
]);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const goBackHome = () => {
	emit('go-home');
	router.push('/');
};

const goToSignUp = () => {
	router.push('/signup');
};

const goToLogIn = () => {
	router.push('/login');
};

const toggle = (event: Event) => {
	menu.value?.toggle(event);
};
</script>

<template>
	<div class="toolbar-section">
		<div class="toolbar">
			<div class="toolbar-left">
				<img class="toolbar-logo" style="cursor: pointer;" src="../assets/svg/logo.svg" alt="Spotify" type="button" @click="goBackHome"/>
			</div>
			<div class="toolbar-center">
				<button v-tooltip.bottom="{ value: 'Home', showDelay: 300 }" class="toolbar-icon-button" type="button" aria-label="Home" @click="goBackHome">
					<img class="toolbar-home-icon" src="../assets/svg/home.svg" alt="Home" />
				</button>
				<div class="toolbar-search">
					<img class="toolbar-search-icon" src="../assets/svg/search.svg" alt="Search" />
					<InputText
						placeholder="What do you want to play?"
						class="toolbar-search-input"
					/>
				</div>
				<button v-tooltip.bottom="{ value: 'Browse', showDelay: 300 }" class="toolbar-icon-button" type="button" aria-label="Browse">
					<img class="toolbar-browse-icon" src="../assets/svg/browse.svg" alt="Browse" />
				</button>
			</div>
			<div class="toolbar-right">
				<div v-if="!isAuthenticated" class="toolbar-auth">
					<button class="toolbar-auth-button" type="button" @click="goToSignUp">Sign up</button>
					<button class="toolbar-auth-button is-primary" type="button" @click="goToLogIn">Log in</button>
				</div>
				<div v-else class="toolbar-auth">
					<button v-tooltip.bottom="{ value: 'Notifications', showDelay: 300 }" class="toolbar-icon-button-right" type="button" aria-label="Notifications">
						<img class="toolbar-notifications-icon" src="../assets/svg/bell.svg" alt="Notifications" />
					</button>
					<button v-tooltip.bottom="{ value: 'Friends', showDelay: 300 }" class="toolbar-icon-button-right" type="button" aria-label="Friends">
						<img class="toolbar-friends-icon" src="../assets/svg/friends.svg" alt="Friends" />
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
</template>

<style>
.toolbar-section {
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
.toolbar-icon-button-right:hover {
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

.toolbar-home-icon {
	transition: filter 0.18s ease, transform 0.18s ease;
	filter: contrast(88%);
}

.toolbar-icon-button:hover .toolbar-home-icon {
	filter: brightness(0) saturate(0%) invert(100%);
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

.toolbar-search:hover {
    background-color: #2A2A2A;
    border: 1px solid #3A3A3A;
}

.toolbar-search-input.p-inputtext:focus {
	outline: none;
	box-shadow: none;
}

.toolbar-search-icon:hover,
.toolbar-search:hover .toolbar-search-icon,
.toolbar-browse-icon:hover,
.toolbar-friends-icon:hover,
.toolbar-notifications-icon:hover {
    filter: brightness(0) saturate(0%) invert(100%);
}

.toolbar-avatar {
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

.custom-menu-item {
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
</style>