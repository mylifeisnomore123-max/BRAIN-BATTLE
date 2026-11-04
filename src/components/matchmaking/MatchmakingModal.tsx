import React, { useState } from 'react';
import { PlayerProfile, GameCategory } from '../../types/game';
import { multiplayer } from '../../services/multiplayer';
import { soundFx } from '../../services/sound';
import { haptic } from '../../services/haptics';
import { X, Copy, Check, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface MatchmakingModalProps {
  isOpen: boolean;
  type: 'searching' | 'create_room' | 'join_room';
  category: GameCategory;
  roomCode?: string;
  profile: PlayerProfile;
  onClose: () => void;
  onStartMatch: (category: GameCategory) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  type,
  category,
  roomCode,
  profile,
  onClose,
  onStartMatch,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedCat, setSelectedCat] = useState<GameCategory>(category || 'all-round');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      haptic.light();
      soundFx.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (clean.length < 4) {
      setErrorMsg('Please enter a valid room code.');
      return;
    }
    setErrorMsg('');
    haptic.medium();
    soundFx.playClick();
    multiplayer.joinRoom(profile, clean);
  };

  const handleCreateRoom = () => {
    haptic.medium();
    soundFx.playClick();
    multiplayer.createRoom(profile, selectedCat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#101736] to-[#0a0e21] border border-cyan-500/40 p-6 text-center shadow-[0_0_40px_rgba(6,182,212,0.25)] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Radar Searching Screen */}
        {type === 'searching' && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Radar waves */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-3xl shadow-[0_0_20px_#00e5ff]">
                🧠
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                Searching For Rival...
              </h3>
              <p className="text-xs text-cyan-300 font-medium mt-1">
                Matching with comparable ELO ({profile.rating} ± 150)
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/60 rounded-full border border-cyan-500/30 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Category: <strong className="text-cyan-300 capitalize">{category}</strong></span>
            </div>

            <button
              onClick={() => {
                multiplayer.cancelMatchmaking();
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {/* 2. Create Private Room */}
        {type === 'create_room' && (
          <div className="flex flex-col items-center py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-2xl">
              👥
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                Play With Friends
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Share this room code with your friend to battle 1v1!
              </p>
            </div>

            {roomCode ? (
              <div className="w-full space-y-3">
                <div className="bg-black/50 border-2 border-dashed border-cyan-400/60 rounded-2xl p-4 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Room Code</div>
                    <div className="text-3xl font-black font-mono tracking-widest text-cyan-300">
                      {roomCode}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Waiting for friend to join room...</span>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3">
                <div className="text-left">
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Select Discipline:
                  </label>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value as GameCategory)}
                    className="w-full bg-[#161d3d] border border-cyan-500/40 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all-round">All-Round Pentathlon (5 Games)</option>
                    <option value="math">Math Challenge</option>
                    <option value="memory">Memory Test</option>
                    <option value="reaction">Reaction Reflex</option>
                    <option value="logic">Logic Puzzle</option>
                    <option value="number">Number Challenge</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Generate Room Code
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Join Room with Code */}
        {type === 'join_room' && (
          <form onSubmit={handleJoinSubmit} className="flex flex-col items-center py-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl">
              🔑
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                Enter Room Code
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Input the 6-character code provided by your friend
              </p>
            </div>

            <div className="w-full">
              <input
                type="text"
                maxLength={8}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. 7BRAIN"
                className="w-full text-center tracking-widest font-mono text-2xl font-black py-3 px-4 rounded-xl bg-[#0c1229] border-2 border-cyan-500/50 text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 uppercase"
              />
              {errorMsg && (
                <div className="text-xs text-rose-400 font-semibold mt-1.5 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Enter Battle Room
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
