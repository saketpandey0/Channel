import React from 'react';
import { Avatar } from '../Shad';
import { Button } from '../Shad';
import { Link } from 'react-router-dom';
import { useFollowUser } from '../../hooks/useFollowUser';
import type { ProfileUser, ProfileViewContext } from '../../types/profile';
import { useRef } from 'react';

interface ProfileSidebarProps {
  user: ProfileUser;
  viewContext: ProfileViewContext;
  onEditProfile: () => void; 
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, viewContext, onEditProfile }) => {
  const { isFollowing, toggleFollow, isLoading, data } = useFollowUser(user.id, viewContext.isFollowing);
  const editRef = useRef<HTMLButtonElement>(null);
  console.log("sidebar", data.followersCount);

  const footerItems = [
    { name: "Help", pageLink: "/help" },
    { name: "Status", pageLink: "/status" },
    { name: "About", pageLink: "/about" },
    { name: "Careers", pageLink: "/careers" },
    { name: "Press", pageLink: "/press" },
    { name: "Blog", pageLink: "/blog" },
    { name: "Privacy", pageLink: "/privacy" },
  ];

  const bottomFooterItems = [
    { name: "Rules", pageLink: "/rules" },
    { name: "Terms", pageLink: "/terms" },
    { name: "Text to Speech", pageLink: "/text-to-speech" }
  ];

  const formatCount = (count: number): string => {
    if (typeof count === 'undefined') {
      return '0';
    }
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-6">
      <div className='flex flex-col bg-slate-100 shadow-slate-700/50 hover:shadow-xl min-h-[calc(100vh-48px)] p-6 rounded-xl shadow-sm border border-gray-100'>
        <div className='p-4 flex flex-col gap-2'>
            <Avatar className="border border-gray-600 size-18">
              <img
                src={user.avatar}
                // alt={user.name}
                className="size-18 rounded-full object-cover"
              />  
            </Avatar>  
        </div>
        <div>
        </div>
        <div className='flex flex-col justify-center pt-2 pl-4'>    
          <span className='text-base font-semibold text-black'>{user.name}</span>
          <span className='cursor-pointer text-base font-semibold text-gray-700 hover:text-black'>
            {data.followersCount ? formatCount(data.followersCount) : '0'} followers
          </span>
          {user.location && (
            <span className='text-sm text-gray-600'>{user.location}</span>
          )}
        </div>

        <div className='pt-2'>
          {viewContext.isOwner ? (
            <Button 
              ref={editRef}
              className='m-4 cursor-pointer rounded-2xl bg-gray-200 text-gray-900 hover:bg-gray-300 text-xs font-bold'
              onClick={onEditProfile}
            >
              Edit Profile
            </Button>
          ) : (
            <Button 
              onClick={toggleFollow}
              disabled={isLoading}
              className={`m-4 cursor-pointer rounded-2xl text-xs font-bold ${
                isFollowing 
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {(user.website || user.twitter || user.linkedin || user.github) && (
          <div className='flex flex-col gap-2 pt-4 pl-4'>
            <span className='font-bold'>Links</span>
            <div className='flex flex-col gap-1'>
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" 
                   className='text-xs text-blue-600 hover:underline'>
                  Website
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer"
                   className='text-xs text-blue-600 hover:underline'>
                  Twitter
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                   className='text-xs text-blue-600 hover:underline'>
                  LinkedIn
                </a>
              )}
              {user.github && (
                <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer"
                   className='text-xs text-blue-600 hover:underline'>
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}

        <div className='flex flex-col gap-2 pt-4 pl-4 min-h-[300px]'>
          <span className='font-bold'>Following</span>
          <Link 
            to={`/@${user.username}/following`}
            className='text-xs font-semibold text-gray-700 hover:text-black cursor-pointer'
          >
            See all ({user.followingCount})
          </Link>
        </div>

        <div className='flex flex-col gap-2 pt-4 bottom-0'>
          <div className='flex flex-wrap gap-1 text-xs text-gray-500'>
            {footerItems.map((item, index) => (
              <React.Fragment key={item.name}>
                <Link to={item.pageLink} className="hover:text-gray-700">
                  {item.name}
                </Link>
                {index < footerItems.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
          <div className='flex flex-wrap gap-1 text-xs text-gray-500'>
            {bottomFooterItems.map((item, index) => (
              <React.Fragment key={item.name}>
                <Link to={item.pageLink} className="hover:text-gray-700">
                  {item.name}
                </Link>
                {index < bottomFooterItems.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;