import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import StoriesTab from "./tabs/StoriesTab";
import NotificationsTab from "./tabs/NotificationsTab";
import BookmarksTab from "./tabs/BookmarksTab";
import AboutTab from "./tabs/AboutTab";
import type { ProfileUser, ProfileViewContext } from "../../types/profile";

interface ProfileContentProps {
  activeTab: string;
  user: ProfileUser;
  viewContext: ProfileViewContext;
  onContentClick: (content: any) => void;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  activeTab,
  user,
  viewContext,
  onContentClick,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case "stories":
        return (
          <StoriesTab
            userId={user.id}
            viewContext={viewContext}
            onStoryClick={onContentClick}
            hovered={hovered}
            setHovered={setHovered}
          />
        );
      case "notifications":
        return (
          <NotificationsTab
            userId={user.id}
            viewContext={viewContext}
            onNotificationClick={onContentClick}
            hovered={hovered}
            setHovered={setHovered}
          />
        );
      case "bookmarks":
        return (
          <BookmarksTab
            userId={user.id}
            viewContext={viewContext}
            onBookmarkClick={onContentClick}
            hovered={hovered}
            setHovered={setHovered}
          />
        );
      case "about":
        return <AboutTab user={user} viewContext={viewContext} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


export default ProfileContent;