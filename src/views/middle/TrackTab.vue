<script setup lang="ts">
import { computed } from 'vue';
import Scrollbar from '../../components/scrollbar.vue';
import { useSongsQuery } from '../../composables/useSongsQuery';
import { usePlayerStore } from '../../stores/usePlayerStore';
import type { Song } from '../../types/song';

const { data, error } = useSongsQuery();
const playerStore = usePlayerStore();

const tracks = computed(() => data.value ?? []);

const selectTrack = (track: Song) => {
	playerStore.setCurrentTrack(track);
};

const playTrack = (track: Song, event?: Event) => {
	event?.stopPropagation();
	playerStore.requestPlay(track);
};

const isSelected = (track: Song) => track.trackUri === playerStore.currentTrack?.trackUri;
</script>

<template>
	<div class="track-tab">
		<div class="track-header">
			<div class="track-col track-col-index">#</div>
			<div class="track-col track-col-title">Title</div>
			<div class="track-col track-col-album">Album</div>
			<div class="track-col track-col-duration"><i class="pi pi-clock"></i></div>	
		</div>

		<div v-if="error" class="track-state">Unable to load songs.</div>
		<div v-else-if="!data" class="track-state">Loading songs...</div>
		<Scrollbar v-else class="track-scroll">
			<div class="track-rows">
				<div
					v-for="(track, index) in tracks"
					:key="track.trackUri"
					class="track-row"
					:class="{ 'is-active': isSelected(track) }"
					tabindex="0"
					@click="selectTrack(track)"
				>
					<div class="track-col track-col-index">
						<button
							v-tooltip.top="{ value: 'Play', showDelay: 300 }"
							v-if="isSelected(track)"
							class="track-index-button"
							@click="playTrack(track, $event)"
						>
							<img class="track-index-icon" src="../../assets/svg/play.svg" alt="Play" />
						</button>
						<span v-else>{{ index + 1 }}</span>
					</div>
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
				</div>
			</div>
		</Scrollbar>
	</div>
</template>

<style>
@import '../../assets/style/tabs/tracktab.css';
</style>
