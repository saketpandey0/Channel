import { z } from "zod";

const publicationValidation = z.object({
    name: z.string().min(4, "Publication name is required"),
    description: z.string().optional(),
    bio: z.string().optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    email: z.string().optional(),
    hasNewsletter: z.boolean().optional(),
    allowSubmissions: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
})

export type PublicationValidationSchemaType = z.infer<typeof publicationValidation>;


export default publicationValidation;
