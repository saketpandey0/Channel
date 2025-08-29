import { useState } from "react";
import useTranslation from "../../hooks/useTranslation";
import { X, Languages } from "lucide-react";


interface TranslationState {
  isTranslating: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
}


const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' }
];



interface TranslationToolProps {
  selectedText: string;
  onTranslatedText: (text: string) => void;
  onClose: () => void;
}

export default function TranslationTool({ selectedText, onTranslatedText, onClose }: TranslationToolProps) {
  const [translationState, setTranslationState] = useState<TranslationState>({
    isTranslating: false,
    sourceLanguage: 'en',
    targetLanguage: 'es',
    translatedText: '',
  });

  const { isTranslating, translateText } = useTranslation();

  const handleTranslate = async () => {
    if (selectedText) {
      setTranslationState(prev => ({ ...prev, isTranslating: true }));
      try {
        const translated = await translateText(selectedText, translationState.targetLanguage);
        setTranslationState(prev => ({ 
          ...prev, 
          translatedText: translated, 
          isTranslating: false 
        }));
      } catch (error) {
        console.error('Translation error:', error);
        setTranslationState(prev => ({ ...prev, isTranslating: false }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Translate Text</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Language Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={translationState.sourceLanguage}
                onChange={(e) => setTranslationState(prev => ({ ...prev, sourceLanguage: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={translationState.targetLanguage}
                onChange={(e) => setTranslationState(prev => ({ ...prev, targetLanguage: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Original Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Text</label>
            <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700">
              {selectedText}
            </div>
          </div>

          {/* Translation Button */}
          <button
            onClick={handleTranslate}
            disabled={translationState.isTranslating}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {translationState.isTranslating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages size={16} />
                <span>Translate</span>
              </>
            )}
          </button>

          {/* Translated Text */}
          {translationState.translatedText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Translated Text</label>
              <div className="p-3 bg-blue-50 rounded border text-sm text-gray-700 mb-3">
                {translationState.translatedText}
              </div>
              <button
                onClick={() => {
                  onTranslatedText(translationState.translatedText);
                  onClose();
                }}
                className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Insert Translation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}