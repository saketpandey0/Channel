import type { Publication } from "../../../types/searchResult"
import { motion } from "motion/react"
import { useNavigate } from "react-router-dom"


type PublicatioCardProps = {
    publication: Publication;
    index: number;
    variant?: "compact" | "detailed";
    onClick?: (publication: Publication) => void;
}


const PublicationCard = ({publication, index, variant, onClick}: PublicatioCardProps) => {
    const navigate = useNavigate();
    
    const baseAnimation = { 
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.05 }
    }
    const handleClick = () => {
        if(onClick){
            onClick(publication);
        }else {
            navigate(`/publication/${publication.slug}`);
        }
    }

    return (
    <motion.div
      key={publication.id}
      {...baseAnimation}
      className={`cursor-pointer transition-all duration-200 rounded-lg ${
        variant === "compact"
          ? `${index === 0 ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"} p-3`
          : "bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md"
      }`}
      onClick={handleClick}
    >
      <div className={`flex ${variant === "compact" ? "gap-3" : "gap-4"}`}>
        {publication.image && (
            <img
                src={publication.image}
                alt={publication.name}
                className={`rounded-lg object-cover flex-shrink-0 ${
                variant === "compact" ? "w-12 h-12" : "w-16 h-16"
                }`}
            />
        )}
        <div className="flex-1 min-w-0">
            <h2 className={`font-semibold text-gray-900 mb-2 ${
                variant === "compact" ? "text-sm" : "text-lg"
            }`}>
                {publication.name}
            </h2>
            {publication.description && (
                <p className={`text-gray-600 mb-3 ${
                variant === "compact"
                    ? "text-xs line-clamp-2 mt-1"
                    : "text-sm"
                }`}>
                {publication.description}
                </p>
            )}
            <p className={`text-gray-500 ${
                variant === "compact" ? "text-xs mt-1" : "text-sm"
            }`}>
                {publication.followerCount.toLocaleString()} followers
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicationCard