// services/AudioService.ts
export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
}

export interface Language {
  code: string;
  name: string;
  voice?: string; // voice code prefix (like "en-US" or "hi-IN")
}

class AudioService {
  private static instance: AudioService;
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioStateCallbacks: ((state: Partial<AudioState>) => void)[] = [];

  public languages: Language[] = [
    { code: "en-US", name: "English (US)", voice: "en-US" },
    { code: "hi-IN", name: "Hindi", voice: "hi-IN" },
    { code: "fr-FR", name: "French", voice: "fr-FR" },
  ];

  private constructor() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      throw new Error("Speech Synthesis not supported in this environment");
    }
    this.speechSynthesis = window.speechSynthesis;
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public speak(text: string, language: string): void {
    this.stop(); // stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);

    // pick language & voice
    const lang = this.languages.find((l) => l.code === language);
    if (lang?.voice) {
      utterance.lang = lang.voice;
      const voices = this.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(lang.voice!));
      if (voice) utterance.voice = voice;
    }

    // event listeners
    utterance.onstart = () => this.notifyStateChange({ isPlaying: true, isPaused: false });
    utterance.onend = () => {
      this.notifyStateChange({ isPlaying: false, isPaused: false });
      this.currentUtterance = null;
    };
    utterance.onpause = () => this.notifyStateChange({ isPaused: true });
    utterance.onresume = () => this.notifyStateChange({ isPaused: false });

    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  public pause(): void {
    if (this.speechSynthesis.speaking && !this.speechSynthesis.paused) {
      this.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
  }

  public stop(): void {
    this.speechSynthesis.cancel();
    this.currentUtterance = null;
    this.notifyStateChange({ isPlaying: false, isPaused: false });
  }

  public isPlaying(): boolean {
    return this.speechSynthesis.speaking && !this.speechSynthesis.paused;
  }

  public isPaused(): boolean {
    return this.speechSynthesis.paused;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.speechSynthesis.getVoices();
  }

  public getVoicesForLanguage(languageCode: string): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    const lang = this.languages.find((l) => l.code === languageCode);
    if (!lang?.voice) return [];
    return voices.filter((v) => v.lang.startsWith(lang.voice!));
  }

  public onStateChange(callback: (state: Partial<AudioState>) => void): () => void {
    this.audioStateCallbacks.push(callback);
    return () => {
      const idx = this.audioStateCallbacks.indexOf(callback);
      if (idx > -1) this.audioStateCallbacks.splice(idx, 1);
    };
  }

  private notifyStateChange(state: Partial<AudioState>): void {
    this.audioStateCallbacks.forEach((cb) => cb(state));
  }
}

export default AudioService;
