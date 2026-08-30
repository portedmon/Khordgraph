import React from 'react';
import { Maximize, Monitor, Sparkles, X } from 'lucide-react';

interface FullscreenPromptModalProps {
  isOpen: boolean;
  onEnterFullscreen: () => void;
  onContinueNormal: () => void;
  dontShowAgain: boolean;
  onToggleDontShowAgain: (checked: boolean) => void;
}

export const FullscreenPromptModal: React.FC<FullscreenPromptModalProps> = ({
  isOpen,
  onEnterFullscreen,
  onContinueNormal,
  dontShowAgain,
  onToggleDontShowAgain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Maximize className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                全画面表示が推奨されます
              </h2>
              <p className="text-xs text-white/50">
                Optimal Display & Experience
              </p>
            </div>
          </div>
          <button
            onClick={onContinueNormal}
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 text-sm text-white/80">
          <p className="leading-relaxed">
            <strong className="text-white">Khordgraph</strong> は、五線譜の音符表記・37鍵盤・度数ガイド・コード進行シーケンサーなど、豊富な音楽理論ツールをリアルタイムに同時表示します。
          </p>
          <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-white/70">
                全画面表示にすることで、五線譜や鍵盤を最大サイズでゆったりと視認・演奏できます。
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Monitor className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
              <span className="text-white/70">
                画面右上の <strong className="text-white">全画面切替ボタン</strong> やキーボードの <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[11px]">Esc</kbd> キーでいつでも通常表示に戻せます。
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-white/60 cursor-pointer pt-1 hover:text-white/90 select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => onToggleDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0F0F11] border-white/20 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer accent-red-600"
            />
            <span>次回からこのダイアログを表示しない</span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-[#0F0F11]/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={onContinueNormal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 border border-white/5 transition-all cursor-pointer text-center"
          >
            通常表示で開始
          </button>
          <button
            onClick={onEnterFullscreen}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Maximize className="w-4 h-4" />
            <span>全画面で開始する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
