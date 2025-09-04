import type { Topic } from "../../../types/searchResult";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";


type TopicCardProps = {
  topic: Topic;
  index: number;
  variant?: "compact" | "detailed";
  onClick?: (topic: Topic) => void;
};

const TopicCard = ({ topic, index, variant = "compact", onClick }: TopicCardProps) => {
    const navigate = useNavigate();
    const baseAnimation = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.05 }
    };

    const handleClick = () => {
        if (onClick) {
            onClick(topic);
        } else {
            navigate(`/topic/${topic.name}`);
        }
    };

  return (
    <motion.div
        key={topic.id}
        {...baseAnimation}
        className={`cursor-pointer transition-all duration-200 rounded-lg ${
            variant === "compact"
            ? `${index === 0 ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"} p-3`
            : "bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md"
        }`}
        onClick={handleClick}
        >
        <div className="flex-1">
            <h2 className={`font-semibold text-gray-900 mb-2 ${
                variant === "compact" ? "text-sm" : "text-lg"
            }`}>
                {topic.name}
            </h2>
            {topic.description && (
                <p className={`text-gray-600 mb-3 ${
                    variant === "compact"
                    ? "text-xs line-clamp-2 mt-1"
                    : "text-sm"
                }`}>
                    {topic.description}
                </p>
            )}
            <p className={`text-gray-500 ${
                variant === "compact" ? "text-xs mt-1" : "text-sm"
            }`}>
                {topic.storyCount.toLocaleString()} stories
            </p>
        </div>
    </motion.div>
  );
};

export default TopicCard;