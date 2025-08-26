import { useEffect, useRef, useState } from "react";


export const useSpeechRecognition = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");

    const recognitionRef = useRef<any>(null);

    useEffect(()=> {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setIsSupported(true);
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onend = () => {
                setIsListening(false);
            }
        }
    }, []);


    const startListening = (onResult? : (text: string, isFinal: boolean) => void) => {
        if(recognitionRef.current && isSupported){
            recognitionRef.current.onresult = (event: any) => {
                let final = "";
                let interim = "";

                for(let i = event.resultIndex; i<event.results.length; i++){
                    const transcript = event.results[i][0].transcript; 
                    if(event.results[i].isFinal){
                        final += transcript;
                    }else {
                        interim += transcript;
                    }
                }

                if(interim) setInterimTranscript(interim);
                if(final) setFinalTranscript((prev) => prev + " " + final);
            };
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if(recognitionRef.current){
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const resetTranscript = () => {
        setFinalTranscript("");
        setInterimTranscript("");
    };

    return {
        isSupported,
        isListening,
        interimTranscript,
        finalTranscript,
        startListening,
        stopListening,
        resetTranscript
    }
}


export default useSpeechRecognition;