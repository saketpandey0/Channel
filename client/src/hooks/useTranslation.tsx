import { useState } from "react";
const translate = require("@vitalets/google-translate-api");



const useTranslation = () => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translateText = async (text: string, targetLang: string) => {
        setIsTranslating(true);
        setError(null);
        try {
            const res = await translate(text, { to: targetLang });
            setIsTranslating(false);
            return res.text;
        } catch (err: any) {
            setIsTranslating(false);
            setError(err.message || "Translation failed");
            return text;
        } finally {
            setIsTranslating(false);
        }
    };

    return {isTranslating, error, translateText};
}

export default useTranslation;