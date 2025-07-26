import { z } from 'zod';


const storyValidation = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publicationId: z.string().optional(),
  isPremium: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  allowClaps: z.boolean().optional(),
});


export type StoryValidationSchemaType = z.infer<typeof storyValidation>;


export default storyValidation;