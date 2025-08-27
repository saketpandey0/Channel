import type { TabType, SearchResults } from "../../types/searchResult";

const ContentHeader: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchResults: SearchResults;
  searchQuery: string;
}> = ({ activeTab, setActiveTab, searchResults, searchQuery }) => {
  const tabs = [
    { key: 'stories' as const, label: 'Stories', count: searchResults.stories.length },
    { key: 'people' as const, label: 'People', count: searchResults.people.length },
    { key: 'publications' as const, label: 'Publications', count: searchResults.publications.length },
    { key: 'topics' as const, label: 'Topics', count: searchResults.topics.length }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Search Results for "{searchQuery}"
          </h1>
          <p className="text-gray-600">
            Found {Object.values(searchResults).flat().length} results across all categories
          </p>
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
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;