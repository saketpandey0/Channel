import { Request, Response, Router } from "express";


const router = Router();



const createBlog = async (req: Request, res: Response): Promise<any> => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }

    try {
        // Here you would typically save the blog post to a database
        // For demonstration, we will just return the blog post
        const newBlogPost = {
            id: Date.now(), // Simulating an ID
            title,
            content,
        }
        res.status(201).json(newBlogPost);
    } catch (error) {
        console.error("Error creating blog post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const userVerify = async (req: Request, res: Response): Promise<any> => {
    const user = req.session?.user;
    if(!user){
        return res.status(401).json({error: "Unauthorized"});
    }
    
}