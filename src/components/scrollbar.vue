<script setup lang="ts">
import ScrollPanel from 'primevue/scrollpanel';
</script>

<template>
	<ScrollPanel>
		<slot />
	</ScrollPanel>
</template>

<style>
.p-scrollpanel .p-scrollpanel-bar {
	background: #ffffff4d;
	border: none;
	border-radius: 0px;
	box-shadow: none;
	outline: none;
	width: 12px;
}

.p-scrollpanel .p-scrollpanel-bar:hover {
	background: #ffffff80;
	transition: background 0.2s;
}

.p-scrollpanel .p-scrollpanel-bar:active {
	background: #ffffffb3;
	transition: background 0.2s;
}

.p-scrollpanel .p-scrollpanel-bar:focus,
.p-scrollpanel .p-scrollpanel-bar:focus-visible {
	outline: none;
	box-shadow: none;
}
</style>
