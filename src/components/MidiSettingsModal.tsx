import React from 'react';
import { MidiState } from '../services/midiService';
import { audioSynth } from '../services/audioSynth';
import {
  X,
  Radio,
  Volume2,
  VolumeX,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Keyboard,
  Info,
} from 'lucide-react';

interface MidiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  midiState: MidiState;
  looseMatching: boolean;
  setLooseMatching: (val: boolean) => void;
  volume: number;
  setVolume: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

export const MidiSettingsModal: React.FC<MidiSettingsModalProps> = ({
  isOpen,
  onClose,
  midiState,
  looseMatching,
  setLooseMatching,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
}) => {
  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioSynth.setVolume(v);
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioSynth.setMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-[#151518] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">MIDI & サウンド設定</h3>
              <p className="text-xs text-white/40">Web MIDI API 接続 & 音量調整</p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-4 text-sm">
          {/* MIDI Device Status */}
          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white/80 flex items-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    midiState.isConnected
                      ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                      : midiState.isSupported
                      ? 'bg-amber-400'
                      : 'bg-white/30'
                  }`}
                ></span>
                MIDI キーボード接続状態:
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  midiState.isConnected
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {midiState.isConnected ? '接続中 (Ready)' : '未検出 / 待機中'}
              </span>
            </div>

            {midiState.devices.length > 0 ? (
              <div className="mt-3 flex flex-col gap-1.5">
                <span className="text-xs text-white/40">検出されたデバイス:</span>
                {midiState.devices.map((d, i) => (
                  <div
                    key={`midi-dev-${i}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#151518] text-xs text-white font-mono border border-white/5"
                  >
                    <span>{d.name}</span>
                    <span className="text-[10px] text-red-400 font-bold">● {d.state}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 leading-relaxed mt-1.5">
                USB/Bluetooth MIDIキーボードを接続すると自動検出されます。
                接続されていない場合も、画面上の鍵盤クリックやPCキーボード（A, W, S, E, D...）で演奏・練習可能です。
              </p>
            )}
          </div>

          {/* Judgment Strictness Logic */}
          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/80 text-xs">判定ロジック (Judgment Mode)</span>
              <button
                id="toggle-loose-matching-btn"
                onClick={() => setLooseMatching(!looseMatching)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  looseMatching
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white/5 text-white/40 hover:text-white border border-white/10'
                }`}
              >
                {looseMatching ? 'ルーズ判定 (推奨)' : '厳格判定 (厳密音階)'}
              </button>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              {looseMatching
                ? '【ルーズ判定】どのオクターブで弾いても、指定された構成音（例: D, F, A, C）が揃っていれば正解と判定します。'
                : '【厳格判定】余分な打鍵がなく、指定された構成音ピッチクラスのみが正確に押されている場合のみ正解とします。'}
            </p>
          </div>

          {/* Audio Volume Slider */}
          <div className="p-4 rounded-xl bg-[#0F0F11] border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/80 text-xs flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-red-400" />
                内蔵ピアノ音量 (Volume)
              </span>
              <button
                onClick={handleMuteToggle}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-white/80" />}
                <span>{isMuted ? 'ミュート中' : `${Math.round(volume * 100)}%`}</span>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          {/* PC Keyboard Shortcuts Info */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/60 flex items-start gap-2.5">
            <Keyboard className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">PCキーボード演奏に対応:</strong>
              <span>白鍵: A, S, D, F, G, H, J, K, L / 黒鍵: W, E, T, Y, U, O, P キーで打鍵可能です。</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
          >
            完了して閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
