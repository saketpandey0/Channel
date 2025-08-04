import { useEffect, useRef } from "react";
import { RxPerson } from "react-icons/rx";
import { MdOutlineBookmarks } from "react-icons/md";
import { CgNotes } from "react-icons/cg";
import { TfiBarChart } from "react-icons/tfi";
import { Separator } from "./shad"
import { Link, useNavigate } from "react-router-dom";
import { PiStarFourFill } from "react-icons/pi";
import { useCurrentUser } from "../hooks/useCurUser";
import { useLogout } from "../hooks/useLogout";

interface userDropdown {
    isOpen: boolean;
    onClose: () => void;
    avatarRef: React.RefObject<HTMLButtonElement | null>;
}
const BACKEND_URL = "http://localhost:3000"




function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${'*'.repeat(username.length)}@${domain}`;
  }

  const visible = username.slice(0, 2);
  const masked = '.'.repeat(Math.max(1, username.length - 2));

  return `${visible}${masked}@${domain}`;
}

export const UserDropdown: React.FC<userDropdown> = ({ isOpen, onClose, avatarRef}) =>{
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: userSession } = useCurrentUser();
    const { mutate: logout } = useLogout();

    const maskedEmail = userSession ? maskEmail(userSession.email) : "Not signed in";


    const handleSignOut = async () => {
        console.log("Sign out clicked");
        onClose();
        logout();
    }

    useEffect(()=>{
        const handleClickOutside = (event: MouseEvent) =>{
            if(
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                avatarRef.current && !avatarRef.current.contains(event.target as Node) 
            ){
                onClose();
                console.log("triggered")
            }
        };
        if(isOpen){
            console.log("triggered")
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            console.log("triggered")
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, avatarRef]);

    if(!isOpen) return null;

    const menuItems = [
        {
            icon: <RxPerson />,
            name: "Profile",
            pageLink: "/profile"
        },
        {
            icon: <MdOutlineBookmarks />,
            name: "Library",
            pageLink: "/library"      
        },
        {
            icon: <CgNotes />,
            name: "Stories",
            pageLink: "/stories"
        },
        {
            icon: <TfiBarChart />,
            name: "Stats",
            pageLink: "/stats"
        }
    ]
    const menuItems2 = [
        {
            name: "Settings",
            pageLink: "/settings"
        },
        {
            name: "Refine recommendations",
            pageLink: "/recomX"      
        },
        {
            name: "Manage publications",
            pageLink: "/pubX"
        },
        {
            name: "Help",
            pageLink: "/help"
        }
    ]
    const menuItems3 = [
        {
            name: `Become a memeber`,
            pageLink: "/membership",
            icon: <PiStarFourFill />
        },
        {
            name: "Create a Mastodon account",
            pageLink: "/mastxacc"      
        },
        {
            name: "Apply for author verification",
            pageLink: "/authxverify"
        },
        {
            name: "Apply to the Partner Program",
            pageLink: "/partnerxprog"
        },
        {
            name: "Gift a membership",
            pageLink: "/memxgift"
        }
    ]

    return (
        <div
            ref={dropdownRef}
            className="absolute top-14 right-0 w-60 bg-white rounded-xl m-1 shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200"
        >
            <div className="flex flex-col gap-1.5 pt-4 ">
                {menuItems.map((x, i)=>(
                    <Link to={x.pageLink}
                        key={i}
                        className="flex text-gray-500 font-normal cursor-pointer pt-2 hover:text-black/70"
                    >
                        <div className="flex justify-start pl-6 text-2xl">{x.icon}</div>
                        <span className="pl-8 text-base">{x.name}</span>
                    </Link>
                ))}
            </div>
            <Separator className="border border-gray-200/30 my-4"></Separator>
            <div className="flex flex-col gap-1">
                {menuItems2.map((x, i)=>(
                    <Link to={x.pageLink}
                    key={i}
                    className="flex text-gray-500 font-normal cursor-pointer pt-2 hover:text-black/70"
                    >
                        <span className="pl-6 text-base">{x.name}</span>
                    </Link>
                ))}
            </div>
            <Separator className="border border-gray-200/30 my-4"></Separator>
            <div className="flex flex-col gap-1 text-sm">
                {menuItems3.map((x, i)=>(
                    <Link to={x.pageLink}
                    key={i}
                    className="flex text-gray-500 font-normal cursor-pointer pt-2 hover:text-black/70"
                    >
                        <span className="pl-6">{x.name}</span>
                        <div className="flex pr-2 text-md text-yellow-500 pt-1 pl-2">{x.icon}</div>
                    </Link>
                ))}
            </div>
            <Separator className="border border-gray-200/30 my-4"></Separator>
            <div className="flex flex-col justify-start items-start text-gray-500 hover:text-black/70">
                <button onClick={()=>handleSignOut()} className="cursor-pointer text-md pl-6">Sign out</button>
                <span className="text-xs pl-6">{maskedEmail}</span>
            </div>
            <Separator className="border border-gray-200/30 my-4"></Separator>
        </div>
    )
}

