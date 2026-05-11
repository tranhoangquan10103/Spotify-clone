<script setup lang="ts">
import { computed } from 'vue';

import Scrollbar from '../../components/Scrollbar.vue';
import { usePlayerStore } from '../../stores/usePlayerStore';

const playerStore = usePlayerStore();

const queue = computed(() => playerStore.queue);
const currentTrackUri = computed(() => playerStore.currentTrack?.trackUri);

const playTrack = (trackUri: string) => {
    const track = queue.value.find((queueTrack) => queueTrack.trackUri === trackUri);
    if (!track) {
        return;
    }

    playerStore.requestPlay(track);
};

const isCurrentTrack = (trackUri: string) => currentTrackUri.value === trackUri;
</script>

<template>
    <div class="queue-tab">
        <div class="queue-header">
            <h2>Queue</h2>
        </div>

        <div v-if="!queue.length" class="queue-state">No songs in queue yet.</div>
        <Scrollbar v-else class="queue-scroll">
            <div class="queue-list">
                <button
                    v-for="(track, index) in queue"
                    :key="track.trackUri"
                    type="button"
                    class="queue-item"
                    :class="{ 'is-active': isCurrentTrack(track.trackUri) }"
                    @click="playTrack(track.trackUri)"
                >
                    <span class="queue-index">{{ index + 1 }}</span>
                    <img class="queue-cover" :src="track.coverUrl" :alt="track.trackName" />
                    <div class="queue-meta">
                        <div class="queue-title">{{ track.trackName }}</div>
                        <div class="queue-artist">{{ track.artistsText }}</div>
                    </div>
                    <span class="queue-duration">{{ track.durationLabel }}</span>
                </button>
            </div>
        </Scrollbar>
    </div>
</template>

<style>
.queue-tab {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    height: 100%;
    gap: 0.5rem;
}

.queue-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin: 0.5rem 0 0 1rem;
    height: 2.5rem;
    align-items: center;
}

h2 {
    font: 1.5rem 'Spotify Circular', -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: #fff;
}

.queue-header p {
    margin: 0;
    color: #b3b3b3;
    font-size: 0.92rem;
}

.queue-scroll {
    flex: 1;
    min-height: 0;
}

.queue-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.2rem 0.1rem 0.5rem;
    color: #fff;
}

.queue-item {
    display: grid;
    grid-template-columns: 2rem 40px 1fr auto;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 0.6rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
}

.queue-item:hover {
	background: #29292A;
}

.queue-item.is-active {
	background: #5C5B62;
}

.queue-index {
    color: #b3b3b3;
    font-size: 0.88rem;
    text-align: center;
}

.queue-cover {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
}

.queue-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.queue-title,
.queue-artist {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.queue-title {
    font-weight: 600;
}

.queue-artist,
.queue-duration {
    color: #b3b3b3;
    font-size: 0.86rem;
}

.queue-duration {
    padding-left: 0.5rem;
}

.queue-state {
    color: #b3b3b3;
    padding: 1rem 0;
}
</style>