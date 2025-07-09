// import { useEffect, useRef, useState, useDeferredValue } from "react";
// import { Link } from "react-router-dom";
// import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
// import Fuse from "fuse.js";




// export const ContentSearch = ({ blogs }: {blogs: BlogPros[]}){
//     const [dialogOpen, setDialogOpen] = useState(false);
//     const [input, setInput] = useState("");
//     const [searchBlogs, setSearchBlogs] = useState<any[]>([]);
//     const [selectedIndex, setSelectedIndex] = useState(-1);

//     useEffect(() => {
//         const updatedBlogs: DataItem[] = [];
//         blogs.map((t) => {
//         t.problems.map((p) => {
//             updatedTracks.push({
//             payload: {
//                 problemId: p.id,
//                 blogTitle: t.title,
//                 problemTitle: p.title,
//                 blogId: t.id,
//                 image: t.image,
//             },
//             });
//         });
//         });
//         setAllTracks(updatedTracks);
//     }, []);
// }