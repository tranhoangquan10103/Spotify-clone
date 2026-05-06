import { useQuery } from '@tanstack/vue-query';
import Papa from 'papaparse';
import type { Song } from '../types/song';

type SongRow = {
	'Track URI'?: string;
	'Track Name'?: string;
	'Album Name'?: string;
	'Artist Name(s)'?: string;
	'Duration (ms)'?: string;
};

const songsCsvUrl = new URL('../songs/song-list.csv', import.meta.url).href;

const formatDuration = (durationMs: number) => {
	const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatArtists = (artistsRaw: string) =>
	artistsRaw
		.split(';')
		.map((artist) => artist.trim())
		.filter(Boolean);

const sanitizeTrackName = (name: string) => name.replace(/"/g, '').trim();

const buildCoverUrl = (trackName: string, artists: string[]) => {
	const fileName = `${sanitizeTrackName(trackName)} - ${artists.join('; ')}.jpg`;
	return new URL(`../songs/covers/${fileName}`, import.meta.url).href;
};

const buildAudioUrl = (trackName: string, artists: string[]) => {
	const fileName = `${sanitizeTrackName(trackName)} - ${artists.join('; ')}.flac`;
	return new URL(`../songs/audio/${fileName}`, import.meta.url).href;
};

const mapRow = (row: SongRow): Song => {
	const trackUri = row['Track URI'] ?? '';
	const trackName = row['Track Name'] ?? '';
	const albumName = row['Album Name'] ?? '';
	const artists = formatArtists(row['Artist Name(s)'] ?? '');
	const durationMs = Number(row['Duration (ms)'] ?? 0);

	return {
		trackUri,
		trackName,
		albumName,
		artists,
		artistsText: artists.join(', '),
		durationMs,
		durationLabel: formatDuration(durationMs),
		coverUrl: buildCoverUrl(trackName, artists),
		audioUrl: buildAudioUrl(trackName, artists),
	};
};

const parseSongsCsv = (csvText: string): Song[] => {
	const result = Papa.parse<SongRow>(csvText, {
		header: true,
		skipEmptyLines: true,
	});

	if (result.errors.length > 0) {
		throw new Error(result.errors[0]?.message ?? 'Failed to parse songs CSV.');
	}

	return result.data
		.filter((row) => row['Track URI'])
		.map(mapRow);
};
export const useSongsQuery = () =>
	useQuery({
		queryKey: ['songs'],
		queryFn: async () => {
			const response = await fetch(songsCsvUrl);
			if (!response.ok) {
				throw new Error('Failed to load songs list.');
			}
			const csvText = await response.text();
			return parseSongsCsv(csvText);
		},
	});