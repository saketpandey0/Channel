import { z } from 'zod';


const userValidation = z.object({
    email: z.string().email().regex(/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i, "Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})

export type UsserValidationSchemaType = z.infer<typeof userValidation>;


export default userValidation;