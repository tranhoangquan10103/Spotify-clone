import { computed, ref, watch } from 'vue';
import { usePlayerStore } from '../stores/usePlayerStore';

interface LyricLine {
	time: number; // in seconds
	text: string;
}

interface ParsedLyrics {
	title?: string;
	artist?: string;
	lines: LyricLine[];
}

export const useLyricsSync = (currentTime: () => number) => {
	const playerStore = usePlayerStore();
	const lyrics = ref<ParsedLyrics>({ lines: [] });
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const lyricsFiles = import.meta.glob('/src/songs/lyrics/*.lrc', {
		query: '?raw',
		eager: true,
		import: 'default',
	}) as Record<string, string>;

	const normalizeKey = (value: string) =>
		value
			.toLowerCase()
			.normalize('NFKC')
			.replace(/\s+/g, ' ')
			.replace(/[’']/g, "'")
			.replace(/[\p{P}\p{S}]/gu, '')
			.trim();

	// Parse .lrc file format
	const parseLyricsContent = (content: string): ParsedLyrics => {
		const lines: LyricLine[] = [];
		const metadata: Record<string, string> = {};
		const lrcLines = content.split('\n');

		for (const line of lrcLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			// Parse metadata
			if (trimmed.startsWith('[') && trimmed.includes(':') && !trimmed.match(/^\[\d{2}:/)) {
				const metaMatch = trimmed.match(/\[(.*?):(.*?)\]/);
				if (metaMatch) {
					const [, key, value] = metaMatch;
					metadata[key.toLowerCase()] = value;
				}
				continue;
			}

			// Parse timed lyrics
			const timeMatch = trimmed.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
			if (timeMatch) {
				const [, minutes, seconds, text] = timeMatch;
				const time = parseInt(minutes, 10) * 60 + parseFloat(seconds);
				if (text.trim()) {
					lines.push({ time, text: text.trim() });
				}
			}
		}

		return {
			title: metadata.ti,
			artist: metadata.ar,
			lines: lines.sort((a, b) => a.time - b.time),
		};
	};

	// Load lyrics file for current track
	const loadLyrics = async () => {
		const track = playerStore.currentTrack;
		if (!track) {
			lyrics.value = { lines: [] };
			error.value = null;
			return;
		}

		isLoading.value = true;
		error.value = null;

		try {
			let content: string | null = null;
			const normalizedTrackName = normalizeKey(track.trackName);
			const normalizedArtistsText = normalizeKey(track.artistsText);
			const normalizedTitleArtistPair = normalizeKey(`${track.trackName} - ${track.artistsText}`);
			const normalizedTrackUri = normalizeKey(track.trackUri);

			for (const [path, rawContent] of Object.entries(lyricsFiles)) {
				const fileName = decodeURIComponent(path.split('/').pop() ?? '');
				const normalizedFileName = normalizeKey(fileName.replace(/\.lrc$/i, ''));

				if (
					normalizedFileName === normalizedTitleArtistPair ||
					(normalizedFileName.includes(normalizedTrackName) && normalizedFileName.includes(normalizedArtistsText)) ||
					(normalizedTrackUri.length > 0 && normalizedFileName.includes(normalizedTrackUri))
				) {
					content = rawContent;
					break;
				}
			}

			if (content) {
				lyrics.value = parseLyricsContent(content);
			} else {
				lyrics.value = { lines: [] };
				error.value = `Lyrics not found`;
			}
		} catch (err) {
			lyrics.value = { lines: [] };
			error.value = err instanceof Error ? err.message : 'Failed to load lyrics';
			console.error('Error loading lyrics:', err);
		} finally {
			isLoading.value = false;
		}
	};

	// Get current lyric line based on playback time
	const currentLyricIndex = computed(() => {
		const time = currentTime();
		const lines = lyrics.value.lines;

		if (!lines.length) return -1;

		// Find the last line that is <= current time
		for (let i = lines.length - 1; i >= 0; i--) {
			if (lines[i].time <= time) {
				return i;
			}
		}

		return -1;
	});

	const currentLyric = computed(() => {
		const index = currentLyricIndex.value;
		return index >= 0 ? lyrics.value.lines[index] : null;
	});

	const upcomingLyric = computed(() => {
		const index = currentLyricIndex.value;
		return index + 1 < lyrics.value.lines.length ? lyrics.value.lines[index + 1] : null;
	});

	const allLyrics = computed(() => lyrics.value.lines);

	// Watch for track changes
	watch(
		() => playerStore.currentTrack,
		() => {
			loadLyrics();
		},
		{ immediate: true },
	);

	return {
		lyrics: computed(() => lyrics.value),
		allLyrics,
		currentLyric,
		upcomingLyric,
		currentLyricIndex,
		isLoading,
		error,
	};
};
