import { Avatar } from "../Shad";
import { motion } from "motion/react";
import type { ProfileUser, ProfileViewContext, ProfileTabConfig } from "../../types/profile";
import { GiFeather } from "react-icons/gi";

interface ProfileHeaderProps {
  user: ProfileUser;
  tabs: ProfileTabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  viewContext: ProfileViewContext;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  tabs,
  activeTab,
  onTabChange,
  viewContext
}) => {
  return (
    <div className="rounded-xl border p-6 shadow-sm shadow-slate-700/50 hover:shadow-lg mx-auto">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="block md:hidden">
            <Avatar className="border border-blue-600 size-18 flex items-center justify-center bg-gray-200 text-blue-600 font-semibold">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="sm:size-10 size-18 rounded-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </Avatar>
          </div>
          <h1 className="sm:text-4xl font-bold text-gray-900 dark:text-gray-300 text-xl">
            {user.name}
          </h1>
          {user.isVerified && (
            <span className="text-2xl text-blue-500 hidden sm:block">
              <GiFeather />
            </span>
          )}
        </div>
        {viewContext.isOwner ? (
          <button className="mb-10 cursor-pointer border-none text-4xl text-black">
            ...
          </button>
        ) : (
          <div className="flex gap-2">
            {viewContext.canMessage && (
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-400 hidden md:block">
                Message
              </button>
            )}
            {viewContext.canReport && (
              <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                •••
              </button>
            )}
          </div>
        )}
      </div>

      {user.bio && (
        <p className="text-gray-600 mb-4">{user.bio}</p>
      )}

      <div className="flex flex-row gap-6 text-sm font-semibold">
        {tabs.filter(tab => tab.visible).map((tab) => (
          <motion.span
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`cursor-pointer text-gray-700 hover:text-black relative ${
              activeTab === tab.id ? "text-black" : ""
            }`}
            whileHover={{ y: -1 }}
          >
            {tab.name}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-gray-500">({tab.count})</span>
            )}
            {activeTab === tab.id && (
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-black rounded-full"
                layoutId="activeTab"
              />
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
};


export default ProfileHeader;