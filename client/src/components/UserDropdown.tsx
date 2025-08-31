import { useEffect, useRef } from "react";
import { RxPerson } from "react-icons/rx";
import { MdOutlineBookmarks } from "react-icons/md";
import { CgNotes } from "react-icons/cg";
import { TfiBarChart } from "react-icons/tfi";
import { Separator } from "./Shad";
import { Link } from "react-router-dom";
import { PiStarFourFill } from "react-icons/pi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


interface UserDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    avatarRef: React.RefObject<HTMLButtonElement | null>;
}


function maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
        return `${'*'.repeat(username.length)}@${domain}`;
    }

    const visible = username.slice(0, 2);
    const masked = '.'.repeat(Math.max(1, username.length - 2));

    return `${visible}${masked}@${domain}`;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose, avatarRef }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {logoutAuth, useCurrentUser} = useAuth();
    const { data: user } = useCurrentUser();
    const maskedEmail = user?.email 
        ? maskEmail(user.email) 
        : user?.username || "Loading...";
    
    const handleSignOut = async () => {
        onClose();
        logoutAuth.mutate(undefined, {
            onSuccess: () => {
            },
            onError: () => {
                console.log("failed logout")
            }
        });
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                avatarRef.current && 
                !avatarRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, avatarRef]);

    if (!isOpen) return null;

    const menuItems = [
        {
            icon: <RxPerson />,
            name: "Profile",
            pageLink: `/${user.username}`
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
    ];

    const menuItems2 = [
        {
            name: "Settings",
            pageLink: "/settings"
        },
        {
            name: "Refine recommendations",
            pageLink: "/recommendations"      
        },
        {
            name: "Manage publications",
            pageLink: "/publications"
        },
        {
            name: "Help",
            pageLink: "/help"
        }
    ];

    const menuItems3 = [
        {
            name: "Become a member",
            pageLink: "/membership",
            icon: <PiStarFourFill />
        },
        {
            name: "Create a Mastodon account",
            pageLink: "/mastodon"      
        },
        {
            name: "Apply for author verification",
            pageLink: "/verification"
        },
        {
            name: "Apply to the Partner Program",
            pageLink: "/partner"
        },
        {
            name: "Gift a membership",
            pageLink: "/gift"
        }
    ];

    return (
        <div
            ref={dropdownRef}
            className="absolute top-14 right-0 w-60 bg-white rounded-xl m-1 shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200"
        >
            <div className="flex flex-col gap-1.5 pt-4">
                {menuItems.map((item, index) => (
                    <Link 
                        to={item.pageLink}
                        key={index}
                        className="flex items-center text-gray-500 font-normal cursor-pointer py-2 hover:text-black/70 transition-colors"
                        onClick={onClose}
                    >
                        <div className="flex justify-start pl-6 text-xl">{item.icon}</div>
                        <span className="pl-4 text-base">{item.name}</span>
                    </Link>
                ))}
            </div>
            
            <Separator className="border-t border-gray-200/30 my-4" />
            
            <div className="flex flex-col gap-1">
                {menuItems2.map((item, index) => (
                    <Link 
                        to={item.pageLink}
                        key={index}
                        className="flex items-center text-gray-500 font-normal cursor-pointer py-2 hover:text-black/70 transition-colors"
                        onClick={onClose}
                    >
                        <span className="pl-6 text-base">{item.name}</span>
                    </Link>
                ))}
            </div>
            
            <Separator className="border-t border-gray-200/30 my-4" />
            
            <div className="flex flex-col gap-1 text-sm">
                {menuItems3.map((item, index) => (
                    <Link 
                        to={item.pageLink}
                        key={index}
                        className="flex items-center justify-between text-gray-500 font-normal cursor-pointer py-2 hover:text-black/70 transition-colors"
                        onClick={onClose}
                    >
                        <span className="pl-6">{item.name}</span>
                        {item.icon && (
                            <div className="flex pr-6 text-lg text-yellow-500">{item.icon}</div>
                        )}
                    </Link>
                ))}
            </div>
            
            <Separator className="border-t border-gray-200/30 my-4" />
            
            <div className="flex flex-col justify-start items-start pb-4">
                <button 
                    onClick={handleSignOut} 
                    className="cursor-pointer text-base text-gray-500 hover:text-black/70 pl-6 py-1 transition-colors"
                >
                    Sign out
                </button>
                <span className="text-xs text-gray-400 pl-6 mt-1">{maskedEmail}</span>
            </div>
        </div>
    );
};