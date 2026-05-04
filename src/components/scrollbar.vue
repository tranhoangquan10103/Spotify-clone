<script setup lang="ts">
import ScrollPanel from 'primevue/scrollpanel';
</script>

<template>
	<ScrollPanel>
		<slot />
	</ScrollPanel>
</template>

<style>
@import '../assets/style/components/scrollbar.css';
</style>
