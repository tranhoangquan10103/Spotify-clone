<script setup lang="ts">
import { computed } from 'vue';
import Scrollbar from '../../components/Scrollbar.vue';
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
.track-tab {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
	height: 100%;
	gap: 0.4rem;
}

.track-header {
	display: grid;
	grid-template-columns: 48px minmax(240px, 1.6fr) 1fr 80px;
	gap: 12px;
	align-items: center;
	padding: 0.6rem 0.7rem;
	color: #b3b3b3;
	font-size: 0.85rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.track-scroll {
	flex: 1;
	min-height: 0;
}

.track-rows {
	display: flex;
	flex-direction: column;
	padding: 0.4rem 0.4rem 0.8rem;
}

.track-row {
	display: grid;
	grid-template-columns: 48px minmax(240px, 1.6fr) 1fr 80px;
	gap: 12px;
	align-items: center;
	padding: 0.35rem 0.35rem 0.35rem 0;
	border-radius: 4px;
	background: transparent;
	border: none;
	color: inherit;
	text-align: left;
	cursor: pointer;
}

.track-row:hover {
	background: #29292A;
}

.track-row.is-active {
	background: #5C5B62;
}

.track-col-index {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 0.8rem;
	color: #b3b3b3;
}

.track-index-button {
	margin-left: 2rem;
	width: 24px;
	height: 24px;
	border-radius: 999px;
	border: none;
	background: transparent;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
}

.track-index-icon {
	width: 14px;
	height: 14px;
}

.track-title {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	min-width: 0;
}

.track-cover {
	width: 40px;
	height: 40px;
	border-radius: 4px;
	object-fit: cover;
	flex: 0 0 auto;
}

.track-text {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
}

.track-name {
	font-weight: 600;
	color: #f2f2f2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.track-artist {
	font-size: 0.85rem;
	color: #b3b3b3;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.track-col-album {
	color: #b3b3b3;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.track-col-duration {
	color: #b3b3b3;
	text-align: right;
	padding-right: 0.8rem;
}

.track-state {
	padding: 1rem 0.8rem;
	color: #b3b3b3;
}
</style>
