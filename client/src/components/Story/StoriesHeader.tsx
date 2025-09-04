import { Compass, TrendingUp, Newspaper } from "lucide-react";


interface TabType {
  key: string;
  name: string;
  icon: React.ComponentType<any>;
}

const StoriesHeader: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}> = ({ activeTab, setActiveTab }) => {

  const tabs = [
    { key: "trending", name: "Trending", icon: TrendingUp, count: 0 },
    { key: "related", name: "Related", icon: Compass, count: 0 },
    { key: "feed", name: "Feed", icon: Newspaper, count: 0 },
  ];

  

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-4">

        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesHeader;