import { z } from "zod";


const commentValidation = z.object({
  content: z.string().min(1, "Comment content is required"),
  parentId: z.string().optional(),
});


export type CommentValidationSchemaType = z.infer<typeof commentValidation>;


export default commentValidation;