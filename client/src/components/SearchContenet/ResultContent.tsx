import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Grid, List } from "lucide-react";
import StoryCard from "./cards/StoryCard";
import PublicationCard from "./cards/PublicationCard";
import PersonCard from "./cards/PersonCard";
import TopicCard from "./cards/TopicCard";
import type {
  StoryPost,
  Person,
  Publication,
  Topic,
} from "../../types/searchResult";

interface ProfileContentProps {
  activeTab: string;
  onContentClick: (content: any) => void;
  stories?: StoryPost[];
  publications?: Publication[];
  people?: Person[];
  topics?: Topic[];
}

const ResultContent: React.FC<ProfileContentProps> = ({
  activeTab,
  onContentClick,
  stories = [],
  publications = [],
  people = [],
  topics = [],
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("compact");

  const renderContent = (
    items: any[],
    CardComponent: React.ComponentType<any>,
  ) => {
    if (!items.length) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-lg font-medium">No content found</p>
          <p className="text-sm">Check back later for updates</p>
        </div>
      );
    }

    return (
      <div className={viewMode === "detailed" ? "space-y-6" : "space-y-2"}>
        {items.map((item, index) => (
          <CardComponent
            key={item.id}
            {...{ [activeTab.slice(0, -1)]: item }}
            index={index}
            variant={viewMode}
            onClick={onContentClick}
            hovered={hovered}
            setHovered={setHovered}
          />
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "stories":
        return renderContent(stories, StoryCard);
      case "publications":
        return renderContent(publications, PublicationCard);
      case "people":
        return renderContent(people, PersonCard);
      case "topics":
        return renderContent(topics, TopicCard);
      default:
        return null;
    }
  };

  const showViewToggle = !["about"].includes(activeTab);

  return (
    <div className="mt-8">
      {showViewToggle && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              View:
            </span>
            <div className="flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "compact"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                <List size={16} />
                Compact
              </button>
              <button
                onClick={() => setViewMode("detailed")}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "detailed"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                <Grid size={16} />
                Detailed
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 ${
          viewMode === "detailed"
            ? "bg-gray-50 p-6 dark:bg-gray-900/50"
            : "bg-white p-4 dark:bg-gray-900"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultContent;
