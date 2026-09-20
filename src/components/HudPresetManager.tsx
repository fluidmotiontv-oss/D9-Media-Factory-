/**
 * Dragon 9 HUD Preset Manager
 * Provides save, load, export, and import of 2D avatar positioning and layer
 * configurations as JSON profiles with real-time viewport synchronization.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Save, FolderOpen, Download, Upload, Copy, Check, Trash2,
  RefreshCw, Sliders, Layers, Sparkles, Move, Eye, Plus,
  FileJson, RotateCw, Shield, Zap, LayoutGrid, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Share2, Compass
} from 'lucide-react';
import { HudPresetProfile, AvatarEventPayload } from '../types';

export const FACTORY_HUD_PRESETS: HudPresetProfile[] = [
  {
    id: 'preset_top_right_stream',
    name: 'Top-Right Stream Overlay',
    category: 'broadcast',
    description: 'Standard upper-right stream placement with 432Hz harmonic breathing pulse',
    isFactory: true,
    show: 'superPuff',
    avatarSpriteKey: 'super_puff',
    created_at: '2026-09-16T12:00:00.000Z',
    render_target: {
      layer: 'glassmorphism_hud_top',
      sprite_asset: '/assets/vectors/avatars/super_puff.svg',
      css_scale: 1.5,
      position: { x: '80%', y: '20%' },
      rotationDeg: 0,
      opacity: 1.0,
      flipHorizontal: false
    },
    behavior: {
      entry_transition: 'fade_slide_up',
      pulse_frequency: '432Hz_sync',
      duration_beats: 18,
      haloGlow: true,
      haloColor: 'pink',
      shockwaveOnStem: true
    },
    sync_anchor: {
      d9_cycle: 4,
      d9_beat: 2,
      stem_trigger: 'trip-hop_bass_drop'
    }
  },
  {
    id: 'preset_lower_third_ocean',
    name: 'Lower-Third Ocean Anchor',
    category: 'lower_third',
    description: 'Sub-bass synchronized lower-left anchor for Dub Reggae broadcast feeds',
    isFactory: true,
    show: 'peeDubSurfChronicles',
    avatarSpriteKey: 'pee_dub',
    created_at: '2026-09-16T12:00:00.000Z',
    render_target: {
      layer: 'overlay_lower_third',
      sprite_asset: '/assets/vectors/avatars/pee_dub.svg',
      css_scale: 1.6,
      position: { x: '20%', y: '75%' },
      rotationDeg: -5,
      opacity: 1.0,
      flipHorizontal: false
    },
    behavior: {
      entry_transition: 'zoom_elastic',
      pulse_frequency: 'dynamic_stem_react',
      duration_beats: 24,
      haloGlow: true,
      haloColor: 'cyan',
      shockwaveOnStem: true
    },
    sync_anchor: {
      d9_cycle: 6,
      d9_beat: 2,
      stem_trigger: 'dub-reggae_sub_pulse'
    }
  },
  {
    id: 'preset_center_stage_hero',
    name: 'Center Stage 432Hz Hero',
    category: 'center_stage',
    description: 'High-impact central geometry for episode climax and musical solo drops',
    isFactory: true,
    show: 'all',
    avatarSpriteKey: 'lotus_nexus',
    created_at: '2026-09-16T12:00:00.000Z',
    render_target: {
      layer: 'broadcast_center_stage',
      sprite_asset: '/assets/vectors/avatars/lotus_nexus.svg',
      css_scale: 2.2,
      position: { x: '50%', y: '50%' },
      rotationDeg: 0,
      opacity: 0.95,
      flipHorizontal: false
    },
    behavior: {
      entry_transition: 'glitch_warp',
      pulse_frequency: '432Hz_sync',
      duration_beats: 36,
      haloGlow: true,
      haloColor: 'gold',
      shockwaveOnStem: true
    },
    sync_anchor: {
      d9_cycle: 9,
      d9_beat: 9,
      stem_trigger: 'trip-hop_bass_drop'
    }
  },
  {
    id: 'preset_pip_top_left',
    name: 'Picture-in-Picture Corner PIP',
    category: 'pip',
    description: 'Compact unobtrusive watermark icon for live commentary and co-watching',
    isFactory: true,
    show: 'superPuff',
    avatarSpriteKey: 'super_puff',
    created_at: '2026-09-16T12:00:00.000Z',
    render_target: {
      layer: 'pip_broadcast_corner',
      sprite_asset: '/assets/vectors/avatars/super_puff.svg',
      css_scale: 1.1,
      position: { x: '15%', y: '22%' },
      rotationDeg: 0,
      opacity: 0.85,
      flipHorizontal: false
    },
    behavior: {
      entry_transition: 'instant_pop',
      pulse_frequency: '54_minute_cycle',
      duration_beats: 12,
      haloGlow: false,
      haloColor: 'purple',
      shockwaveOnStem: false
    },
    sync_anchor: {
      d9_cycle: 1,
      d9_beat: 1,
      stem_trigger: 'g-funk_whistle_lead'
    }
  },
  {
    id: 'preset_bottom_right_dock',
    name: 'Bottom-Right Companion Dock',
    category: 'broadcast',
    description: 'Pinned right footer companion with slight tilt and subtle harmonic bounce',
    isFactory: true,
    show: 'peeDubSurfChronicles',
    avatarSpriteKey: 'pee_dub',
    created_at: '2026-09-16T12:00:00.000Z',
    render_target: {
      layer: 'glassmorphism_hud_top',
      sprite_asset: '/assets/vectors/avatars/pee_dub.svg',
      css_scale: 1.35,
      position: { x: '85%', y: '80%' },
      rotationDeg: 8,
      opacity: 0.9,
      flipHorizontal: true
    },
    behavior: {
      entry_transition: 'fade_slide_up',
      pulse_frequency: '432Hz_sync',
      duration_beats: 18,
      haloGlow: true,
      haloColor: 'emerald',
      shockwaveOnStem: true
    },
    sync_anchor: {
      d9_cycle: 5,
      d9_beat: 3,
      stem_trigger: 'dub-reggae_sub_pulse'
    }
  },
  {
    id: 'preset_floating_zen_beacon',
    name: 'Floating Zen Beacon',
    category: 'center_stage',
    description: 'Top-center sacred geometry beacon radiating 432Hz Verdi resonance',
    isFactory: true,
    show: 'all',
    avatarSpriteKey: 'lotus_nexus',
    created_at: '2026-09-16T12:00:00.000Z',
    render_target: {
      layer: 'glassmorphism_hud_top',
      sprite_asset: '/assets/vectors/avatars/lotus_nexus.svg',
      css_scale: 1.75,
      position: { x: '50%', y: '22%' },
      rotationDeg: 0,
      opacity: 0.9,
      flipHorizontal: false
    },
    behavior: {
      entry_transition: 'zoom_elastic',
      pulse_frequency: '432Hz_sync',
      duration_beats: 27,
      haloGlow: true,
      haloColor: 'gold',
      shockwaveOnStem: true
    },
    sync_anchor: {
      d9_cycle: 3,
      d9_beat: 3,
      stem_trigger: 'g-funk_whistle_lead'
    }
  }
];

const LOCAL_STORAGE_KEY = 'dragon9_hud_avatar_presets_v1';

interface HudPresetManagerProps {
  currentProfile: HudPresetProfile;
  onApplyProfile: (profile: HudPresetProfile) => void;
  onUpdateCurrentProfile: (updater: (prev: HudPresetProfile) => HudPresetProfile) => void;
  showGuides: boolean;
  onToggleGuides: (show: boolean) => void;
}

export const HudPresetManager: React.FC<HudPresetManagerProps> = ({
  currentProfile,
  onApplyProfile,
  onUpdateCurrentProfile,
  showGuides,
  onToggleGuides
}) => {
  const [presets, setPresets] = useState<HudPresetProfile[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>('preset_top_right_stream');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [pasteModalOpen, setPasteModalOpen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Preset Form State
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');
  const [newPresetCategory, setNewPresetCategory] = useState<string>('broadcast');
  const [pasteJsonText, setPasteJsonText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load presets from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPresets(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load presets from localStorage, using factory defaults', e);
    }
    setPresets(FACTORY_HUD_PRESETS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(FACTORY_HUD_PRESETS));
  }, []);

  // Save presets back to LocalStorage whenever custom presets change
  const savePresetsToStorage = (updated: HudPresetProfile[]) => {
    setPresets(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save presets to localStorage', e);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Load a preset
  const handleSelectPreset = (preset: HudPresetProfile) => {
    setActivePresetId(preset.id);
    onApplyProfile(preset);
    showToast('success', `Applied preset "${preset.name}"`);
  };

  // Save Current Live Configuration as a New Preset
  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      showToast('error', 'Please enter a preset name');
      return;
    }

    const newId = `custom_preset_${Date.now()}`;
    const newProfile: HudPresetProfile = {
      ...currentProfile,
      id: newId,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || 'Custom user avatar and layer layout',
      category: newPresetCategory,
      isFactory: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [newProfile, ...presets];
    savePresetsToStorage(updated);
    setActivePresetId(newId);
    setSaveModalOpen(false);
    setNewPresetName('');
    setNewPresetDesc('');
    showToast('success', `Saved preset "${newProfile.name}" as JSON profile!`);
  };

  // Delete a custom preset
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = presets.find(p => p.id === id);
    if (target?.isFactory) {
      showToast('error', 'Factory presets cannot be deleted');
      return;
    }

    const updated = presets.filter(p => p.id !== id);
    savePresetsToStorage(updated);
    if (activePresetId === id) {
      setActivePresetId(updated[0]?.id || '');
      if (updated[0]) onApplyProfile(updated[0]);
    }
    showToast('success', `Deleted preset "${target?.name || id}"`);
  };

  // Reset to Factory Presets
  const handleResetToFactory = () => {
    if (window.confirm('Reset all HUD presets back to factory defaults? Custom presets will be replaced.')) {
      savePresetsToStorage(FACTORY_HUD_PRESETS);
      setActivePresetId(FACTORY_HUD_PRESETS[0].id);
      onApplyProfile(FACTORY_HUD_PRESETS[0]);
      showToast('success', 'Reset presets to factory defaults');
    }
  };

  // Export Single Preset as .json file
  const handleExportSinglePreset = (preset: HudPresetProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName = preset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `d9_hud_preset_${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', `Exported "${preset.name}" as JSON file`);
  };

  // Export All Presets Bundle (.json)
  const handleExportAllPresets = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dragon9_hud_presets_bundle_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', `Exported ${presets.length} presets as JSON bundle`);
  };

  // Import JSON File from Disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Handle single profile or array bundle
        if (Array.isArray(parsed)) {
          // Bundle
          const validPresets = parsed.filter(p => p.id && p.render_target && p.behavior);
          if (validPresets.length === 0) {
            throw new Error('No valid presets found in JSON bundle');
          }
          savePresetsToStorage([...validPresets, ...presets.filter(p => !validPresets.some(v => v.id === p.id))]);
          showToast('success', `Successfully imported ${validPresets.length} presets from file`);
        } else if (parsed.render_target && parsed.behavior) {
          // Single preset
          const importedId = parsed.id || `imported_${Date.now()}`;
          const importedPreset: HudPresetProfile = {
            ...parsed,
            id: importedId,
            name: parsed.name || `Imported Preset (${new Date().toLocaleTimeString()})`,
            description: parsed.description || 'Imported from JSON file',
            isFactory: false,
            updated_at: new Date().toISOString()
          };

          const updated = [importedPreset, ...presets.filter(p => p.id !== importedId)];
          savePresetsToStorage(updated);
          setActivePresetId(importedId);
          onApplyProfile(importedPreset);
          showToast('success', `Imported & applied preset "${importedPreset.name}"`);
        } else {
          throw new Error('Invalid Dragon 9 HUD Preset JSON schema');
        }
      } catch (err: any) {
        showToast('error', `Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Apply JSON from Paste Modal
  const handleApplyPastedJson = () => {
    try {
      if (!pasteJsonText.trim()) {
        showToast('error', 'Please paste JSON content');
        return;
      }
      const parsed = JSON.parse(pasteJsonText);
      if (!parsed.render_target || !parsed.behavior) {
        throw new Error('JSON profile must contain render_target and behavior objects');
      }

      const importedId = parsed.id || `custom_pasted_${Date.now()}`;
      const importedPreset: HudPresetProfile = {
        ...parsed,
        id: importedId,
        name: parsed.name || `Custom JSON Profile (${new Date().toLocaleTimeString()})`,
        description: parsed.description || 'Directly imported from pasted JSON profile',
        isFactory: false,
        updated_at: new Date().toISOString()
      };

      const updated = [importedPreset, ...presets.filter(p => p.id !== importedId)];
      savePresetsToStorage(updated);
      setActivePresetId(importedId);
      onApplyProfile(importedPreset);
      setPasteModalOpen(false);
      setPasteJsonText('');
      showToast('success', `Imported & applied preset "${importedPreset.name}"!`);
    } catch (err: any) {
      showToast('error', `Invalid JSON: ${err.message}`);
    }
  };

  // Copy current active profile to clipboard
  const handleCopyCurrentJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentProfile, null, 2));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
    showToast('success', 'Copied current preset JSON to clipboard!');
  };

  // Nudge presets to standard screen positions
  const handleSnapTo = (xPct: number, yPct: number, label: string) => {
    onUpdateCurrentProfile(prev => ({
      ...prev,
      render_target: {
        ...prev.render_target,
        position: { x: `${xPct}%`, y: `${yPct}%` }
      }
    }));
    showToast('success', `Snapped to ${label} (${xPct}%, ${yPct}%)`);
  };

  const currentX = parseFloat(currentProfile.render_target.position.x) || 50;
  const currentY = parseFloat(currentProfile.render_target.position.y) || 50;
  const currentScale = currentProfile.render_target.css_scale || 1.5;
  const currentRot = currentProfile.render_target.rotationDeg ?? 0;
  const currentOpacity = Math.round((currentProfile.render_target.opacity ?? 1.0) * 100);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Header Bar */}
      <div className="px-5 py-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm tracking-wide">
                2D AVATAR HUD PRESET & LAYER MANAGER
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                JSON Profiles
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Save, load, and export positioning, layer targets, and 432Hz motion behaviors
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Alignment Grid Overlay Toggle */}
          <button
            type="button"
            onClick={() => onToggleGuides(!showGuides)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              showGuides
                ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Toggle Rule-of-Thirds Grid on Canvas Viewport"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid Guides</span>
          </button>

          {/* Save As New Preset Button */}
          <button
            type="button"
            onClick={() => setSaveModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 fill-current" />
            <span>Save Preset</span>
          </button>

          {/* Import JSON File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Import preset from .json file"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Upload JSON</span>
          </button>

          {/* Paste JSON Modal */}
          <button
            type="button"
            onClick={() => setPasteModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Paste raw JSON profile code"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Paste JSON</span>
          </button>

          {/* Copy Active JSON */}
          <button
            type="button"
            onClick={handleCopyCurrentJson}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy current active configuration as JSON"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedToast ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Toggle Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className={`px-5 py-2 text-xs font-mono flex items-center gap-2 border-b ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
            : 'bg-red-950/80 text-red-300 border-red-500/30'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* ============================================================== */}
          {/* 1. PRESET SELECTOR CAROUSEL / GRID                            */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                  Preset Profile Library ({presets.length})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={handleExportAllPresets}
                  className="text-zinc-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Export all presets as single JSON bundle"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Bundle</span>
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={handleResetToFactory}
                  className="text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Restore factory default profiles"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Presets Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map(preset => {
                const isActive = activePresetId === preset.id;
                const pos = preset.render_target?.position || { x: '50%', y: '50%' };
                const scale = preset.render_target?.css_scale || 1.5;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between space-y-3 ${
                      isActive
                        ? 'bg-zinc-900 border-cyan-500 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                    }`}
                  >
                    {/* Top Row: Name & Badges */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs tracking-tight line-clamp-1">
                          {preset.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {preset.isFactory ? (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400">
                              Factory
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[9px] font-mono text-emerald-300">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    {/* Metadata Specs Pill */}
                    <div className="bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <div>
                        Pos: <span className="text-cyan-400 font-semibold">{pos.x}, {pos.y}</span>
                      </div>
                      <div>
                        Scale: <span className="text-amber-400 font-semibold">{scale}x</span>
                      </div>
                      <div>
                        Layer: <span className="text-emerald-400 font-semibold line-clamp-1">{preset.render_target.layer.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] font-mono">
                      <span className="text-zinc-500">
                        {preset.avatarSpriteKey.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleExportSinglePreset(preset, e)}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-cyan-400 transition-colors"
                          title="Export single JSON profile"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        {!preset.isFactory && (
                          <button
                            type="button"
                            onClick={(e) => handleDeletePreset(preset.id, e)}
                            className="p-1 rounded bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete custom preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. FINE-TUNE POSITION & LAYER TARGET CONTROLS                 */}
          {/* ============================================================== */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <Move className="w-4 h-4 text-emerald-400" />
                <span>Live Avatar Positioning & Layer Tuning</span>
              </span>
              <div className="text-[11px] text-zinc-400">
                Coords: <strong className="text-cyan-400">{currentProfile.render_target.position.x} X</strong> / <strong className="text-cyan-400">{currentProfile.render_target.position.y} Y</strong> • Scale: <strong className="text-amber-400">{currentScale}x</strong>
              </div>
            </div>

            {/* Quick Screen Snapping Anchors */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wide block">
                Quick Screen Anchors (Rule-of-Thirds Snap)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSnapTo(15, 20, 'Top-Left')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Top-Left (15%, 20%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapTo(50, 20, 'Top-Center')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Top-Center (50%, 20%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapTo(80, 20, 'Top-Right')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Top-Right (80%, 20%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapTo(20, 75, 'Lower-Third')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Lower-Left (20%, 75%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapTo(50, 50, 'Center Stage')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Center (50%, 50%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapTo(85, 80, 'Bottom-Right')}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Bottom-Right (85%, 80%)
                </button>
              </div>
            </div>

            {/* Fine Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* X Position Slider */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">X Position (Horizontal)</span>
                  <span className="text-cyan-400 font-bold">{Math.round(currentX)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="1"
                  value={currentX}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      render_target: {
                        ...prev.render_target,
                        position: { ...prev.render_target.position, x: `${val}%` }
                      }
                    }));
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Y Position Slider */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Y Position (Vertical)</span>
                  <span className="text-cyan-400 font-bold">{Math.round(currentY)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={currentY}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      render_target: {
                        ...prev.render_target,
                        position: { ...prev.render_target.position, y: `${val}%` }
                      }
                    }));
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Scale Slider */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">CSS Scale Factor</span>
                  <span className="text-amber-400 font-bold">{currentScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={currentScale}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      render_target: {
                        ...prev.render_target,
                        css_scale: val
                      }
                    }));
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Rotation Angle</span>
                  <span className="text-emerald-400 font-bold">{currentRot}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={currentRot}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      render_target: {
                        ...prev.render_target,
                        rotationDeg: val
                      }
                    }));
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Layer Target & Sprite Asset Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Layer Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">Target Rendering Layer</label>
                <select
                  value={currentProfile.render_target.layer}
                  onChange={(e) => {
                    const layer = e.target.value;
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      render_target: {
                        ...prev.render_target,
                        layer
                      }
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="glassmorphism_hud_top">glassmorphism_hud_top (Over Video)</option>
                  <option value="overlay_lower_third">overlay_lower_third (Lower Broadcast)</option>
                  <option value="pip_broadcast_corner">pip_broadcast_corner (Compact PIP)</option>
                  <option value="broadcast_center_stage">broadcast_center_stage (Full Stage)</option>
                  <option value="foreground_sub_layer">foreground_sub_layer (Behind HUD)</option>
                </select>
              </div>

              {/* Avatar Sprite Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">2D SVG Sprite Character</label>
                <select
                  value={currentProfile.avatarSpriteKey}
                  onChange={(e) => {
                    const spriteKey = e.target.value;
                    const assetMap: Record<string, string> = {
                      'super_puff': '/assets/vectors/avatars/super_puff.svg',
                      'pee_dub': '/assets/vectors/avatars/pee_dub.svg',
                      'lotus_nexus': '/assets/vectors/avatars/lotus_nexus.svg',
                      'avatar_base': '/assets/vectors/avatars/avatar_base.svg'
                    };
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      avatarSpriteKey: spriteKey,
                      render_target: {
                        ...prev.render_target,
                        sprite_asset: assetMap[spriteKey] || '/assets/vectors/avatars/avatar_base.svg'
                      }
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="super_puff">Super Puff 2D Hero</option>
                  <option value="pee_dub">Pee Dub 2D Surfer</option>
                  <option value="lotus_nexus">Lotus Nexus Sacred Geometry</option>
                  <option value="avatar_base">Dragon 9 Base Vector</option>
                </select>
              </div>

              {/* Behavior Entry Transition */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">Entry Motion Transition</label>
                <select
                  value={currentProfile.behavior.entry_transition}
                  onChange={(e) => {
                    const trans = e.target.value;
                    onUpdateCurrentProfile(prev => ({
                      ...prev,
                      behavior: {
                        ...prev.behavior,
                        entry_transition: trans
                      }
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="fade_slide_up">fade_slide_up (Smooth Easing)</option>
                  <option value="zoom_elastic">zoom_elastic (Sub-Drop Pop)</option>
                  <option value="instant_pop">instant_pop (Direct Blit)</option>
                  <option value="glitch_warp">glitch_warp (Vaporwave Shimmer)</option>
                </select>
              </div>
            </div>

            {/* Extra Motion Options: Halo Glow & Flip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800 text-[11px]">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={currentProfile.behavior.haloGlow ?? true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onUpdateCurrentProfile(prev => ({
                        ...prev,
                        behavior: { ...prev.behavior, haloGlow: checked }
                      }));
                    }}
                    className="rounded border-zinc-700 bg-zinc-900 text-cyan-400 focus:ring-0"
                  />
                  <span>432Hz Radial Glow Halo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={currentProfile.render_target.flipHorizontal ?? false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onUpdateCurrentProfile(prev => ({
                        ...prev,
                        render_target: { ...prev.render_target, flipHorizontal: checked }
                      }));
                    }}
                    className="rounded border-zinc-700 bg-zinc-900 text-cyan-400 focus:ring-0"
                  />
                  <span>Flip Horizontally</span>
                </label>
              </div>

              {/* Halo Color Selector */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[10px]">Halo Accent:</span>
                {(['cyan', 'emerald', 'gold', 'pink', 'purple'] as const).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onUpdateCurrentProfile(prev => ({
                        ...prev,
                        behavior: { ...prev.behavior, haloColor: color }
                      }));
                    }}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      color === 'cyan' ? 'bg-cyan-400' :
                      color === 'emerald' ? 'bg-emerald-400' :
                      color === 'gold' ? 'bg-amber-400' :
                      color === 'pink' ? 'bg-pink-400' : 'bg-purple-400'
                    } ${
                      currentProfile.behavior.haloColor === color
                        ? 'ring-2 ring-white scale-125'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    title={`Set halo color to ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SAVE AS NEW PRESET MODAL                                    */}
      {/* ============================================================== */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Save Live Layout as JSON Preset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">Preset Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Upper-Left Studio Host Badge"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-400 text-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">Category Tag</label>
                <select
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-400 text-xs"
                >
                  <option value="broadcast">Broadcast Stream Overlay</option>
                  <option value="pip">Picture-in-Picture (PIP)</option>
                  <option value="lower_third">Lower-Third Banner</option>
                  <option value="center_stage">Center Stage Hero</option>
                  <option value="custom">Custom Experimental</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief note on layout positioning and intended scene usage..."
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-400 text-xs resize-none"
                />
              </div>

              {/* JSON Payload Preview */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase block">Snapshot Payload Preview</span>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[10px] text-emerald-300 max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify({
                    position: currentProfile.render_target.position,
                    scale: currentProfile.render_target.css_scale,
                    layer: currentProfile.render_target.layer,
                    sprite: currentProfile.avatarSpriteKey,
                    transition: currentProfile.behavior.entry_transition
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 fill-current" />
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. PASTE RAW JSON PROFILE MODAL                                */}
      {/* ============================================================== */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Paste HUD Preset JSON Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-zinc-400">
              Paste a valid Dragon 9 HUD Preset JSON object containing <code className="text-cyan-400">render_target</code> and <code className="text-emerald-400">behavior</code> specifications.
            </p>

            <textarea
              rows={8}
              placeholder={`{\n  "name": "My Custom Corner Overlay",\n  "avatarSpriteKey": "super_puff",\n  "render_target": {\n    "layer": "glassmorphism_hud_top",\n    "position": { "x": "80%", "y": "20%" },\n    "css_scale": 1.5\n  },\n  "behavior": {\n    "entry_transition": "fade_slide_up",\n    "pulse_frequency": "432Hz_sync",\n    "duration_beats": 18\n  }\n}`}
              value={pasteJsonText}
              onChange={(e) => setPasteJsonText(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-amber-400 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPastedJson}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Parse & Apply JSON Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
