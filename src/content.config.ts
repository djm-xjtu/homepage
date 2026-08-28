import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    /** Set for cross-posts hosted elsewhere; the list will link out with a ↗. */
    external: z.string().url().optional(),
    /** Chinese posts get their own section on /blog/, like skyzh.dev does. */
    lang: z.enum(['en', 'zh']).default('en'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
