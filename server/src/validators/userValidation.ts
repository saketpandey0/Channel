import { z } from 'zod';


const userValidation = z.object({
    email: z.string().email().regex(/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i, "Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})

export type UsserValidationSchemaType = z.infer<typeof userValidation>;


export default userValidation;


export const profileUpdateValidation = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  bio: z.string().max(150, "Bio must be less than 150 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  avatar: z.string().optional(),
});