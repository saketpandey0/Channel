import useDebounce from "../hooks/useDebounce";
import { useState } from "react";
import Editor from "../components/Editor/Editor";
import { Button } from "../components/shad";
import RichTextEditor from '../components/RichTextEditor';


export const Write = () => {
    const [input, setInput] = useState('');
    const debouncedVal = useDebounce(input, 1000);

    return (
        <div className="h-screen w-full">
            <header className="max-w-4xl mx-auto flex flex-row items-center justify-evenly gap-32 pt-2 px-4">
                <div className="flex flex-row max-w-4xl items-center gap-4">
                    <span className="text-4xl font-serif font-bold text-shadow-blue-500">Channel</span>
                    <span>Draft</span>
                    <span className="hidden md:block">saket pandey</span>
                </div>
                <div>
                    <Button variant={"ghost"} size={'sm'} className="bg-green-700/90 text-white rounded-full ">Publish</Button>
                </div>
            </header>
            <div className="">
                <RichTextEditor />
            </div>
        </div>
    )
}