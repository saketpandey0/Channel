import {Router} from 'express'
import { createStory, getStories } from '../controller/storiesController';




const router = Router();


router.post('/create', createStory)
router.get('/getstories', getStories)



export default router;