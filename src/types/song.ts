import { z } from 'zod';

export const SongSchema = z.object({
	trackUri: z.string().min(1),
	trackName: z.string().min(1),
	albumName: z.string(),
	artists: z.array(z.string().min(1)),
	artistsText: z.string(),
	durationMs: z.number().nonnegative(),
	durationLabel: z.string(),
	coverUrl: z.string().min(1),
	audioUrl: z.string().min(1),
});

export type Song = z.infer<typeof SongSchema>;