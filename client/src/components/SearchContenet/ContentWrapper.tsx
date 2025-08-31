import { useState } from "react";
import type { TabType } from "../../types/searchResult";
import ContentHeader from "./ContentHeader";
import ContentLayout from "./ContentLayout";
import ContentSidebar from "./ContentSidebar";
import { useLocation } from "react-router-dom";


const ContentWrapper: React.FC = () => {
  const location = useLocation();
  const { searchResults, searchQuery, activeTab: initialTab } = location.state || {};

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'stories');
  const [isLoading, setIsLoading] = useState(false);
  

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchResults={searchResults}
        searchQuery={searchQuery}
      />
      
      <div className="max-w-6xl mx-auto flex">
        <ContentLayout
          activeTab={activeTab}
          searchResults={searchResults}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
        
        <ContentSidebar
          searchResults={searchResults}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default ContentWrapper;