/**
 * Dragon 9 Media Factory Type Definitions
 *
 * @license Apache-2.0
 */

export interface Dragon9Clock {
  timecode: string;
  terrestrialClock: string;
  cycle: number;
  beat: number;
  tick: number;
  cycleProgressPct: number;
  hourProgressPct: number;
  totalCycles: number;
  beatsPerCycle: number;
  subdivisionsPerCycle: number;
  hourDurationMin: number;
}

export interface Dragon9Telemetry {
  neuralAccelerators: string;
  vramPoolAllocatedGB: number;
  vramPoolTotalGB: number;
  ffmpegWorkerThreads: number;
  audioClockDriftMs: number;
  fluidMotionFps: number;
  tuningMasterHz: number;
  uptimeSeconds: number;
}

export interface Dragon9Status {
  name: string;
  version: string;
  clock: Dragon9Clock;
  telemetry: Dragon9Telemetry;
  pipelines: {
    visualRender: any;
    audioSynthesizer: any;
    syncLocked: boolean;
  };
  activeJobsCount: number;
  totalJobsCount: number;
  supportedShows: string[];
  supportedMusicGenres: {
    id: string;
    name: string;
    defaultBpm: number;
  }[];
}

export interface CharacterManifest {
  id: string;
  name: string;
  description: string;
  elevenLabsVoiceId: string;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
    style?: number;
  };
  visualModelSeed: number;
}

export interface DialogueLine {
  characterId: string;
  speaker: string;
  line: string;
  emotion?: string;
  startOffset?: number;
  duration?: number;
  resolvedVoiceId?: string;
}

export interface SceneManifest {
  sceneId: string;
  sceneTitle: string;
  durationSeconds: number;
  dragon9Timecode: string;
  backgroundPrompt: string;
  cameraMotion: string;
  visualPrompts: string[];
  dialogue: DialogueLine[];
  sfx: string[];
  ffmpegFilters: string;
  sceneNumber?: number;
  routedVisualPrompts?: string[];
  routedVoiceovers?: any[];
}

export interface AssetArchitectManifest {
  manifestVersion: string;
  architectId: string;
  seriesTitle: string;
  episodeId: string;
  episodeTitle: string;
  season: number;
  episodeNumber: number;
  dragon9Cycle: string;
  resolution: string;
  fps: number;
  colorSpace: string;
  aspectRatio: string;
  audioTuning: string;
  characters: CharacterManifest[];
  scenes: SceneManifest[];
}

export interface VoiceStemMapping {
  stemId: string;
  characterId: string;
  characterName: string;
  sceneNumber: number;
  sceneTitle: string;
  timeOffsetSec: number;
  timeOffsetMs: number;
  estimatedDurationSec: number;
  elevenLabsVoiceId: string;
  text: string;
  stemFileName: string;
  adelayFilter: string;
  synthesized?: boolean;
}

export interface RenderJob {
  id: string;
  seriesTitle: string;
  episodeId: string;
  episodeTitle: string;
  dragon9Cycle: string;
  status: 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  currentFrame: number;
  totalFrames: number;
  totalDurationSeconds: number;
  fps: number;
  resolution: string;
  audioTuning: string;
  scenesCount: number;
  audioStems: {
    proceduralMidiTrack: string;
    voiceoverTrackCount: number;
    sfxTrackCount: number;
  };
  voiceStems?: VoiceStemMapping[];
  ffmpegScript: string;
  containerPipelineScript?: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MidiTrackResult {
  genre: string;
  bpm: number;
  bars: number;
  tuning: string;
  dragon9Sequencer: {
    dragon9HourDuration: string;
    bpm: number;
    beatsPerCycle: number;
    cycleDurationSeconds: number;
    metricBarsPerCycle: number;
    timeSignature: string;
    harmonicTuning: string;
    tuningOffsetCents: number;
  };
  binary?: Uint8Array;
  base64?: string;
  noteSummary: any[];
}

export interface TuningTableRow {
  midiNote: number;
  name: string;
  frequency432Hz: number;
  frequency440Hz: number;
  centDeviation: number;
  harmonicRatio: number;
}

export interface SmartAvatarSummary {
  id: string;
  name: string;
  series: string;
  category: string;
  version: string;
  dragon9Cycle: string;
  networkNode: string;
  description: string;
  currentRpm: number;
  vibe: string;
  triadSyncPercent: number;
  contributionPoints: number;
}

export interface HarmonyFeedItem {
  id: string;
  name: string;
  avatarId: string;
  creator: string;
  bpm: number;
  vibe: string;
  tracksCount: number;
  code: string;
  timestamp: string;
}

export interface ConstellationStatus {
  networkTitle: string;
  gatewayNode: string;
  syncPercentage: number;
  resonanceVibe: string;
  triads: {
    id: string;
    name: string;
    color: string;
    nodes: [number, number][];
    active: boolean;
  }[];
  connectedAvatarsCount: number;
  activePeers: number;
  totalPointsHarvested: number;
}

export interface AvatarEventPayload {
  episode_id: string;
  sync_anchor: {
    d9_cycle: number;
    d9_beat: number;
    stem_trigger: string;
  };
  render_target: {
    layer: string;
    sprite_asset: string;
    css_scale: number;
    position: { x: string; y: string };
  };
  behavior: {
    entry_transition: string;
    pulse_frequency: string;
    duration_beats: number;
  };
}

export interface ScheduledAvatarEvent {
  id: string;
  active: boolean;
  triggeredAt: number;
  avatar_event: AvatarEventPayload;
}

export interface HudPresetProfile {
  id: string;
  name: string;
  category?: 'broadcast' | 'pip' | 'lower_third' | 'center_stage' | 'custom' | string;
  description: string;
  created_at?: string;
  updated_at?: string;
  isFactory?: boolean;
  show: 'superPuff' | 'peeDubSurfChronicles' | 'all' | string;
  avatarSpriteKey: 'avatar_base' | 'super_puff' | 'pee_dub' | 'lotus_nexus' | string;
  render_target: {
    layer: 'glassmorphism_hud_top' | 'overlay_lower_third' | 'pip_broadcast_corner' | 'broadcast_center_stage' | 'foreground_sub_layer' | string;
    sprite_asset: string;
    css_scale: number;
    position: { x: string; y: string };
    rotationDeg?: number;
    opacity?: number;
    flipHorizontal?: boolean;
    blendMode?: string;
  };
  behavior: {
    entry_transition: 'fade_slide_up' | 'instant_pop' | 'zoom_elastic' | 'glitch_warp' | string;
    pulse_frequency: '432Hz_sync' | '54_minute_cycle' | 'dynamic_stem_react' | string;
    duration_beats: number;
    haloGlow?: boolean;
    haloColor?: 'cyan' | 'emerald' | 'gold' | 'pink' | 'purple' | string;
    shockwaveOnStem?: boolean;
  };
  sync_anchor?: {
    d9_cycle: number;
    d9_beat: number;
    stem_trigger: string;
  };
}
