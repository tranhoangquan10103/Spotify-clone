import { defineStore } from 'pinia';
import type { Song } from '../types/song';

export const usePlayerStore = defineStore('player', {
	state: () => ({
		currentTrack: null as Song | null,
		playRequestId: 0,
	}),
	actions: {
		setCurrentTrack(track: Song) {
			this.currentTrack = track;
		},
		requestPlay(track?: Song) {
			if (track) {
				this.currentTrack = track;
			}
			this.playRequestId += 1;
		},
	},
});