/**
 * Light Background Music Generator & Player
 * Elegant, non-intrusive background music generator with relaxing chords and soft melodies.
 * Completely free of drone frequencies or heavy sub-bass buzz.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Music2, Sliders, ChevronDown } from 'lucide-react';
import { lightMusic, LIGHT_MUSIC_PRESETS, LightMusicStyle } from '../utils/lightMusicGenerator';

interface LightMusicPlayerProps {
  compact?: boolean;
}

export const LightMusicPlayer: React.FC<LightMusicPlayerProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(lightMusic.getIsPlaying());
  const [currentStyle, setCurrentStyle] = useState<LightMusicStyle>(lightMusic.getCurrentStyle());
  const [volume, setVolume] = useState(lightMusic.getVolume());
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentChord, setCurrentChord] = useState('Cmaj9');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const unsubState = lightMusic.subscribeState((playing) => {
      setIsPlaying(playing);
    });

    const unsubBeat = lightMusic.subscribeBeat((beat, chord) => {
      setCurrentBeat(beat);
      setCurrentChord(chord);
    });

    return () => {
      unsubState();
      unsubBeat();
    };
  }, []);

  const handleTogglePlay = () => {
    lightMusic.toggle();
  };

  const handleStyleChange = (style: LightMusicStyle) => {
    setCurrentStyle(style);
    lightMusic.setStyle(style);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    lightMusic.setVolume(val);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-mono">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlaying
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 animate-pulse'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
          }`}
          title={isPlaying ? 'Pause Light Background Music' : 'Play Light Background Music'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Light Music' : 'Play Music'}</span>
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-zinc-200">{currentChord}</span>
            <span className="text-zinc-500">B{currentBeat}</span>
          </div>
        )}

        <select
          value={currentStyle}
          onChange={(e) => handleStyleChange(e.target.value as LightMusicStyle)}
          aria-label="Select background music preset"
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          {LIGHT_MUSIC_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const activePreset = LIGHT_MUSIC_PRESETS.find((p) => p.id === currentStyle) || LIGHT_MUSIC_PRESETS[0];

  return (
    <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-950/80 to-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Identity & Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
            }`}
          >
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Light Background Music</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Zero Drone • 432Hz Clean
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{activePreset.description}</p>
          </div>
        </div>

        {/* Master Play Button & Settings */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Music</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Light Music</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              showSettings
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Music Settings & Presets"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Selector Tabs */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {LIGHT_MUSIC_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleStyleChange(preset.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentStyle === preset.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Live Chord Progression & Beat Tracker */}
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-950/80 px-3 py-1 rounded-lg border border-zinc-800">
          <span className="text-zinc-500">Chord:</span>
          <span className="text-emerald-400 font-semibold">{isPlaying ? currentChord : '—'}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">Beat:</span>
          <span className="text-amber-400 font-semibold">{isPlaying ? currentBeat : '—'}</span>
          {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />}
        </div>
      </div>

      {/* Expandable Sound Settings (Volume Slider) */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-zinc-400 flex items-center gap-1.5">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>Volume ({Math.round(volume * 100)}%):</span>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-36 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="text-[11px] text-zinc-500">
            Highpass: 160Hz (Drone-Free) • Gentle Lowpass: 4500Hz • 432Hz Verdi Harmonic
          </div>
        </div>
      )}
    </div>
  );
};
