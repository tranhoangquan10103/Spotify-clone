import { defineStore } from 'pinia';
import type { Song } from '../types/song';

type RepeatMode = 'off' | 'all' | 'one';

const findTrackIndex = (queue: Song[], track: Song | null) => {
	if (!track) {
		return -1;
	}

	return queue.findIndex((queueTrack) => queueTrack.trackUri === track.trackUri);
};

const shuffleTracks = (tracks: Song[], currentTrack: Song | null) => {
	const shuffled = [...tracks];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}

	if (!currentTrack) {
		return shuffled;
	}

	const currentIndex = shuffled.findIndex((track) => track.trackUri === currentTrack.trackUri);
	if (currentIndex <= 0) {
		return shuffled;
	}

	const [activeTrack] = shuffled.splice(currentIndex, 1);
	return [activeTrack, ...shuffled];
};

export const usePlayerStore = defineStore('player', {
	state: () => ({
		queue: [] as Song[],
		currentTrack: null as Song | null,
		currentIndex: -1,
		playRequestId: 0,
		isShuffled: false,
		repeatMode: 'off' as RepeatMode,
		baseQueue: [] as Song[],
	}),
	actions: {
		setQueue(tracks: Song[]) {
			this.baseQueue = [...tracks];
			this.queue = this.isShuffled ? shuffleTracks(tracks, this.currentTrack) : [...tracks];
			this.currentIndex = findTrackIndex(this.queue, this.currentTrack);
		},
		setCurrentTrack(track: Song) {
			this.currentTrack = track;
			this.currentIndex = findTrackIndex(this.queue, track);
		},
		requestPlay(track?: Song) {
			if (track) {
				this.currentTrack = track;
				this.currentIndex = findTrackIndex(this.queue, track);
			}
			this.playRequestId += 1;
		},
		playTrackAtIndex(index: number) {
			const track = this.queue[index];
			if (!track) {
				return;
			}

			this.currentIndex = index;
			this.currentTrack = track;
			this.playRequestId += 1;
		},
		toggleShuffle() {
			this.isShuffled = !this.isShuffled;
			this.queue = this.isShuffled ? shuffleTracks(this.baseQueue, this.currentTrack) : [...this.baseQueue];
			this.currentIndex = findTrackIndex(this.queue, this.currentTrack);
		},
		cycleRepeatMode() {
			if (this.repeatMode === 'off') {
				this.repeatMode = 'all';
				return;
			}

			if (this.repeatMode === 'all') {
				this.repeatMode = 'one';
				return;
			}

			this.repeatMode = 'off';
		},
		skipNext() {
			if (!this.queue.length) {
				return;
			}

			if (this.repeatMode === 'one' && this.currentTrack) {
				this.playRequestId += 1;
				return;
			}

			const activeIndex = this.currentIndex >= 0 ? this.currentIndex : findTrackIndex(this.queue, this.currentTrack);
			if (activeIndex === -1) {
				this.playTrackAtIndex(0);
				return;
			}

			if (activeIndex < this.queue.length - 1) {
				this.playTrackAtIndex(activeIndex + 1);
				return;
			}

			if (this.repeatMode === 'all') {
				this.playTrackAtIndex(0);
			}
		},
		skipPrevious() {
			if (!this.queue.length) {
				return;
			}

			const activeIndex = this.currentIndex >= 0 ? this.currentIndex : findTrackIndex(this.queue, this.currentTrack);
			if (activeIndex > 0) {
				this.playTrackAtIndex(activeIndex - 1);
				return;
			}

			if (this.repeatMode === 'all') {
				this.playTrackAtIndex(this.queue.length - 1);
			}
		},
		handleEnded() {
			if (!this.currentTrack) {
				return;
			}

			if (this.repeatMode === 'one') {
				this.playRequestId += 1;
				return;
			}

			this.skipNext();
		},
	},
});