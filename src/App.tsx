import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TextInput } from './components/TextInput';
import { EngineSelector } from './components/EngineSelector';
import { VoiceSelector } from './components/VoiceSelector';
import { EmotionSelector } from './components/EmotionSelector';
import { AudioTuningControls } from './components/AudioTuningControls';
import { PlaybackControls } from './components/PlaybackControls';
import { HamburgerMenu } from './components/HamburgerMenu';
import { ApkGuideModal } from './components/ApkGuideModal';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { EmotionType, VoiceType } from './types/tts';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [text, setText] = useState<string>(
    'زن، زندگی، آزادی. آوای ایران، تبدیل هوشمند متن فارسی و انگلیسی به صدای طبیعی، روان و رسا.'
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('female');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('normal');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  const {
    isPlaying,
    isPaused,
    isSynthesizing,
    activeEngineMode,
    changeActiveEngineMode,
    speechSpeed,
    setSpeechSpeed,
    speechPitch,
    setSpeechPitch,
    history,
    errorMessage,
    setErrorMessage,
    elevenLabsApiKey,
    elevenLabsVoiceId,
    customVoiceId,
    setCustomVoiceId,
    isElevenLabsEnabled,
    elevenLabsVoices,
    isValidatingKey,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden" dir="rtl">
      {/* Background Ambience Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar
        isElevenLabsEnabled={isElevenLabsEnabled}
        hasApiKey={Boolean(elevenLabsApiKey.trim())}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              {!elevenLabsApiKey.trim() && activeEngineMode === 'elevenlabs' && (
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setIsMenuOpen(true);
                  }}
                  className="text-xs bg-rose-500/30 hover:bg-rose-500/40 text-white px-2 py-1 rounded font-bold"
                >
                  تنظیم کلید در منو
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-[11px] bg-slate-900/60"
              >
                بستن
              </button>
            </div>
          </div>
        )}

        {/* Engine Selection & Online Character Selection on Main Page (API key is in Hamburger menu) */}
        <EngineSelector
          activeMode={activeEngineMode}
          onChangeMode={changeActiveEngineMode}
          hasApiKey={Boolean(elevenLabsApiKey.trim())}
          selectedVoiceId={elevenLabsVoiceId}
          onSelectVoiceId={selectElevenLabsVoice}
          customVoiceId={customVoiceId}
          onChangeCustomVoiceId={setCustomVoiceId}
          elevenLabsVoices={elevenLabsVoices}
          isValidatingKey={isValidatingKey}
          onRefreshVoices={() => loadElevenLabsVoices()}
          onOpenSettingsMenu={() => setIsMenuOpen(true)}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Text Input Area with Pre-made Samples */}
        <TextInput
          value={text}
          onChange={setText}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Voice Character & Personality Selection directly on Main Page */}
        <VoiceSelector
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          activeMode={activeEngineMode}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Speech Emotion & Tone Selection directly on Main Page */}
        <EmotionSelector
          selectedEmotion={selectedEmotion}
          onSelectEmotion={setSelectedEmotion}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Audio Tuning (Speed & Pitch) Controls */}
        <AudioTuningControls
          speed={speechSpeed}
          onSpeedChange={setSpeechSpeed}
          pitch={speechPitch}
          onPitchChange={setSpeechPitch}
          disabled={isPlaying || isSynthesizing}
        />

        {/* Playback Controls & Audio Export */}
        <PlaybackControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          isSynthesizing={isSynthesizing}
          activeMode={activeEngineMode}
          onPlay={handlePlay}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onDownloadWav={() => handleDownloadWav(text, selectedVoice, selectedEmotion)}
          onDownloadMp3={() => handleDownloadMp3(text, selectedVoice, selectedEmotion)}
          disabled={!text.trim()}
        />
      </main>

      {/* Hamburger Drawer Menu (Settings, History, APK Guide) */}
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
