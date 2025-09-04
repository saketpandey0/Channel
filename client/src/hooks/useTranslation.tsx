import { useState } from "react";
import { translateWithMyMemory } from "../services/contentService";

const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = async (
    title: string,
    content: string,
    targetLang: string
  ) => {
    setIsTranslating(true);
    setError(null);

    try {
      const translatedTitle = await translateWithMyMemory(title, targetLang);
      const translatedContent = await translateWithMyMemory(content, targetLang);

      setIsTranslating(false);
      return { title: translatedTitle, content: translatedContent };
    } catch (err: any) {
      setIsTranslating(false);
      setError(err.message || "Translation failed");
      return { title, content };
    }
  };

  return { isTranslating, error, translateText };
};

export default useTranslation;
