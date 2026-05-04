<script setup lang="ts">
import { computed } from 'vue';
import Scrollbar from '../../components/scrollbar.vue';
import { useSongsQuery } from '../../composables/useSongsQuery';
import { usePlayerStore } from '../../stores/usePlayerStore';
import type { Song } from '../../types/song';

const { data, error } = useSongsQuery();
const playerStore = usePlayerStore();

const tracks = computed(() => data.value ?? []);

const setCurrentTrack = (track: Song) => {
	playerStore.setCurrentTrack(track);
};
</script>

<template>
	<div class="track-tab">
		<div class="track-header">
			<div class="track-col track-col-index">#</div>
			<div class="track-col track-col-title">Title</div>
			<div class="track-col track-col-album">Album</div>
			<div class="track-col track-col-duration">
				<i class="pi pi-clock"></i>
			</div>
		</div>

		<div v-if="error" class="track-state">Unable to load songs.</div>
		<div v-else-if="!data" class="track-state">Loading songs...</div>
		<Scrollbar v-else class="track-scroll">
			<div class="track-rows">
				<button
					v-for="(track, index) in tracks"
					:key="track.trackUri"
					class="track-row"
					:class="{ 'is-active': track.trackUri === playerStore.currentTrack?.trackUri }"
					type="button"
					@click="setCurrentTrack(track)"
				>
					<div class="track-col track-col-index">{{ index + 1 }}</div>
					<div class="track-col track-col-title">
						<div class="track-title">
							<img class="track-cover" :src="track.coverUrl" :alt="track.trackName" />
							<div class="track-text">
								<div class="track-name">{{ track.trackName }}</div>
								<div class="track-artist">{{ track.artistsText }}</div>
							</div>
						</div>
					</div>
					<div class="track-col track-col-album">{{ track.albumName }}</div>
					<div class="track-col track-col-duration">{{ track.durationLabel }}</div>
				</button>
			</div>
		</Scrollbar>
	</div>
</template>

<style>
@import '../../assets/style/tabs/tracktab.css';
</style>
