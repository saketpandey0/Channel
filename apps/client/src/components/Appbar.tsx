import { Link } from "react-router-dom"
import {motion} from 'motion/react'
import { ContentSearch } from "./ContentSearch";
import { Avatar } from "./Avatar";
import { useRef, useState } from "react";
import { UserDropdown } from "./UserDropdown";



export const Appbar = () => {
  const userSession = sessionStorage.getItem('session');
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [isUserDropdown, setIsUserDropdown] = useState(false);

  return (
    <nav className="sticky mx-auto wrapper top-0 z-30 flex items-center gap-2 py-6 w-full">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", type: "spring", damping: 10 }}
        className="flex w-full justify-between mx-auto bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-primary/10 p-6 rounded-2xl"
      >
        <Link to={"/"} className="flex items-center gap-1 cursor-pointer">
          <motion.img
            whileHover={{
              rotate: [0, -5, 5, -5, 5, 0], 
              transition: {
                duration: 1, 
                ease: "easeInOut", 
                repeat: 5, 
                repeatType: "reverse" 
              }
            }}

            src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4k8aHy_xQjnU20kJs4iZnrM3hfjP6-ZzczGkrNzlvIzpGPC__Z831DTw&s"}
            alt="Logo"
            width={300}
            height={200}
            className="rounded-full size-10"
          />
          <span className="text-lg md:text-2xl font-bold tracking-tight text-foreground hidden md:block text-shadow-lg hover:text-shadow-lg/20 font-Bodoni">
            Channel
          </span>
        </Link>
        <div className="flex items-center gap-8">
          {userSession && 
          <ContentSearch />
           && <button 
            ref={avatarRef}
            onClick={()=> setIsUserDropdown((prev) => !prev)}
            className="cursor-pointer"
          >
            <Avatar></Avatar>
          </button>}
          {!userSession && 
            <div className="flex gap-2 mx-auto">
              <Link to={"/auth/signin"}>
                <button className="rounded-xl bg-blue-400 p-2 text-white text-md text-shadow-lg/20 shadow-lg hover:shadow-xl/30">
                  Sign in
                </button>
              </Link>
              <Link to={'/auth/signup'}>
                <button className="rounded-2xl bg-black p-2 text-white text-md text-shadow-lg/20 shadow-lg hover:shadow-xl/30">
                  Get started
                </button>
              </Link>
            </div>
          }
        </div>
        <UserDropdown 
          isOpen={isUserDropdown}
          onClose={() => setIsUserDropdown(false)}
          avatarRef={avatarRef}
        />
      </motion.div>
    </nav>
  );
};