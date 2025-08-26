import { set } from "date-fns";
import { useEffect, useState } from "react";


const useTextToSpeech = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(()=> {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            setIsSupported(true);
        }
    }, []);

    const speak = (text: string, lang: string = "en-US") => {
        if(isSupported && text){
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            speechSynthesis.speak(utterance);
        }
    };

    const stop = () => {
        if(isSupported){
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return { isSupported, isSpeaking, speak, stop};
};


export default useTextToSpeech;