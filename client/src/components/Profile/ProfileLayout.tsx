import { ReactLenis } from "lenis/react";
import { useState, useRef } from "react";
import { AnimatePresence } from "motion/react";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import ProfileContent from "./ProfileContent";
import ContentPreview from "../Story/ContentPreview";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useProfileTabs } from "../../hooks/useProfileTabs";
import { ProfileUpdate } from "./ProfileUpdate";

interface ProfileLayoutProps {
  username: string;
  defaultTab: string; 
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ username, defaultTab }) => {
  const { profileUser, viewContext, isLoading } = useProfileContext(username);
  const { tabs, activeTab, setActiveTab } = useProfileTabs(profileUser, defaultTab, viewContext);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const editRef = useRef<HTMLButtonElement>(null);
  const handleContentClick = (content: any) => {
    setSelectedContent(content);
  };

  console.log("profileUser", profileUser);

  const handleClosePreview = () => {
    setSelectedContent(null);
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!profileUser) {
    return <div className="flex justify-center items-center min-h-screen">Profile not found</div>;
  }

  return (
    <ReactLenis root>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <main className="max-w-4xl flex-1">
              <ProfileHeader
                user={profileUser}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                viewContext={viewContext}
              />
              
              <ProfileContent
                activeTab={activeTab}
                user={profileUser}
                viewContext={viewContext}
                onContentClick={handleContentClick}
              />
            </main>

            <aside className="w-80 transition-all duration-300 hidden md:block">
              <ProfileSidebar
                user={profileUser}
                viewContext={viewContext}
                onEditProfile={handleEditProfile}
              />
            </aside>
          </div>
        </div>

        <AnimatePresence>
          {selectedContent && (
            <ContentPreview
              story={selectedContent}
              isOpen={!!selectedContent}
              onClose={handleClosePreview}
            />
          )}
        </AnimatePresence>

          <ProfileUpdate
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          editRef={editRef}
          user={profileUser}
        />
      </div>
    </ReactLenis>
  );
};