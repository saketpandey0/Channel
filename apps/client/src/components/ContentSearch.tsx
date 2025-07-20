import { useEffect, useRef, useState, useDeferredValue } from "react";
import { Link } from "react-router-dom";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Fuse from "fuse.js";
import {Input} from "./../../../../packages/ui/src/shad/ui/input";
import {motion} from 'motion/react'


export const ContentSearch = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [input, setInput] = useState("");
    const [searchBlogs, setSearchBlogs] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    

    return (
        <motion.div className="relative shadow-lg"
            initial={{
                width: "200px"
            }}
            animate={{
                width: isFocused ? "300px" : "200px"
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
            }}
        >
            <Input
                type="text"
                placeholder="Search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={()=> setIsFocused(false)}
                className="w-full max-w-4xl px-4 py-3 mx-auto rounded-md outline-offset-2 outline-sky-500 focus:outline-2"
            />
            {input && (
                <button
                    onClick={() => setInput("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                    <Cross2Icon />
                </button>
            )}
        </motion.div>
    )
}