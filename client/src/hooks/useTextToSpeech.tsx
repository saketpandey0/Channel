import AudioService from "../services/audioService";

export const useTextToSpeech = () => {
  const service = AudioService.getInstance();

  return {
    service,
    languages: service.languages,
    speak: service.speak.bind(service),
    pause: service.pause.bind(service),
    resume: service.resume.bind(service),
    stop: service.stop.bind(service),
    isPlaying: service.isPlaying.bind(service),
    isPaused: service.isPaused.bind(service),
    getVoicesForLanguage: service.getVoicesForLanguage.bind(service),
    onStateChange: service.onStateChange.bind(service),
  };
};
