import React from 'react';
import {UserAvatar} from './shad/ui/userAvatar';
import { Button } from './shad';
import { Link } from 'react-router-dom';

const ProfileSidebar: React.FC = () => {

    const footerItems = [
        {
            name: "Help",
            pageLink: "/help"
        },
        {
            name: "Status",
            pageLink: "/status"
        },
        {
            name: "About",
            pageLink: "/about"
        },
        {
            name: "Careers",
            pageLink: "/careers"
        },
        {
            name: "Press",
            pageLink: "/press"
        },
        {
            name: "Blog",
            pageLink: "/blog"
        },
        {
            name: "Privacy",
            pageLink: "/privacy"
        },
    ]
    const bottomFooterItems = [
        {
            name: "Rules",
            pageLink: "/rules"
        },
        {
            name: "Terms",
            pageLink: "/terms"
        },
        {
            name: "Text to Speech",
            pageLink: "/text-to-speech"
        }
    ]

  return (
    <div className="space-y-6 ">
      <div className='flex flex-col bg-slate-100 shadow-slate-700/50 hover:shadow-xl min-h-[calc(100vh-48px)] p-6 rounded-xl shadow-sm border border-gray-100'>
        <div className='p-4'>
            <UserAvatar
                className="h-24 w-24 rounded-full transition group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-1"
                src={"https://avatars.githubusercontent.com/u/147219913?v=4" }
            />
        </div>
        <div className='flex flex-col justify-center  pt-2 pl-4'>    
            <span className='text-base font-semibold text-black'>Saket Pandey</span>
            <span className='cursor-pointer text-base font-semibold text-gray-700 hover:text-black'>9.8K followers</span>
        </div>
        <div className='pt-2'>
            <Button className='m-4 cursor-pointer rounded-2xl bg-gray-900 text-white shadow-slate-700/50 hover:shadow-md text-shadow-white text-shadow-2xs text-xs font-bold'>Follow</Button>
        </div>
        <div className='flex flex-col gap-2 pt-4 pl-4 min-h-[300px]'>
            <span className='font-bold'>Following</span>
            <span className='text-xs font-semibold text-gray-700 hover:text-black cursor-pointer'>See all (12)</span>
        </div>
        <div className='flex flex-col gap-2 pt-4 bottom-0'>
            <div className='flex flex-row gap-1 text-xs text-gray-500'>
                {footerItems.map((item) => (
                    <Link key={item.name} to={item.pageLink} >
                        {item.name}
                    </Link>
                ))}
            </div>
            <div className='flex flex-row gap-1 text-xs text-gray-500'>
                {bottomFooterItems.map((item) => (
                    <Link key={item.name} to={item.pageLink}>
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;