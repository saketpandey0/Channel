import { PiHandsClappingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import {
  clapStory,
  removeClap,
  storyClapStatus,
} from "../../api/featureServices";

interface ClapButtonProps {
  story: {
    id: string;
    claps: number;
  };
  storyId: string;
}

export const ClapButton: React.FC<ClapButtonProps> = ({ story, storyId }) => {
  const [clapped, setClapped] = useState(false);
  const [clapCount, setClapCount] = useState(story.claps || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClapStatus = async () => {
      try {
        const res = await storyClapStatus(storyId);
        setClapped(res.clapped);
        if (res.clapCount !== undefined) {
          setClapCount(res.clapCount);
        }
      } catch (err: any) {
        console.error(
          "Failed to fetch clap status:",
          err.response?.data || err.message,
        );
        setError("Failed to fetch clap status");
      }
    };
    fetchClapStatus();
  }, [storyId]);

  const handleClap = async () => {
    setLoading(true);
    try {
      if (clapped) {
        await removeClap(storyId);
        setClapped(false);
        setClapCount((prev) => Math.max(prev - 1, 0));
      } else {
        await clapStory(storyId);
        setClapped(true);
        setClapCount((prev) => prev + 1);
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        setClapped(true); // already clapped
      } else {
        setError(err.response?.data?.error || "Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <button
        className="flex cursor-pointer items-center gap-2 text-gray-600 transition-colors hover:text-red-500"
        onClick={handleClap}
      >
        <PiHandsClappingThin className={`h-5 w-5 ${clapped ? "text-yellow-500" : "text-gray-500"}`} />
        <span>{clapCount > 0 ? clapCount : "0"}</span>
      </button>
    </>
  );
};
