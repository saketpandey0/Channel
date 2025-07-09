import { Link } from "react-router-dom"
import {motion} from 'motion/react'
import { useEffect } from "react";

export const Appbar = () => {
    
    useEffect(()=>{

    })

    return (
        <nav className="sticky mx-auto wrapper top-0 z-50 flex items-center gap-2 py-6 w-full bg-green-200">     
            <motion.div>
                <Link to={"/"} className="flex items-center gap-2 cursor-pointer">
                <span className="text-lg md:text-3xl font-extrabold tracking-tight text-foreground hidden md:block ">Medium</span>
                </Link> 
            </motion.div>     
        </nav>
    )
}
