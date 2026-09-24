import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TextInput } from './components/TextInput';
import { VoiceSelector } from './components/VoiceSelector';
import { EmotionSelector } from './components/EmotionSelector';
import { PlaybackControls } from './components/PlaybackControls';
import { HamburgerMenu } from './components/HamburgerMenu';
import { ApkGuideModal } from './components/ApkGuideModal';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { EmotionType, VoiceType } from './types/tts';
import { AlertCircle, Sparkles, Key } from 'lucide-react';

export default function App() {
  const [text, setText] = useState<string>(
    'زن، زندگی، آزادی. آوای ایران آزاد، تبدیل متن فارسی و انگلیسی به صدای طبیعی و رسا.'
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('male');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('normal');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  const {
    isPlaying,
    isPaused,
    isSynthesizing,
    history,
    errorMessage,
    setErrorMessage,
    elevenLabsApiKey,
    elevenLabsVoiceId,
    isElevenLabsEnabled,
    elevenLabsVoices,
    isValidatingKey,
    offlineEngineMode,
    changeOfflineEngineMode,
    updateElevenLabsKey,
    toggleElevenLabsEnabled,
    selectElevenLabsVoice,
    loadElevenLabsVoices,
    speak,
    stop,
    pause,
    resume,
    handleDownloadWav,
    handleDownloadMp3,
    clearHistory,
    deleteHistoryItem,
  } = useSpeechSynthesis();

  const handlePlay = () => {
    speak(text, selectedVoice, selectedEmotion);
  };

  const handleHistoryPlay = (hText: string, hVoice: VoiceType, hEmotion: EmotionType) => {
    setText(hText);
    setSelectedVoice(hVoice);
    setSelectedEmotion(hEmotion);
    speak(hText, hVoice, hEmotion);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar with Hamburger Menu Button */}
      <Navbar
        isElevenLabsEnabled={isElevenLabsEnabled}
        hasApiKey={Boolean(elevenLabsApiKey.trim())}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-[11px]"
            >
              بستن
            </button>
          </div>
        )}

        {/* ElevenLabs Status Quick Banner when active */}
        {isElevenLabsEnabled && elevenLabsApiKey.trim() ? (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>حالت آنلاین ElevenLabs فعال است (کیفیت استودیویی فوق‌طبیعی)</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-emerald-400 hover:text-emerald-200 underline text-[11px]"
            >
              تغییر صدا یا کلید
            </button>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>پخش صدا با موتور روان مرورگر فعال است.</span>
            </span>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-medium"
            >
              <Key className="w-3 h-3" />
              <span>اتصال کلید ElevenLabs</span>
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <TextInput
          value={text}
          onChange={setText}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Voice Gender Selection */}
        <VoiceSelector
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Emotional Tone Selection */}
        <EmotionSelector
          selectedEmotion={selectedEmotion}
          onSelectEmotion={setSelectedEmotion}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Playback Controls & WAV/MP3 Export */}
        <PlaybackControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          isSynthesizing={isSynthesizing}
          isElevenLabs={isElevenLabsEnabled && Boolean(elevenLabsApiKey.trim())}
          onPlay={handlePlay}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onDownloadWav={() => handleDownloadWav(text, selectedVoice, selectedEmotion)}
          onDownloadMp3={() => handleDownloadMp3(text, selectedVoice, selectedEmotion)}
          disabled={!text.trim()}
        />
      </main>

      {/* Hamburger Drawer Menu (Settings, ElevenLabs API, History, APK) */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        apiKey={elevenLabsApiKey}
        isElevenLabsEnabled={isElevenLabsEnabled}
        selectedVoiceId={elevenLabsVoiceId}
        elevenLabsVoices={elevenLabsVoices}
        isValidatingKey={isValidatingKey}
        onUpdateKey={updateElevenLabsKey}
        onToggleEnabled={toggleElevenLabsEnabled}
        onSelectVoiceId={selectElevenLabsVoice}
        onRefreshVoices={loadElevenLabsVoices}
        offlineEngineMode={offlineEngineMode}
        onChangeOfflineEngineMode={changeOfflineEngineMode}
        history={history}
        onPlayHistoryItem={handleHistoryPlay}
        onSelectHistoryItem={(t) => setText(t)}
        onDeleteHistoryItem={deleteHistoryItem}
        onClearHistory={clearHistory}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
      />

      {/* APK Guide Modal */}
      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
      />
    </div>
  );
}
