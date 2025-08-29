import { useState, useRef } from "react";
import useSpeechRecognition from "../../../hooks/useSpeechRecognition";
import useTextToSpeech from "../../../hooks/useTextToSpeech";
import { Mic, MicOff, X, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "../../shad";

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  onClose: () => void;
}

interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  isPlaying: boolean;
  audioUrl: string | null;
}


export default function VoiceRecorder({onTranscriptReady, onClose}: VoiceRecorderProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isProcessing: false,
    transcript: '',
    isPlaying: false,
    audioUrl: null,
  });

  const {isSupported: speechSupported, isListening, startListening, stopListening } = useSpeechRecognition();
  const {isSupported, isSpeaking, speak, stop } = useTextToSpeech();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.stop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav'});
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceState(prev => ({...prev, audioUrl, isRecording: false}));
      };

      mediaRecorderRef.current.start();
      setVoiceState(prev => ({...prev, isRecording: true}));

      if(speechSupported){
        startListening((text, isFinal) => {
          setVoiceState(prev => ({ ...prev, transcript: text, isFinal}));
        });
      }
    }catch (err){
      console.error("Error starting recording:", err);
    }
  };

  const handleStopRecording = async () => {
    if(mediaRecorderRef.current){
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if(speechSupported){
      stopListening();
    }
  };

  const handleInsertTranscript = () => {
    if(voiceState.transcript){
      onTranscriptReady(voiceState.transcript);
      onClose();
    }
  };

  const handlePlayAudio = () => {
    if(voiceState.audioUrl){
      const audio = new Audio(voiceState.audioUrl);
      audio.play();
      setVoiceState(prev => ({ ...prev, isPlaying: true }));
      audio.onended = () => setVoiceState(prev => ({ ...prev, isPlaying: false }));
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Voice Recorder</h3>
          <Button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex justify-center">
            <Button
              onClick={voiceState.isRecording ? handleStopRecording : handleStartRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                voiceState.isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {voiceState.isRecording ? (
                <MicOff size={24} className="text-white" />
              ) : (
                <Mic size={24} className="text-white" />
              )}
            </Button>
          </div>

          {/* Recording Status */}
          {voiceState.isRecording && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Recording...</span>
              </div>
            </div>
          )}

          {/* Transcript */}
          {voiceState.transcript && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Transcript:</h4>
              <p className="text-gray-700 text-sm">{voiceState.transcript}</p>
              <Button
                onClick={handleInsertTranscript}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Insert into Editor
              </Button>
            </div>
          )}

          {/* Audio Playback */}
          {voiceState.audioUrl && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                onClick={handlePlayAudio}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                {voiceState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <span className="text-sm text-gray-600">Play recording</span>
            </div>
          )}

          {voiceState.transcript && isSupported && (
            <Button
              onClick={() => isSpeaking ? stop() : speak(voiceState.transcript)}
              className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Volume2 size={16} />
              <span>{isSpeaking ? 'Stop Speaking' : 'Read Aloud'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}








































// import { useState } from "react";
// import { Mic, MicOff } from "lucide-react";


// export default function VoiceRecorder({ isRecording, onToggleRecording }) {
//   const [transcript, setTranscript] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleToggleRecording = () => {
//     if (isRecording) {
//       setIsProcessing(true);
//       // Simulate processing
//       setTimeout(() => {
//         setTranscript('Voice recording processed: This is a sample transcript of your voice note...');
//         setIsProcessing(false);
//       }, 2000);
//     }
//     onToggleRecording();
//   };

//   return (
//     <div className="border-t border-gray-200 p-4 bg-gray-50">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-medium text-gray-900">Voice Note</h3>
//         <Button
//           onClick={handleToggleRecording}
//           className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-colors ${
//             isRecording 
//               ? 'bg-red-100 text-red-700 hover:bg-red-200' 
//               : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//           }`}
//         >
//           {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
//           <span>{isRecording ? 'Stop' : 'Record'}</span>
//         </Button>
//       </div>
      
//       {isRecording && (
//         <div className="flex items-center space-x-2 text-red-600">
//           <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
//           <span className="text-sm">Recording...</span>
//         </div>
//       )}
      
//       {isProcessing && (
//         <div className="flex items-center space-x-2 text-blue-600">
//           <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//           <span className="text-sm">Processing voice...</span>
//         </div>
//       )}
      
//       {transcript && !isRecording && !isProcessing && (
//         <div className="mt-3 p-3 bg-white rounded border">
//           <p className="text-sm text-gray-700">{transcript}</p>
//           <Button className="mt-2 text-blue-600 text-sm hover:text-blue-800">
//             Insert into editor
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }