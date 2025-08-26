import { ReactLenis } from "lenis/react";
import { useState, useRef } from "react";
import { AnimatePresence } from "motion/react";
import ProfileHeader from "./ContentHeader";
import ResultSidebar from "./ResultSidebar";
import ResultContent from "./ResultContent";
import ContentPreview from "../story/ContentPreview";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useProfileTabs } from "../../hooks/useProfileTabs";

interface ProfileLayoutProps {
  username: string;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ username }) => {
  const { profileUser, viewContext, isLoading } = useProfileContext(username);
  const { tabs, activeTab, setActiveTab } = useProfileTabs(profileUser, viewContext);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);

  const handleContentClick = (content: any) => {
    setSelectedContent(content);
  };

  const handleClosePreview = () => {
    setSelectedContent(null);
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
          {/* <div className="flex gap-8">
            <main className="max-w-4xl flex-1">
              <ProfileHeader
                user={profileUser}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                viewContext={viewContext}
              />
              
              <ResultContent
                activeTab={activeTab}
                user={profileUser}
                viewContext={viewContext}
                onContentClick={handleContentClick}
              />
            </main>

            <aside className="w-80 transition-all duration-300 hidden md:block">
              <ResultSidebar
                user={profileUser}
                viewContext={viewContext}
              />
            </aside>
          </div> */}
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

      </div>
    </ReactLenis>
  );
};