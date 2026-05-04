import { defineStore } from 'pinia';
import type { Song } from '../types/song';

export const usePlayerStore = defineStore('player', {
	state: () => ({
		currentTrack: null as Song | null,
	}),
	actions: {
		setCurrentTrack(track: Song) {
			this.currentTrack = track;
		},
	},
});