"use client"
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {Button} from "./../../../../packages/ui/src/shad/ui/button";
import {Dialog, DialogContent} from "./../../../../packages/ui/src/shad/ui/dailog"
import { ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "data-fns"


type BlogPreviewProps = {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    blog: any;
};

const truncateDescription = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if(words.length > wordLimit){
        return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
}



export const BlogPreview({showPreview, setShowPreview, blog})