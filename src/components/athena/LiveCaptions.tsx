import React, { useState } from 'react';
import { Mic, Keyboard, Send, Check } from 'lucide-react';

interface LiveCaptionsProps {
  liveTranscript: string;
  isRecording: boolean;
  onManualTextSubmit?: (text: string) => void;
  disabled?: boolean;
}

export default function LiveCaptions({
  liveTranscript,
  isRecording,
  onManualTextSubmit,
  disabled = false
}: LiveCaptionsProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  const handleSend = () => {
    if (!typedAnswer.trim()) return;
    if (onManualTextSubmit) {
      onManualTextSubmit(typedAnswer.trim());
    }
    setTypedAnswer('');
    setShowTextInput(false);
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      {/* Primary Subtitle Bar */}
      <div className="w-full bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-lg flex flex-col space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              {isRecording ? 'Live Transcription Active' : 'Speech Engine Ready'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-0.5 rounded-md hover:bg-white/5"
            title="Toggle Text Input Fallback"
          >
            <Keyboard className="w-3.5 h-3.5 mr-1" />
            <span>{showTextInput ? 'Hide Text Fallback' : 'Voice/Text Fallback'}</span>
          </button>
        </div>

        {/* Live Speech Stream Display */}
        <div className="min-h-[42px] max-h-[72px] overflow-y-auto custom-scrollbar flex items-center">
          {liveTranscript ? (
            <p className="text-sm font-medium text-slate-100 leading-snug">
              <span className="text-indigo-400 mr-1.5 font-bold">You:</span>
              "{liveTranscript}"
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isRecording
                ? 'Speak naturally — live subtitles will transcribe here in real-time...'
                : 'Click "Start Speaking" or use the Text Fallback to provide your response.'}
            </p>
          )}
        </div>
      </div>

      {/* Manual Text Fallback Area */}
      {showTextInput && (
        <div className="w-full bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-3 shadow-xl flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300">
              Manual Response Input (Text Fallback)
            </span>
            <span className="text-[10px] text-slate-400">
              Useful in quiet rooms or with microphone issues
            </span>
          </div>
          <div className="flex space-x-2">
            <textarea
              rows={2}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your response here..."
              disabled={disabled}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!typedAnswer.trim() || disabled}
              className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-md font-bold text-xs"
            >
              <Send className="w-4 h-4 mr-1" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
