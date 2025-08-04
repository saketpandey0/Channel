import { Link } from "react-router-dom";
import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { ContentSearch } from "./ContentSearch";
import { Avatar } from "./Avatar";
import { useRef, useState, useEffect } from "react";
import { UserDropdown } from "./UserDropdown";
import { useCurrentUser } from "../hooks/useCurUser";
import { SquarePen, BellRing, Bell } from "lucide-react";

export const Appbar = () => {
  const { data: userSession } = useCurrentUser();
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [isUserDropdown, setIsUserDropdown] = useState(false);
  const [showAppbar, setShowAppbar] = useState(true);
  const [notification, setNotification] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { scrollY } = useScroll();
  


  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowAppbar(currentScrollY < lastScrollY || currentScrollY < 50);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      setScrolled(false);
    } else {
      setScrolled(true);
    }
  });

  return (
    <motion.nav
      className="sticky mx-auto wrapper top-0 z-30 flex items-center gap-0 w-[calc(100%-20px)] px-4"
      animate={{
        y: showAppbar ? 0 : -100,
        // width: scrolled ? "100%" : "100%",
      }}
      transition={{ duration: 0.3, ease: "linear" }}
    >
      <div className="bg-secondary/15 border-primary/10 mx-auto flex w-full justify-between rounded-4xl border p-2 shadow-lg shadow-neutral-600/5 backdrop-blur-lg">
        <Link to={"/"} className="flex cursor-pointer items-center gap-1">
          <motion.img
            whileHover={{
              rotate: [0, -5, 5, -5, 5, 0],
              transition: {
                duration: 1,
                ease: "easeInOut",
                repeat: 5,
                repeatType: "reverse",
              },
            }}
            src={
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4k8aHy_xQjnU20kJs4iZnrM3hfjP6-ZzczGkrNzlvIzpGPC__Z831DTw&s"
            }
            alt="Logo"
            width={300}
            height={200}
            className="size-10 rounded-full"
          />
          <span className="text-foreground font-Bodoni hidden text-lg font-bold tracking-tight text-shadow-lg hover:text-shadow-lg/20 md:block md:text-2xl">
            Channel
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <ContentSearch />
          {userSession && (
            <div className="flex flex-row gap-6">
              <Link
                to={"/editor"}
                className="flex cursor-pointer flex-col text-gray-700 hover:text-black"
              >
                <button className="cursor-pointer">
                  <SquarePen />
                </button>
                <span className="text-xs font-thin">Write</span>
              </Link>
              <Link
                to={"/notification"}
                className="cursor-pointer pt-2 text-gray-700 hover:text-black"
              >
                {notification ? <BellRing /> : <Bell />}
              </Link>
              <button
                ref={avatarRef}
                onClick={() => setIsUserDropdown((prev) => !prev)}
                className="cursor-pointer "
              >
                <Avatar />
              </button>
            </div>
          )}
          {!userSession && (
            <div className="mx-auto flex gap-2">
              <Link to={"/auth/signin"}>
                <button className="text-md rounded-xl bg-blue-400 p-2 text-white shadow-lg text-shadow-lg/20 hover:shadow-xl/30">
                  Sign in
                </button>
              </Link>
              <Link to={"/auth/signup"}>
                <button className="text-md rounded-2xl bg-black p-2 text-white shadow-lg text-shadow-lg/20 hover:shadow-xl/30">
                  Get started
                </button>
              </Link>
            </div>
          )}
        </div>
        <UserDropdown
          isOpen={isUserDropdown}
          onClose={() => setIsUserDropdown(false)}
          avatarRef={avatarRef}
        />
      </div>
    </motion.nav>
  );
};

