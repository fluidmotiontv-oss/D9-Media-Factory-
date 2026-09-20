/**
 * FluidMotion Companion HUD
 * Unified Local Media Factory Command Center.
 * Coordinates real-time orchestration between cartoon visual rendering,
 * Horizon MIDI audio, and transparent 2D dynamic smart object avatar overlay.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Cpu, Zap, Activity, Radio, RefreshCw, CheckCircle2, ArrowRight,
  Music, Film, Layers, Sparkles, Volume2, VolumeX, Play, Eye, Code,
  Flame, RadioTower, Move, Sliders, LayoutGrid
} from 'lucide-react';
import { Dragon9Status, ScheduledAvatarEvent, AvatarEventPayload, HudPresetProfile } from '../types';
import { HudPresetManager, FACTORY_HUD_PRESETS } from './HudPresetManager';

interface FluidMotionHUDProps {
  status: Dragon9Status | null;
  onRunOrchestration: (params: { show: string; genre: string }) => Promise<any>;
  onNavigateToTab: (tab: string) => void;
}

// User-specified default Avatar Event specification
const DEFAULT_AVATAR_EVENT: AvatarEventPayload = {
  episode_id: 'super_puff_101',
  sync_anchor: {
    d9_cycle: 4,
    d9_beat: 2,
    stem_trigger: 'trip-hop_bass_drop'
  },
  render_target: {
    layer: 'glassmorphism_hud_top',
    sprite_asset: '/assets/vectors/avatars/super_puff.svg',
    css_scale: 1.5,
    position: { x: '80%', y: '20%' }
  },
  behavior: {
    entry_transition: 'fade_slide_up',
    pulse_frequency: '432Hz_sync',
    duration_beats: 18
  }
};

export const FluidMotionHUD: React.FC<FluidMotionHUDProps> = ({ status, onRunOrchestration, onNavigateToTab }) => {
  const [selectedShow, setSelectedShow] = useState<'superPuff' | 'peeDubSurfChronicles'>('superPuff');
  const [selectedGenre, setSelectedGenre] = useState<'g-funk' | 'dub-reggae' | 'trip-hop'>('g-funk');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<any>(null);

  // HUD Preset Profile State
  const [currentProfile, setCurrentProfile] = useState<HudPresetProfile>(FACTORY_HUD_PRESETS[0]);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);

  // 2D Avatar Overlay State
  const [activeEvent, setActiveEvent] = useState<AvatarEventPayload>(DEFAULT_AVATAR_EVENT);
  const [eventTriggerTime, setEventTriggerTime] = useState<number>(Date.now());
  const [stemImpactStrength, setStemImpactStrength] = useState<number>(0);
  const [stemType, setStemType] = useState<string>('trip-hop_bass_drop');
  const [audioStemPlaying, setAudioStemPlaying] = useState<boolean>(false);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);
  const [avatarSpriteKey, setAvatarSpriteKey] = useState<string>('super_puff');

  // Canvas References
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Cached SVG image sprites for zero-VRAM rendering
  const spriteImagesRef = useRef<Record<string, HTMLImageElement>>({});

  // Apply a loaded HUD Preset Profile
  const handleApplyProfile = useCallback((profile: HudPresetProfile) => {
    setCurrentProfile(profile);
    setAvatarSpriteKey(profile.avatarSpriteKey || 'super_puff');
    if (profile.show === 'peeDubSurfChronicles') {
      setSelectedShow('peeDubSurfChronicles');
      setSelectedGenre('dub-reggae');
    } else if (profile.show === 'superPuff') {
      setSelectedShow('superPuff');
      setSelectedGenre('g-funk');
    }

    const payload: AvatarEventPayload = {
      episode_id: profile.show === 'peeDubSurfChronicles' ? 'pee_dub_201' : 'super_puff_101',
      sync_anchor: profile.sync_anchor || {
        d9_cycle: 4,
        d9_beat: 2,
        stem_trigger: 'trip-hop_bass_drop'
      },
      render_target: {
        layer: profile.render_target.layer,
        sprite_asset: profile.render_target.sprite_asset,
        css_scale: profile.render_target.css_scale,
        position: profile.render_target.position
      },
      behavior: {
        entry_transition: profile.behavior.entry_transition,
        pulse_frequency: profile.behavior.pulse_frequency,
        duration_beats: profile.behavior.duration_beats
      }
    };

    setActiveEvent(payload);
    setEventTriggerTime(Date.now());
    setStemImpactStrength(0.8);
  }, []);

  // Update current active profile safely
  const handleUpdateCurrentProfile = useCallback((updater: (prev: HudPresetProfile) => HudPresetProfile) => {
    setCurrentProfile(prev => {
      const updated = updater(prev);
      setAvatarSpriteKey(updated.avatarSpriteKey || 'super_puff');
      setActiveEvent(evt => ({
        ...evt,
        render_target: {
          layer: updated.render_target.layer,
          sprite_asset: updated.render_target.sprite_asset,
          css_scale: updated.render_target.css_scale,
          position: updated.render_target.position
        },
        behavior: {
          entry_transition: updated.behavior.entry_transition,
          pulse_frequency: updated.behavior.pulse_frequency,
          duration_beats: updated.behavior.duration_beats
        }
      }));
      return updated;
    });
  }, []);

  // Sync activeEvent changes whenever currentProfile updates
  useEffect(() => {
    setActiveEvent(evt => ({
      ...evt,
      render_target: {
        layer: currentProfile.render_target.layer,
        sprite_asset: currentProfile.render_target.sprite_asset,
        css_scale: currentProfile.render_target.css_scale,
        position: currentProfile.render_target.position
      },
      behavior: {
        entry_transition: currentProfile.behavior.entry_transition,
        pulse_frequency: currentProfile.behavior.pulse_frequency,
        duration_beats: currentProfile.behavior.duration_beats
      }
    }));
  }, [currentProfile]);

  // Load SVG Sprites
  useEffect(() => {
    const sprites: Record<string, string> = {
      'avatar_base': '/assets/vectors/avatars/avatar_base.svg',
      'super_puff': '/assets/vectors/avatars/super_puff.svg',
      'pee_dub': '/assets/vectors/avatars/pee_dub.svg',
      'lotus_nexus': '/assets/vectors/avatars/lotus_nexus.svg'
    };

    Object.entries(sprites).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        spriteImagesRef.current[key] = img;
      };
    });
  }, []);

  const clock = status?.clock;
  const currentBeat = clock?.currentBeat ?? 2;
  const currentCycle = clock?.currentCycle ?? 4;

  // Handle Show Switch
  const handleShowChange = (show: 'superPuff' | 'peeDubSurfChronicles') => {
    setSelectedShow(show);
    if (show === 'peeDubSurfChronicles') {
      setSelectedGenre('dub-reggae');
      setAvatarSpriteKey('pee_dub');
      handleUpdateCurrentProfile(prev => ({
        ...prev,
        show: 'peeDubSurfChronicles',
        avatarSpriteKey: 'pee_dub',
        render_target: {
          ...prev.render_target,
          sprite_asset: '/assets/vectors/avatars/pee_dub.svg',
          position: { x: '20%', y: '75%' }
        }
      }));
    } else {
      setSelectedGenre('g-funk');
      setAvatarSpriteKey('super_puff');
      handleUpdateCurrentProfile(prev => ({
        ...prev,
        show: 'superPuff',
        avatarSpriteKey: 'super_puff',
        render_target: {
          ...prev.render_target,
          sprite_asset: '/assets/vectors/avatars/super_puff.svg',
          position: { x: '80%', y: '20%' }
        }
      }));
    }
  };

  // Direct Viewport Mouse / Touch Dragging to reposition avatar
  const handleViewportPointerMove = (clientX: number, clientY: number) => {
    if (!viewportContainerRef.current) return;
    const rect = viewportContainerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const pctX = Math.round(Math.min(95, Math.max(5, (relX / rect.width) * 100)));
    const pctY = Math.round(Math.min(92, Math.max(8, (relY / rect.height) * 100)));

    handleUpdateCurrentProfile(prev => ({
      ...prev,
      render_target: {
        ...prev.render_target,
        position: { x: `${pctX}%`, y: `${pctY}%` }
      }
    }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDraggingCanvas(true);
    handleViewportPointerMove(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCanvas) return;
    handleViewportPointerMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    setIsDraggingCanvas(true);
    handleViewportPointerMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingCanvas) return;
    const touch = e.touches[0];
    if (!touch) return;
    handleViewportPointerMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsDraggingCanvas(false);
  };

  // Trigger Avatar Event
  const triggerAvatarEvent = async (customPayload?: AvatarEventPayload) => {
    const payload = customPayload || activeEvent;
    setEventTriggerTime(Date.now());
    setStemImpactStrength(1.0);

    try {
      await fetch('/api/dragon9/avatars/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_event: payload })
      });
    } catch (e) {
      console.warn('Local event logged:', e);
    }
  };

  // Trigger Stem Reaction (Bass Drop, Sub Pulse, Whistle)
  const triggerStemImpact = (stem: string) => {
    setStemType(stem);
    setStemImpactStrength(1.0);
    setActiveEvent(prev => ({
      ...prev,
      sync_anchor: {
        ...prev.sync_anchor,
        stem_trigger: stem
      }
    }));

    // Trigger audible 432Hz preview if audio is on
    playStemAudioBurst(stem);
  };

  // Play Web Audio 432Hz light musical sound burst (No harsh drone frequencies)
  const playStemAudioBurst = (stem: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (stem === 'trip-hop_bass_drop') {
        // Light Rhodes warm 9th chord stab (Cmaj9)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(288.0, now); // 432Hz harmonic D4
        osc.frequency.linearRampToValueAtTime(324.0, now + 0.2); // E4
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (stem === 'dub-reggae_sub_pulse') {
        // Light acoustic vibe / chime pluck
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432.0, now); // Exact 432Hz A4
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // G-Funk gentle sweet whistle at 864Hz (432 * 2)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(864.0, now);
        osc.frequency.linearRampToValueAtTime(1080.0, now + 0.2);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
      }

      if (analyserRef.current) {
        osc.connect(gain);
        gain.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }
    } catch (err) {
      console.warn('Audio Context trigger note:', err);
    }
  };

  // Toggle continuous 432Hz backing stem loop
  const toggleAudioStemPlayback = () => {
    if (audioStemPlaying) {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setAudioStemPlaying(false);
    } else {
      setAudioStemPlaying(true);
      playStemAudioBurst(stemType);
      audioIntervalRef.current = setInterval(() => {
        playStemAudioBurst(stemType);
        setStemImpactStrength(0.85);
      }, 2400); // repeats every 2.4s (proportional to 432Hz meter)
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Primary Video & Transparent 2D Canvas Animation Engine
  useEffect(() => {
    let animationFrameId: number;
    let shockwaveRadius = 0;

    const render = () => {
      const vCanvas = videoCanvasRef.current;
      const oCanvas = overlayCanvasRef.current;
      if (!vCanvas || !oCanvas) return;

      const vCtx = vCanvas.getContext('2d');
      const oCtx = oCanvas.getContext('2d');
      if (!vCtx || !oCtx) return;

      const width = vCanvas.width;
      const height = vCanvas.height;
      const now = performance.now();
      const timeSec = now / 1000;

      // 1. RENDER MAIN VIDEO STREAM BACKGROUND (Local Nutflox Cartoon Scene)
      vCtx.clearRect(0, 0, width, height);

      if (selectedShow === 'superPuff') {
        // Super Puff: Pastel sunset gradient with animated floating candy clouds
        const bgGrad = vCtx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#1e1026');
        bgGrad.addColorStop(0.5, '#2e1065');
        bgGrad.addColorStop(1, '#090d16');
        vCtx.fillStyle = bgGrad;
        vCtx.fillRect(0, 0, width, height);

        // Animated marshmallow mountains
        vCtx.fillStyle = '#4c1d95';
        vCtx.beginPath();
        vCtx.moveTo(0, height);
        for (let x = 0; x <= width; x += 30) {
          const y = height - 120 - Math.sin((x + now * 0.05) * 0.01) * 35;
          vCtx.lineTo(x, y);
        }
        vCtx.lineTo(width, height);
        vCtx.closePath();
        vCtx.fill();

        // Candy clouds
        vCtx.fillStyle = 'rgba(244, 114, 182, 0.25)';
        for (let i = 0; i < 4; i++) {
          const cx = ((i * 240 + now * 0.03) % (width + 120)) - 60;
          const cy = 60 + Math.sin(timeSec + i) * 15;
          vCtx.beginPath();
          vCtx.arc(cx, cy, 35, 0, Math.PI * 2);
          vCtx.arc(cx + 30, cy - 10, 45, 0, Math.PI * 2);
          vCtx.arc(cx + 65, cy, 30, 0, Math.PI * 2);
          vCtx.fill();
        }
      } else {
        // Pee Dub: Vaporwave ocean sunset with neon horizon grid
        const bgGrad = vCtx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#042f2e');
        bgGrad.addColorStop(0.4, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        vCtx.fillStyle = bgGrad;
        vCtx.fillRect(0, 0, width, height);

        // Neon cyber grid horizon
        vCtx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        vCtx.lineWidth = 1;
        const horizonY = height * 0.55;
        for (let y = horizonY; y < height; y += (y - horizonY) * 0.25 + 6) {
          vCtx.beginPath();
          vCtx.moveTo(0, y);
          vCtx.lineTo(width, y);
          vCtx.stroke();
        }
        // Vanishing perspective rays
        for (let x = -width * 0.5; x <= width * 1.5; x += 70) {
          vCtx.beginPath();
          vCtx.moveTo(width / 2, horizonY);
          vCtx.lineTo(x + (now * 0.04) % 70, height);
          vCtx.stroke();
        }

        // Animated neon wave crest
        vCtx.strokeStyle = '#00e5ff';
        vCtx.lineWidth = 2.5;
        vCtx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const y = horizonY + Math.sin(x * 0.02 + timeSec * 2.5) * 14;
          if (x === 0) vCtx.moveTo(x, y);
          else vCtx.lineTo(x, y);
        }
        vCtx.stroke();
      }

      // Scanline CRT texture
      vCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < height; y += 4) {
        vCtx.fillRect(0, y, width, 1.5);
      }

      // Audio Oscilloscope Waveform at bottom of stream
      vCtx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      vCtx.lineWidth = 1.5;
      vCtx.beginPath();
      for (let x = 0; x < width; x += 6) {
        const oscY = height - 25 + Math.sin(x * 0.04 + timeSec * (432 / 50)) * (8 * (1 + stemImpactStrength * 1.5));
        if (x === 0) vCtx.moveTo(x, oscY);
        else vCtx.lineTo(x, oscY);
      }
      vCtx.stroke();

      // Broadcast watermark
      vCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      vCtx.font = '10px monospace';
      vCtx.fillText('LOCAL DRAGON-9 FEED // NUTFLOX NATIVE ENGINE // 432Hz HARMONIC SYNC', 18, 24);

      // ==============================================================
      // 2. TRANSPARENT 2D CANVAS OVERLAY (Direct Smart Object Avatar)
      // ==============================================================
      oCtx.clearRect(0, 0, width, height);

      // Draw Rule-of-Thirds Alignment Grid & Golden Ratio Guidelines
      if (showGuides) {
        oCtx.save();
        oCtx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        oCtx.lineWidth = 1;
        oCtx.setLineDash([4, 6]);

        // Horizontal 1/3 and 2/3 lines
        oCtx.beginPath();
        oCtx.moveTo(0, height / 3);
        oCtx.lineTo(width, height / 3);
        oCtx.moveTo(0, (height * 2) / 3);
        oCtx.lineTo(width, (height * 2) / 3);

        // Vertical 1/3 and 2/3 lines
        oCtx.moveTo(width / 3, 0);
        oCtx.lineTo(width / 3, height);
        oCtx.moveTo((width * 2) / 3, 0);
        oCtx.lineTo((width * 2) / 3, height);
        oCtx.stroke();

        // Center Crosshair
        oCtx.setLineDash([]);
        oCtx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        oCtx.beginPath();
        oCtx.moveTo(width / 2 - 12, height / 2);
        oCtx.lineTo(width / 2 + 12, height / 2);
        oCtx.moveTo(width / 2, height / 2 - 12);
        oCtx.lineTo(width / 2, height / 2 + 12);
        oCtx.stroke();

        // Guide Watermark
        oCtx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        oCtx.font = '9px monospace';
        oCtx.fillText('ALIGNMENT GRID: RULE-OF-THIRDS & CENTER TARGET', 18, height - 12);
        oCtx.restore();
      }

      // Decay stem impact strength smoothly
      setStemImpactStrength(prev => Math.max(0, prev - 0.025));

      // Calculate 432Hz harmonic pulse
      // 432Hz fundamental / 100 = 4.32Hz visual rhythm cycle
      const harmonic432Rate = 4.32;
      const harmonicPulse = Math.sin(timeSec * harmonic432Rate * 2 * Math.PI);

      // Dragon 9 Beat tick micro-bounce
      const beatProgress = (now % 1000) / 1000;
      const beatHop = Math.sin(beatProgress * Math.PI) * 4;

      // Behavior: fade_slide_up calculation
      const elapsedSinceTriggerMs = now - eventTriggerTime;
      const entryDurationMs = 480;
      const entryProgress = Math.min(1.0, elapsedSinceTriggerMs / entryDurationMs);
      const easeOutQuad = 1 - Math.pow(1 - entryProgress, 2);
      const entrySlideY = (1.0 - easeOutQuad) * 35;
      const entryOpacity = Math.max(0.2, easeOutQuad);

      // Target Coordinates from render_target.position (e.g. { x: '80%', y: '20%' })
      const posX = (parseFloat(currentProfile.render_target.position.x) / 100) * width;
      const posY = (parseFloat(currentProfile.render_target.position.y) / 100) * height + entrySlideY;

      // Base CSS scale
      const baseScale = currentProfile.render_target.css_scale || 1.5;

      // 432Hz pulse scale + stem impact squash & stretch
      let scaleX = baseScale * (1.0 + harmonicPulse * 0.08);
      let scaleY = baseScale * (1.0 + harmonicPulse * 0.08);

      if (stemImpactStrength > 0.01) {
        if (stemType === 'trip-hop_bass_drop') {
          // Trip-hop bass drop squash & stretch
          scaleX += stemImpactStrength * 0.45;
          scaleY -= stemImpactStrength * 0.35;
        } else if (stemType === 'dub-reggae_sub_pulse') {
          // Sub pulse radial expansion
          scaleX += stemImpactStrength * 0.35;
          scaleY += stemImpactStrength * 0.35;
        } else {
          // Whistle high-frequency shimmer
          scaleX += Math.sin(now * 0.08) * stemImpactStrength * 0.2;
        }
      }

      // Draw Expanding Shockwave Ripple when stem drops
      if (currentProfile.behavior.shockwaveOnStem !== false && stemImpactStrength > 0.1) {
        shockwaveRadius = (1.0 - stemImpactStrength) * 110;
        oCtx.save();
        oCtx.beginPath();
        oCtx.arc(posX, posY, shockwaveRadius, 0, Math.PI * 2);
        oCtx.strokeStyle = `rgba(0, 229, 255, ${stemImpactStrength * 0.6})`;
        oCtx.lineWidth = 3;
        oCtx.stroke();

        oCtx.beginPath();
        oCtx.arc(posX, posY, shockwaveRadius * 0.6, 0, Math.PI * 2);
        oCtx.strokeStyle = `rgba(212, 175, 55, ${stemImpactStrength * 0.4})`;
        oCtx.lineWidth = 1.5;
        oCtx.stroke();
        oCtx.restore();
      }

      // Draw 432Hz Harmonic Glowing Halo
      if (currentProfile.behavior.haloGlow !== false) {
        oCtx.save();
        oCtx.globalAlpha = entryOpacity * (currentProfile.render_target.opacity ?? 1.0);
        const haloRadius = (45 + harmonicPulse * 8 + stemImpactStrength * 20) * (baseScale / 1.5);
        const haloGrad = oCtx.createRadialGradient(posX, posY, 10, posX, posY, haloRadius);

        const haloColor = currentProfile.behavior.haloColor || 'cyan';
        const colorStops: Record<string, { start: string; mid: string }> = {
          cyan: { start: 'rgba(0, 229, 255, 0.45)', mid: 'rgba(6, 182, 212, 0.2)' },
          emerald: { start: 'rgba(16, 185, 129, 0.45)', mid: 'rgba(5, 150, 105, 0.2)' },
          gold: { start: 'rgba(212, 175, 55, 0.45)', mid: 'rgba(245, 158, 11, 0.2)' },
          pink: { start: 'rgba(244, 114, 182, 0.45)', mid: 'rgba(236, 72, 153, 0.2)' },
          purple: { start: 'rgba(168, 85, 247, 0.45)', mid: 'rgba(147, 51, 234, 0.2)' }
        };
        const activeStops = colorStops[haloColor] || colorStops.cyan;

        haloGrad.addColorStop(0, activeStops.start);
        haloGrad.addColorStop(0.6, activeStops.mid);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        oCtx.fillStyle = haloGrad;
        oCtx.beginPath();
        oCtx.arc(posX, posY, haloRadius, 0, Math.PI * 2);
        oCtx.fill();
        oCtx.restore();
      }

      // Draw Dragging / Active Target Indicator
      if (isDraggingCanvas) {
        oCtx.save();
        oCtx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
        oCtx.lineWidth = 2;
        oCtx.beginPath();
        oCtx.arc(posX, posY, (48 * baseScale) / 1.5, 0, Math.PI * 2);
        oCtx.stroke();

        // Coordinate crosshair
        oCtx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
        oCtx.beginPath();
        oCtx.moveTo(posX - 10, posY);
        oCtx.lineTo(posX + 10, posY);
        oCtx.moveTo(posX, posY - 10);
        oCtx.lineTo(posX, posY + 10);
        oCtx.stroke();
        oCtx.restore();
      }

      // Render 2D SVG Sprite from cached image with Rotation, Opacity, and Flip
      const spriteImg = spriteImagesRef.current[avatarSpriteKey] || spriteImagesRef.current['avatar_base'];
      const spriteSize = 90;
      const drawW = spriteSize * scaleX;
      const drawH = spriteSize * scaleY;

      oCtx.save();
      oCtx.globalAlpha = entryOpacity * (currentProfile.render_target.opacity ?? 1.0);
      oCtx.translate(posX, posY - beatHop);

      // Rotation
      const rotDeg = currentProfile.render_target.rotationDeg ?? 0;
      if (rotDeg !== 0) {
        oCtx.rotate((rotDeg * Math.PI) / 180);
      }

      // Flip Horizontal
      if (currentProfile.render_target.flipHorizontal) {
        oCtx.scale(-1, 1);
      }

      if (spriteImg && spriteImg.complete) {
        oCtx.drawImage(spriteImg, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        // Fallback procedural vector avatar if image is loading
        oCtx.fillStyle = '#00e5ff';
        oCtx.beginPath();
        oCtx.arc(0, 0, drawW / 2, 0, Math.PI * 2);
        oCtx.fill();
        oCtx.fillStyle = '#090d16';
        oCtx.beginPath();
        oCtx.arc(0, 0, drawW / 2 - 4, 0, Math.PI * 2);
        oCtx.fill();
      }

      // Glassmorphism HUD metadata label under avatar (counter-flipped for readability)
      if (currentProfile.render_target.flipHorizontal) {
        oCtx.scale(-1, 1);
      }
      if (rotDeg !== 0) {
        oCtx.rotate((-rotDeg * Math.PI) / 180);
      }

      oCtx.fillStyle = 'rgba(9, 13, 22, 0.85)';
      oCtx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      oCtx.lineWidth = 1;
      const tagW = 140;
      const tagH = 22;
      oCtx.beginPath();
      oCtx.roundRect(-tagW / 2, drawH / 2 + 6, tagW, tagH, 6);
      oCtx.fill();
      oCtx.stroke();

      oCtx.fillStyle = '#00e5ff';
      oCtx.font = 'bold 9px monospace';
      oCtx.textAlign = 'center';
      oCtx.fillText(`D9 432Hz • ${currentProfile.render_target.layer}`, 0, drawH / 2 + 20);

      oCtx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeEvent, currentProfile, avatarSpriteKey, selectedShow, stemType, stemImpactStrength, eventTriggerTime, showGuides, isDraggingCanvas]);

  const handleExecuteUnifiedPipeline = async () => {
    setIsRunning(true);
    try {
      const result = await onRunOrchestration({
        show: selectedShow,
        genre: selectedGenre
      });
      setLastRunResult(result);
    } catch (err) {
      console.error('Orchestration error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. MAIN VIDEO STREAMS VIEWPORT WITH 2D TRANSPARENT OVERLAY     */}
      {/* ============================================================== */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 relative">
        {/* Stream Header & Controls */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-white tracking-wide">LIVE LOCAL STREAM:</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-cyan-300 font-semibold">
              {selectedShow === 'superPuff'
                ? 'Super Puff Ep. 101 [Marshmallow High]'
                : 'Pee Dub Surf Chronicles Ep. 201 [Liquid Neon]'}
            </span>
            <span className="hidden sm:inline-block text-zinc-500">•</span>
            <span className="hidden sm:inline-block text-emerald-400">
              D9 Cycle 0{currentCycle}:B0{currentBeat} (54-Min Hour)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Stem Web Audio Player */}
            <button
              type="button"
              onClick={toggleAudioStemPlayback}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                audioStemPlaying
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 animate-pulse'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {audioStemPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioStemPlaying ? 'Mute 432Hz Stem' : 'Play 432Hz Stem'}</span>
            </button>

            {/* Inspect Event JSON */}
            <button
              type="button"
              onClick={() => setShowJsonInspector(!showJsonInspector)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="View Avatar Event JSON Payload"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* Zero VRAM Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>0 KB GPU VRAM (2D Vector)</span>
            </div>
          </div>
        </div>

        {/* Video Canvas Container + Transparent 2D Canvas Overlay (Supports Interactive Drag-to-Position) */}
        <div
          ref={viewportContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-video sm:h-[400px] lg:h-[460px] bg-black flex items-center justify-center overflow-hidden cursor-crosshair select-none"
          title="Click or drag anywhere on the canvas to reposition the 2D smart object avatar in real time"
        >
          {/* Layer 1: Simulated Main Video Stream Canvas */}
          <canvas
            ref={videoCanvasRef}
            width={960}
            height={460}
            className="w-full h-full object-cover block pointer-events-none"
          />

          {/* Layer 2: Transparent 2D Canvas Overlay (glassmorphism_hud_top) */}
          <canvas
            ref={overlayCanvasRef}
            width={960}
            height={460}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          />

          {/* Top-Left Telemetry HUD Overlays */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none space-y-1.5">
            <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <RadioTower className="w-3.5 h-3.5 text-emerald-400" />
              <span>Horizon MIDI Sync: <strong className="text-emerald-400">432.0 Hz Active</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-800/70 text-[10px] font-mono text-zinc-400">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>Drag / Click Canvas to Reposition</span>
            </div>
          </div>

          {/* Top-Right Active Preset Badge */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className="bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg shadow-black/60">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="font-bold">{currentProfile.name}</span>
            </div>
          </div>

          {/* Bottom-Left Target Layer Info */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <div className="bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 text-[10px] font-mono text-zinc-400 space-y-0.5">
              <div>Target Layer: <span className="text-cyan-400 font-semibold">{currentProfile.render_target.layer}</span></div>
              <div>Position: <span className="text-emerald-400 font-semibold">{currentProfile.render_target.position.x}, {currentProfile.render_target.position.y}</span> (Scale: <span className="text-amber-400 font-semibold">{currentProfile.render_target.css_scale}x</span>)</div>
            </div>
          </div>

          {/* Bottom-Right Anchor & Timing Info */}
          <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-right">
            <div className="bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 text-[10px] font-mono text-zinc-400">
              <div>Anchor: <span className="text-amber-400 font-semibold">C:{activeEvent.sync_anchor.d9_cycle} B:{activeEvent.sync_anchor.d9_beat}</span></div>
              <div>Pulse: <span className="text-emerald-400 font-semibold">{currentProfile.behavior.pulse_frequency}</span></div>
            </div>
          </div>
        </div>

        {/* Real-time Interaction Bar for 2D Avatar Overlay */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Stem Reactivity Triggers */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Stem Reactivity:</span>
            </span>

            <button
              type="button"
              onClick={() => triggerStemImpact('trip-hop_bass_drop')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                stemType === 'trip-hop_bass_drop'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Bass Drop (Trip-Hop)
            </button>

            <button
              type="button"
              onClick={() => triggerStemImpact('dub-reggae_sub_pulse')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                stemType === 'dub-reggae_sub_pulse'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Sub Pulse (Dub Reggae)
            </button>

            <button
              type="button"
              onClick={() => triggerStemImpact('g-funk_whistle_lead')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                stemType === 'g-funk_whistle_lead'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Whistle Shimmer (G-Funk)
            </button>
          </div>

          {/* Trigger Full Event Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerAvatarEvent()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer text-xs"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Trigger Avatar Event</span>
            </button>
          </div>
        </div>

        {/* Optional JSON Inspector Dropdown */}
        {showJsonInspector && (
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                Dragon 9 Active Profile & Avatar Event Payload (JSON)
              </span>
              <span className="text-[10px] text-zinc-500">
                POST /api/dragon9/avatars/events
              </span>
            </div>
            <pre className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 overflow-x-auto text-emerald-300 text-[11px] leading-relaxed">
              {JSON.stringify({ active_profile: currentProfile, avatar_event: activeEvent }, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. HUD AVATAR PRESET & LAYER MANAGER COMPONENT                */}
      {/* ============================================================== */}
      <HudPresetManager
        currentProfile={currentProfile}
        onApplyProfile={handleApplyProfile}
        onUpdateCurrentProfile={handleUpdateCurrentProfile}
        showGuides={showGuides}
        onToggleGuides={setShowGuides}
      />

      {/* ============================================================== */}
      {/* 2. ORCHESTRATION & FLAGSHIP PIPELINE SELECTION                */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                Fluid Motion Local Media Factory
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Unified Visual, Audio & Avatar Engine
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Coordinates 2D SVG vector avatars over live stream streams, parses Dragon 9 manifests, generates procedural 432Hz harmonic soundtracks, routes voiceover assets, and assembles multi-layer FFmpeg rendering.
            </p>
          </div>

          {/* Quick Launch Panel */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shrink-0 space-y-3 min-w-[280px]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Select Flagship Show</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleShowChange('superPuff')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedShow === 'superPuff'
                      ? 'bg-pink-600 text-white font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Super Puff
                </button>
                <button
                  type="button"
                  onClick={() => handleShowChange('peeDubSurfChronicles')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedShow === 'peeDubSurfChronicles'
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Pee Dub Surf
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">432Hz Soundtrack Mode</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedGenre('dub-reggae')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    selectedGenre === 'dub-reggae'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Dub Reggae
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGenre('trip-hop')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    selectedGenre === 'trip-hop'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Trip-Hop
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGenre('g-funk')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    selectedGenre === 'g-funk'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  G-Funk
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteUnifiedPipeline}
              disabled={isRunning}
              className="w-full py-2.5 rounded-xl font-medium text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Orchestrating Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Run Unified Media Factory</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Execution Result Feedback */}
        {lastRunResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold block text-white">
                  Unified Media Factory Run Completed!
                </span>
                <span className="text-emerald-400/90 font-mono text-[11px]">
                  Job {lastRunResult.job.id} enqueued • 432Hz {lastRunResult.soundtrack.genre} soundtrack generated • {lastRunResult.assemblyManifest.scenes.length} scenes synchronized
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('queue')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Inspect FFmpeg Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. HARDWARE TELEMETRY & 432Hz CLOCK METRICS                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">Neural Accelerators</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-white font-bold text-sm">4x D9 Tensor Units</div>
          <div className="text-[10px] text-emerald-400">Online & Ready</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">VRAM Efficiency</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-emerald-400 font-bold text-sm">99.4% Preserved</div>
          <div className="text-[10px] text-zinc-400">Lightweight 2D SVG Sprites</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">Master Audio Tuning</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-emerald-400 font-bold text-sm">432.0 Hz Verdi</div>
          <div className="text-[10px] text-zinc-400">Drift: ±0.12 ms</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">54-Min Metric Scale</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-purple-300 font-bold text-sm">Cycle 0{currentCycle}:B0{currentBeat}</div>
          <div className="text-[10px] text-zinc-400">9 Cycles / 54 Micro-Bars</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MODULE NAVIGATION CARDS                                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Smart Object Avatar Studio Card */}
        <div
          onClick={() => onNavigateToTab('avatars')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-amber-400/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-amber-400 transition-colors">
              Open 3D Studio →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Smart Object Avatars</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Hosts 2D SVG and 3D WebGL smart object avatars (Lotus Nexus, Super Puff, Pee Dub). Low-latency interactions, 432Hz synthesizer, and network constellation sync.
          </p>
        </div>

        {/* Nutflox Cartoon Pipeline Card */}
        <div
          onClick={() => onNavigateToTab('nutflox')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-pink-500/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-pink-400 transition-colors">
              Open Studio →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Nutflox Cartoon Pipeline</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Parses complex Dragon 9 Asset Architect JSON manifests for "Super Puff" and "Pee Dub Surf Chronicles". Handles AI visual prompt routing & ElevenLabs VO.
          </p>
        </div>

        {/* Horizon Engine MIDI Card */}
        <div
          onClick={() => onNavigateToTab('midi')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Music className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-emerald-400 transition-colors">
              Open Lab →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Horizon Engine MIDI</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Procedural MIDI generator with strict 432Hz harmonic tuning for Dub Reggae, Trip-Hop, and G-Funk. Synchronized to Dragon 9 54-minute hour metrics.
          </p>
        </div>

        {/* Automated FFmpeg Render Queue Card */}
        <div
          onClick={() => onNavigateToTab('queue')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-cyan-400 transition-colors">
              Open Queue →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">FFmpeg Render Queue</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Automated multi-layer compositing queue with fluid motion frame blending (`tblend`), multi-stem audio ducking (`amix`), and live job simulation.
          </p>
        </div>
      </div>
    </div>
  );
};
