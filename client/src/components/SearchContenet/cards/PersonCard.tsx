import type { Person } from "../../../types/searchResult";
import { Check } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

type PersonCardProps = {
  person: Person;
  index: number;
  variant?: "compact" | "detailed";
  onClick?: (person: Person) => void;
};

const PersonCard = ({ person, index, variant, onClick }: PersonCardProps) => {
  const navigate = useNavigate();
  const baseAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 },
  };

  const handleClick = () => {
    if (onClick) {
      onClick(person);
    } else {
      navigate(`${person.username}/about`);
    }
  };

  return (
    <motion.div
      key={person.id}
      {...baseAnimation}
      className={`cursor-pointer rounded-lg transition-all duration-200 ${
        variant === "compact"
          ? `${"dark:hover:bg-black hover:bg-gray-100"} p-3`
          : "border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md"
      }`}
      onClick={handleClick}
    >
      <div className={`flex ${variant === "compact" ? "gap-3" : "gap-4"}`}>
        {person.avatar && (
            <img
                src={person.avatar}
                alt={person.name}
                className={`flex-shrink-0 rounded-full object-cover ${
                variant === "compact" ? "h-12 w-12" : "h-16 w-16"
                }`}
            />
        )}
        <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
                <h2
                    className={`font-semibold text-gray-900 dark:text-gray-200 ${
                        variant === "compact" ? "text-sm" : "text-lg"
                    }`}
                    >
                    {person.name}
                </h2>
                {person.isVerified && (
                    <span
                        className={`text-blue-500 ${
                        variant === "compact" ? "text-sm" : "text-xl"
                        }`}
                    >
                        <Check></Check>
                </span>
                )}
          </div>
          <p
            className={`mb-2 text-gray-500 ${
              variant === "compact" ? "text-xs" : "text-sm"
            }`}
          >
            @{person.username}
          </p>
          {person.bio && (
            <p
              className={`mb-3 text-gray-600 ${
                variant === "compact" ? "mt-1 line-clamp-2 text-xs" : "text-sm"
              }`}
            >
              {person.bio}
            </p>
          )}
          <p
            className={`text-gray-500 ${
              variant === "compact" ? "mt-1 text-xs" : "text-sm"
            }`}
          >
            {person.followerCount.toLocaleString()} followers
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonCard;
