/**
 * Automated FFmpeg Render Queue Console
 * Displays local Dragon 9 render queue, active job frame progress,
 * generated multi-layer bash scripts, and rendered outputs.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, Terminal, Copy, Check, Play, XCircle, AlertCircle, RefreshCw, Film, Sparkles, CheckCircle2, Volume2, Zap, Download, Mic, Cpu, Radio } from 'lucide-react';
import { RenderJob, VoiceStemMapping } from '../types';
import { cyberVoice } from '../utils/cyberVoiceSynthesizer';

interface RenderQueueViewProps {
  jobs: RenderJob[];
  onRefreshQueue: () => void;
}

export const RenderQueueView: React.FC<RenderQueueViewProps> = ({ jobs, onRefreshQueue }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingIds, setSimulatingIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<RenderJob | null>(jobs[0] || null);
  const [isPlayingCyberVoice, setIsPlayingCyberVoice] = useState(false);
  const [scriptTab, setScriptTab] = useState<'ffmpeg' | 'container'>('container');
  const [auditioningStemId, setAuditioningStemId] = useState<string | null>(null);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  // Periodic polling for status updates if jobs are rendering
  useEffect(() => {
    const hasRendering = jobs.some(j => j.status === 'RENDERING');
    if (hasRendering) {
      const timer = setInterval(() => {
        onRefreshQueue();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [jobs, onRefreshQueue]);

  const handleSimulateRender = async (jobId: string) => {
    setSimulatingIds(prev => new Set(prev).add(jobId));
    try {
      await fetch(`/api/dragon9/render-queue/${jobId}/simulate`, {
        method: 'POST'
      });
      onRefreshQueue();
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    } finally {
      setTimeout(() => {
        setSimulatingIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }, 1000);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/dragon9/render-queue/${jobId}/cancel`, {
        method: 'POST'
      });
      onRefreshQueue();
    } catch (err) {
      console.error('Failed to cancel job:', err);
    }
  };

  const handleCopyScript = (job: RenderJob) => {
    const content = scriptTab === 'container' && job.containerPipelineScript 
      ? job.containerPipelineScript 
      : job.ffmpegScript;
    navigator.clipboard.writeText(content);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadContainerScript = (job: RenderJob) => {
    const content = job.containerPipelineScript || job.ffmpegScript;
    const blob = new Blob([content], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assemble_${job.episodeId.toLowerCase() || 'show'}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAuditionStem = async (stem: VoiceStemMapping) => {
    try {
      setAuditioningStemId(stem.stemId);
      const res = await fetch('/api/dragon9/elevenlabs/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: stem.elevenLabsVoiceId,
          text: stem.text,
          characterName: stem.characterName
        })
      });

      const data = await res.json();

      if (data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        audio.onended = () => setAuditioningStemId(null);
        await audio.play();
      } else {
        // Fallback to local speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(stem.text);
          utterance.pitch = stem.characterName.includes('Puff') ? 1.4 : 0.9;
          utterance.rate = 1.05;
          utterance.onend = () => setAuditioningStemId(null);
          utterance.onerror = () => setAuditioningStemId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setAuditioningStemId(null);
        }
      }
    } catch (err) {
      console.warn('Stem audition fallback', err);
      setAuditioningStemId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Automated FFmpeg Render Queue</h2>
            <p className="text-xs text-zinc-400">
              Multi-layer fluid motion compositing, 432Hz audio mixdown & local encoder queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshQueue}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 border-dashed rounded-2xl p-12 text-center space-y-3">
          <Film className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">Render Queue Empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Assemble an episode from the Nutflox Cartoon Pipeline Studio to enqueue automated FFmpeg rendering jobs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Job Cards List */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-zinc-400 px-1">
              Active Queue ({jobs.length} Jobs)
            </div>

            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isSimulating = simulatingIds.has(job.id);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-zinc-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {job.dragon9Cycle}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : job.status === 'RENDERING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          : job.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{job.seriesTitle}</h4>
                    <p className="text-xs text-zinc-400">{job.episodeTitle}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>{job.currentFrame}/{job.totalFrames} Frames</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {job.resolution} @ {job.fps}fps
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleSimulateRender(job.id)}
                          disabled={isSimulating || job.status === 'RENDERING'}
                          className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Render</span>
                        </button>
                      )}
                      {job.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleCancelJob(job.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Cancel Job"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: Selected Job Inspector, FFmpeg Script & Logs */}
          <div className="lg:col-span-2 space-y-6">
            {selectedJob ? (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedJob.seriesTitle}</h3>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {selectedJob.id}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{selectedJob.episodeTitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyScript(selectedJob)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === selectedJob.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Script!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Bash Script</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Visual Avatar & Fluid Motion Preview Banner */}
                {selectedJob.seriesTitle?.includes('Cybernetic') || selectedJob.id?.includes('CYBER') ? (
                  <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-cyan-500/40 p-1 flex items-center justify-center shrink-0">
                        <img 
                          src="/assets/vectors/avatars/cyber_dragon_face.svg" 
                          alt="Cyber Dragon Face"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">CYBER_DRAGON_FACE.V4 Special</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            CLEAN HARMONIC
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 mt-0.5">
                          Fluid motion compositing with clean robotic dialogue & cyan plasma scales (Drone-Free)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingCyberVoice) {
                          cyberVoice.stop();
                          setIsPlayingCyberVoice(false);
                        } else {
                          cyberVoice.speakCyberDragonLine(
                            "Welcome to the Dragon 9 Synchronized Time Pipeline. Fluid Motion sequence is now active. Synchronize your time with the future.",
                            {
                              onStart: () => setIsPlayingCyberVoice(true),
                              onEnd: () => setIsPlayingCyberVoice(false)
                            }
                          );
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingCyberVoice ? 'Stop Audio' : 'Audition 432Hz Voice'}</span>
                    </button>
                  </div>
                ) : null}

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">TOTAL DURATION</span>
                    <span className="text-zinc-200 font-bold">{selectedJob.totalDurationSeconds}s</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">TOTAL FRAMES</span>
                    <span className="text-zinc-200 font-bold">{selectedJob.totalFrames} frames</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">VOICEOVER STEMS</span>
                    <span className="text-amber-400 font-bold">{selectedJob.voiceStems?.length || selectedJob.audioStems.voiceoverTrackCount} Tracks</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">432Hz AUDIO STEM</span>
                    <span className="text-emerald-400 font-bold">{selectedJob.audioStems.proceduralMidiTrack}</span>
                  </div>
                </div>

                {/* ElevenLabs Dialogue Voice Stems & 432Hz Sync Timeline */}
                {selectedJob.voiceStems && selectedJob.voiceStems.length > 0 && (
                  <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                          ElevenLabs Dialogue Stems & 432Hz Audio Sync
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {selectedJob.voiceStems.length} Stems Mapped
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Filter: adelay & amix (Verdi 432Hz Sync)</span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedJob.voiceStems.map((stem, idx) => (
                        <div
                          key={stem.stemId || idx}
                          className="p-3 bg-zinc-900/80 border border-zinc-800/70 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-zinc-700 transition-colors"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-400 text-[11px]">
                                {stem.characterName}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                Scene {stem.sceneNumber} • {stem.sceneTitle}
                              </span>
                              <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                                Voice: {stem.elevenLabsVoiceId.slice(0, 8)}...
                              </span>
                            </div>
                            <p className="text-zinc-200 italic leading-snug">
                              "{stem.text}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                              <span className="text-emerald-400">+{stem.timeOffsetSec}s</span> ({stem.timeOffsetMs}ms)
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAuditionStem(stem)}
                              disabled={auditioningStemId === stem.stemId}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                auditioningStemId === stem.stemId
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                  : 'bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border-zinc-700'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{auditioningStemId === stem.stemId ? 'Playing...' : 'Audition'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pipeline Script Inspector Tabs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setScriptTab('container')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                          scriptTab === 'container'
                            ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Mobile Container Script ($HOME/dragon9)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScriptTab('ffmpeg')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                          scriptTab === 'ffmpeg'
                            ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Local FFmpeg Filtergraph</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadContainerScript(selectedJob)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download assemble_show.sh"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Download .sh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyScript(selectedJob)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedId === selectedJob.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {scriptTab === 'container' ? (
                    <div className="space-y-2">
                      {/* Mobile Container Architecture Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                        <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400">
                          <span className="text-cyan-400 block font-bold">CONTAINER RUNTIME</span>
                          <span>Android Termux -&gt; Ubuntu (ARM64)</span>
                        </div>
                        <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400">
                          <span className="text-emerald-400 block font-bold">SMART CACHE CHECK</span>
                          <span>[ -f frame_0540.png ]</span>
                        </div>
                        <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400">
                          <span className="text-amber-400 block font-bold">HEADLESS BLENDER</span>
                          <span>xvfb-run -a blender 5.0.1</span>
                        </div>
                      </div>

                      <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-64 leading-relaxed">
                        {selectedJob.containerPipelineScript || selectedJob.ffmpegScript}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span className="text-cyan-400">FFmpeg Multi-Stem Filter Complex (amix + adelay + sine=432)</span>
                        <span>libx264 / aac 320k 48kHz</span>
                      </div>
                      <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                        {selectedJob.ffmpegScript}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Render Logs */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 block">
                    Execution Logs ({selectedJob.logs.length})
                  </span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1 max-h-32 overflow-y-auto">
                    {selectedJob.logs.map((log, idx) => (
                      <div key={idx} className="leading-snug">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
