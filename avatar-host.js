/**
 * Dragon 9 Smart Object Avatar Hosting Module
 * Serves 2D dynamic smart object avatars for the unified media factory.
 * Manages lightweight SVG sprites and JSON-based vector animations to
 * preserve VRAM and keep the pipeline fast on local hardware nodes.
 *
 * @license Apache-2.0
 */

import { getMidiNoteFrequency432 } from './horizon-midi.js';

/**
 * 2D SVG Sprite Registry (Low VRAM Footprint)
 */
export const SVG_SPRITE_REGISTRY = {
  'avatar_base': {
    id: 'avatar_base',
    path: '/assets/vectors/avatars/avatar_base.svg',
    name: 'Dragon 9 Base Vector Sprite',
    category: 'svg_vector_avatar',
    sizeBytes: 1980,
    vramFootprint: '0 KB (Direct Vector Blit)',
    nativeDimensions: { width: 200, height: 200 },
    primaryColors: ['#00e5ff', '#10b981', '#d4af37'],
    harmonicTuning: '432Hz'
  },
  'super_puff': {
    id: 'super_puff',
    path: '/assets/vectors/avatars/super_puff.svg',
    name: 'Super Puff 2D Hero Sprite',
    category: 'svg_vector_avatar',
    sizeBytes: 1540,
    vramFootprint: '0 KB (Direct Vector Blit)',
    nativeDimensions: { width: 200, height: 200 },
    primaryColors: ['#f472b6', '#fdf2f8', '#ec4899'],
    harmonicTuning: '432Hz'
  },
  'pee_dub': {
    id: 'pee_dub',
    path: '/assets/vectors/avatars/pee_dub.svg',
    name: 'Pee Dub 2D Surfer Sprite',
    category: 'svg_vector_avatar',
    sizeBytes: 1420,
    vramFootprint: '0 KB (Direct Vector Blit)',
    nativeDimensions: { width: 200, height: 200 },
    primaryColors: ['#06b6d4', '#10b981', '#38bdf8'],
    harmonicTuning: '432Hz'
  },
  'lotus_nexus': {
    id: 'lotus_nexus',
    path: '/assets/vectors/avatars/lotus_nexus.svg',
    name: 'Lotus Nexus 2D Sacred Geometry Sprite',
    category: 'svg_vector_avatar',
    sizeBytes: 2340,
    vramFootprint: '0 KB (Direct Vector Blit)',
    nativeDimensions: { width: 200, height: 200 },
    primaryColors: ['#d4af37', '#00e5ff', '#0f172a'],
    harmonicTuning: '432Hz'
  },
  'cyber_dragon': {
    id: 'cyber_dragon',
    path: '/assets/vectors/avatars/cyber_dragon_face.svg',
    name: 'Dragon 9 Cyber Guardian (CYBER_DRAGON_FACE.V4)',
    category: 'svg_vector_avatar',
    sizeBytes: 3120,
    vramFootprint: '0 KB (Direct Vector Blit)',
    nativeDimensions: { width: 300, height: 300 },
    primaryColors: ['#00f0ff', '#3b82f6', '#8b5cf6', '#facc15'],
    harmonicTuning: '432Hz'
  }
};

/**
 * JSON-Based Vector Animation Timelines
 * Preserves local GPU VRAM by avoiding heavy texture atlas memory.
 * Computes deterministic transforms synced to 432Hz waveforms & D9 beats.
 */
export const VECTOR_ANIMATIONS = {
  'fade_slide_up': {
    id: 'fade_slide_up',
    description: 'Smooth vertical slide from +30px offset with ease-out cubic fade-in',
    durationMs: 480,
    keyframes: [
      { progress: 0.0, opacity: 0.0, translateY: 30, scale: 0.8 },
      { progress: 0.6, opacity: 0.9, translateY: -4, scale: 1.05 },
      { progress: 1.0, opacity: 1.0, translateY: 0, scale: 1.0 }
    ]
  },
  '432Hz_sync': {
    id: '432Hz_sync',
    description: 'Harmonic oscillation linked directly to 432Hz Verdi universal frequency',
    fundamentalHz: 432.0,
    visualPulseHz: 4.32, // 432 / 100 for human visual perception
    modulation: 'sine',
    scaleAmplitude: 0.12, // 1.0 +/- 0.12
    glowRadiusMin: 4,
    glowRadiusMax: 18,
    colorShift: ['#00e5ff', '#d4af37', '#10b981']
  },
  'trip-hop_bass_drop': {
    id: 'trip-hop_bass_drop',
    description: 'Punchy bass-drop impact with rapid squash-and-stretch and radial glow burst',
    attackMs: 60,
    decayMs: 380,
    impactScaleX: 1.35,
    impactScaleY: 0.78,
    reboundScaleX: 0.92,
    reboundScaleY: 1.15,
    rippleCircles: 3
  },
  'dub-reggae_sub_pulse': {
    id: 'dub-reggae_sub_pulse',
    description: 'One-drop sub-bass heavy pulse with dub delay echo rings',
    tempoBpm: 74,
    echoRepeats: 4,
    decayFactor: 0.6
  },
  'g-funk_whistle_lead': {
    id: 'g-funk_whistle_lead',
    description: 'High-frequency portamento glide with vibrato shimmer',
    vibratoRateHz: 6.0,
    vibratoDepth: 0.08
  }
};

/**
 * Pre-configured Flagship Smart Object Avatars
 */
export const FLAGSHIP_AVATARS = {
  'avatar-base': {
    id: 'avatar-base',
    name: 'Dragon 9 Base Smart Object Avatar',
    series: 'FluidmotionTV System',
    category: 'dynamic_vector_smart_object',
    version: '1.0.0',
    dragon9Cycle: 'CYCLE-04:BEAT-02',
    networkNode: 'NODE-D9-BASE-VECTOR',
    description: 'Lightweight 2D SVG smart object avatar designed for HUD video stream overlays and fast local pipeline blitting.',
    spriteAsset: '/assets/vectors/avatars/avatar_base.svg',
    vectorAnimation: {
      defaultEntry: 'fade_slide_up',
      defaultPulse: '432Hz_sync',
      stemReactions: ['trip-hop_bass_drop', 'dub-reggae_sub_pulse', 'g-funk_whistle_lead']
    },
    visualSpecs: {
      renderer: '2d-canvas-vector',
      spriteId: 'avatar_base',
      cssScale: 1.5,
      defaultPosition: { x: '80%', y: '20%' },
      materials: {
        glowCyan: '#00e5ff',
        accentGold: '#d4af37',
        accentEmerald: '#10b981'
      }
    },
    physics: {
      massKg: 0.5,
      airResistance: 0.001,
      maxRpm: 360
    },
    audioProfile: {
      masterTuning: '432Hz Verdi Universal Harmonic',
      referenceA4Hz: 432.0,
      stemTriggers: ['trip-hop_bass_drop', 'dub-reggae_sub_pulse']
    }
  },

  'super-puff': {
    id: 'super-puff',
    name: 'Super Puff - Sentient Marshmallow Hero',
    series: 'Super Puff (Nutflox Flagship)',
    category: 'interactive_fluid_character',
    version: '2.9.4',
    dragon9Cycle: 'CYCLE-04:BEAT-02',
    networkNode: 'NODE-NUTFLOX-MARSHMALLOW',
    description: 'Sentient marshmallow superhero with bouncy fluid dynamics, cotton-candy aura, and squash-and-stretch kinematics.',
    spriteAsset: '/assets/vectors/avatars/super_puff.svg',
    vectorAnimation: {
      defaultEntry: 'fade_slide_up',
      defaultPulse: '432Hz_sync',
      stemReactions: ['trip-hop_bass_drop', 'g-funk_whistle_lead']
    },
    visualSpecs: {
      renderer: '2d-canvas-vector',
      spriteId: 'super_puff',
      cssScale: 1.5,
      defaultPosition: { x: '80%', y: '20%' },
      materials: {
        glowCyan: '#f472b6',
        accentGold: '#facc15',
        primaryColor: '#fdf2f8'
      }
    },
    physics: {
      elasticity: 0.88,
      fluidViscosity: 0.12,
      squashStretchRatio: 1.45,
      bounceFrequencyHz: 2.16
    },
    audioProfile: {
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      musicalKey: 'G-Funk 432Hz Bass Fundamental',
      stemTriggers: ['trip-hop_bass_drop']
    }
  },

  'pee-dub': {
    id: 'pee-dub',
    name: 'Pee Dub - Vaporwave Anti-Gravity Surfer',
    series: 'Pee Dub Surf Chronicles (Nutflox Flagship)',
    category: 'interactive_kinetic_surfer',
    version: '2.9.4',
    dragon9Cycle: 'CYCLE-06:BEAT-02',
    networkNode: 'NODE-TIDAL-NINE-SURF',
    description: 'Vaporwave surf guru with sunglasses, neon board shorts, chrome anti-gravity surfboard, and endless chill wisdom.',
    spriteAsset: '/assets/vectors/avatars/pee_dub.svg',
    vectorAnimation: {
      defaultEntry: 'fade_slide_up',
      defaultPulse: '432Hz_sync',
      stemReactions: ['dub-reggae_sub_pulse']
    },
    visualSpecs: {
      renderer: '2d-canvas-vector',
      spriteId: 'pee_dub',
      cssScale: 1.4,
      defaultPosition: { x: '20%', y: '75%' },
      materials: {
        glowCyan: '#06b6d4',
        accentGold: '#10b981',
        primaryColor: '#0e7490'
      }
    },
    physics: {
      hydrofoilLift: 1.8,
      waveTubeCarveTiltDeg: 35
    },
    audioProfile: {
      voiceId: 'ErXwobaYiN019PkySvjV',
      musicalKey: 'Dub Reggae 432Hz One-Drop Key of A',
      stemTriggers: ['dub-reggae_sub_pulse']
    }
  },

  'lotus-nexus': {
    id: 'lotus-nexus',
    name: 'Lotus Nexus - 3D Musical Fidget Spinner & Piano',
    series: 'Sovereign Flow / FluidmotionTV Core Gateway',
    category: 'interactive_musical_spinner',
    version: '2.4.0',
    dragon9Cycle: 'CYCLE-01:BEAT-01',
    networkNode: 'NODE-GATEWAY-LOTUS-ALPHA',
    description: 'Sacred geometry 3D lotus smart object avatar with kinetic spinner physics and 8-petal 432Hz Verdi micro-piano.',
    spriteAsset: '/assets/vectors/avatars/lotus_nexus.svg',
    vectorAnimation: {
      defaultEntry: 'fade_slide_up',
      defaultPulse: '432Hz_sync',
      stemReactions: ['432Hz_sync']
    },
    visualSpecs: {
      renderer: 'hybrid-three-canvas',
      spriteId: 'lotus_nexus',
      petalShapes: ['lotus', 'round', 'star'],
      petalCount: 8,
      materials: {
        glowCyan: '#00e5ff',
        accentGold: '#d4af37'
      }
    },
    physics: {
      massKg: 1.25,
      momentOfInertia: 0.082,
      angularFriction: 0.985,
      maxRpm: 1200,
      strikerTools: [
        { id: 'finger', name: 'Glowing Finger', impulse: 1.0 },
        { id: 'wand', name: 'Magic Wand', impulse: 1.6 },
        { id: 'drumstick', name: 'Drumstick', impulse: 2.2 }
      ]
    },
    audioProfile: {
      masterTuning: '432Hz Verdi Universal Harmonic',
      referenceA4Hz: 432.0,
      petals: [
        { index: 0, midiNote: 60, noteName: 'C4', frequency432Hz: 256.87, label: 'C4' },
        { index: 1, midiNote: 62, noteName: 'D4', frequency432Hz: 288.33, label: 'D4' },
        { index: 2, midiNote: 64, noteName: 'E4', frequency432Hz: 323.63, label: 'E4' },
        { index: 3, midiNote: 65, noteName: 'F4', frequency432Hz: 342.88, label: 'F4' },
        { index: 4, midiNote: 67, noteName: 'G4', frequency432Hz: 384.87, label: 'G4' },
        { index: 5, midiNote: 69, noteName: 'A4', frequency432Hz: 432.00, label: 'A4' },
        { index: 6, midiNote: 71, noteName: 'B4', frequency432Hz: 484.90, label: 'B4' },
        { index: 7, midiNote: 72, noteName: 'C5', frequency432Hz: 513.74, label: 'C5' }
      ]
    },
    networkGateway: {
      triads: [
        { id: 'triad-0', name: 'Triad 1 (Top Left - Cyan)', color: '#00e5ff', nodes: [[180, 180], [320, 130], [260, 280]], active: true },
        { id: 'triad-1', name: 'Triad 2 (Top Right - Gold)', color: '#d4af37', nodes: [[720, 160], [840, 250], [780, 110]], active: true },
        { id: 'triad-2', name: 'Triad 3 (Bottom Left - Gold)', color: '#d4af37', nodes: [[170, 520], [290, 590], [230, 460]], active: true },
        { id: 'triad-3', name: 'Triad 4 (Bottom Right - Cyan)', color: '#00e5ff', nodes: [[730, 490], [850, 550], [790, 410]], active: true }
      ]
    }
  },

  'cyber-dragon': {
    id: 'cyber-dragon',
    name: 'Dragon 9 Cyber Guardian (CYBER_DRAGON_FACE.V4)',
    series: 'Nutflox Special Presentation (Dragon 9 Flagship)',
    category: 'fluid_cybernetic_avatar',
    version: '4.0.0',
    dragon9Cycle: 'CYCLE-09:BEAT-09',
    networkNode: 'NODE-D9-CYBER-GUARDIAN-V4',
    description: 'Ancient cybernetic quantum time-dragon with glowing cyan plasma eyes, binary data stream breath, circuit scales, and 432Hz sub-bass vocoder voice.',
    spriteAsset: '/assets/vectors/avatars/cyber_dragon_face.svg',
    vectorAnimation: {
      defaultEntry: 'fade_slide_up',
      defaultPulse: '432Hz_sync',
      stemReactions: ['trip-hop_bass_drop', 'dub-reggae_sub_pulse', 'g-funk_whistle_lead']
    },
    visualSpecs: {
      renderer: '2d-canvas-vector',
      spriteId: 'cyber_dragon',
      cssScale: 1.6,
      defaultPosition: { x: '50%', y: '45%' },
      materials: {
        glowCyan: '#00f0ff',
        accentGold: '#facc15',
        primaryColor: '#0f172a',
        laserGlow: '#38bdf8'
      }
    },
    physics: {
      massKg: 8.5,
      airResistance: 0.002,
      plasmaVortices: 4
    },
    audioProfile: {
      voiceId: 'CYBER_DRAGON_VOCODER_432HZ',
      masterTuning: '432Hz Verdi Universal Harmonic (Trip-Hop Sub Bass)',
      referenceA4Hz: 432.0,
      speechLine: 'Welcome to the Dragon 9 Synchronized Time Pipeline. Fluid Motion sequence is now active. Synchronize your time with the future.',
      stemTriggers: ['trip-hop_bass_drop', 'dub-reggae_sub_pulse']
    }
  }
};

/**
 * Smart Object Avatar Hosting Service
 */
export class SmartObjectAvatarHost {
  constructor(options = {}) {
    this.name = 'Dragon 9 Smart Object Avatar Host';
    this.machineId = 'DRAGON-9-AVATAR-HOST-01';
    this.startTime = Date.now();
    
    // In-memory registries
    this.avatars = new Map();
    this.dynamicStates = new Map();
    this.harmonyFeed = [];
    this.eventListeners = new Set();
    this.scheduledEvents = [];

    // Initialize with flagship avatars
    for (const [key, avatar] of Object.entries(FLAGSHIP_AVATARS)) {
      this.avatars.set(key, JSON.parse(JSON.stringify(avatar)));
      this.dynamicStates.set(key, this._createInitialState(key, avatar));
    }

    // Seed initial avatar events including user's specific event payload
    this.scheduledEvents = [
      {
        id: 'evt_super_puff_101_bass_drop',
        active: true,
        triggeredAt: Date.now(),
        avatar_event: {
          episode_id: 'super_puff_101',
          sync_anchor: {
            d9_cycle: 4,
            d9_beat: 2,
            stem_trigger: 'trip-hop_bass_drop'
          },
          render_target: {
            layer: 'glassmorphism_hud_top',
            sprite_asset: '/assets/vectors/avatars/avatar_base.svg',
            css_scale: 1.5,
            position: { x: '80%', y: '20%' }
          },
          behavior: {
            entry_transition: 'fade_slide_up',
            pulse_frequency: '432Hz_sync',
            duration_beats: 18
          }
        }
      },
      {
        id: 'evt_pee_dub_201_wave_carve',
        active: true,
        triggeredAt: Date.now() - 5000,
        avatar_event: {
          episode_id: 'pee_dub_201',
          sync_anchor: {
            d9_cycle: 6,
            d9_beat: 2,
            stem_trigger: 'dub-reggae_sub_pulse'
          },
          render_target: {
            layer: 'glassmorphism_hud_top',
            sprite_asset: '/assets/vectors/avatars/pee_dub.svg',
            css_scale: 1.35,
            position: { x: '20%', y: '75%' }
          },
          behavior: {
            entry_transition: 'fade_slide_up',
            pulse_frequency: '432Hz_sync',
            duration_beats: 24
          }
        }
      }
    ];

    // Seed initial harmony exchange feed
    this.harmonyFeed = [
      {
        id: 'jam_01_nebula',
        name: 'Nebula Echoes (Ambient 432Hz)',
        avatarId: 'lotus-nexus',
        creator: 'fluidmotiontv@gmail.com',
        bpm: 86,
        vibe: 'harmonic',
        tracksCount: 3,
        code: 'D9-JAM-86BPM-HARM-432-NEBULA',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'jam_02_golden_arps',
        name: 'Golden Sunrise Arpeggios',
        avatarId: 'lotus-nexus',
        creator: 'LotusNexus_Guest',
        bpm: 112,
        vibe: 'harmonic',
        tracksCount: 4,
        code: 'D9-JAM-112BPM-GOLD-432-SUNRISE',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  }

  _createInitialState(id, avatar) {
    return {
      avatarId: id,
      currentRpm: id === 'lotus-nexus' ? 0 : 24,
      targetRpm: 0,
      angleDeg: 0,
      angularVelocity: 0,
      autoSpin: false,
      activeTool: 'wand',
      vibe: 'harmonic',
      petalShape: 'lotus',
      petalSpacing: 100,
      showNoteLabels: true,
      backingBeat: false,
      synthModel: 'piano',
      synthParams: {
        masterVol: 75,
        cutoff: 60,
        resonance: 40,
        attack: 0.1,
        decay: 1.5,
        delayFeedback: 30
      },
      triadChallengeActive: false,
      triadSyncPercent: 94,
      contributionPoints: 120,
      lastInteractionTime: Date.now(),
      totalStrikes: 0,
      vramPreservedBytes: '100% Vector (Zero VRAM allocated)'
    };
  }

  /**
   * Returns list of all hosted avatars with metadata, 2D sprites, and status.
   */
  getAvatars() {
    return Array.from(this.avatars.values()).map(avatar => {
      const state = this.dynamicStates.get(avatar.id) || {};
      return {
        id: avatar.id,
        name: avatar.name,
        series: avatar.series,
        category: avatar.category,
        version: avatar.version,
        dragon9Cycle: avatar.dragon9Cycle,
        networkNode: avatar.networkNode,
        description: avatar.description,
        spriteAsset: avatar.spriteAsset,
        vectorAnimation: avatar.vectorAnimation,
        visualSpecs: avatar.visualSpecs,
        currentRpm: state.currentRpm || 0,
        vibe: state.vibe || 'harmonic',
        triadSyncPercent: state.triadSyncPercent || 94,
        contributionPoints: state.contributionPoints || 120,
        vramPreserved: 'Preserved (Lightweight Vector)'
      };
    });
  }

  /**
   * Returns detailed avatar data for 2D/3D studio rendering.
   */
  getAvatar(id) {
    const avatar = this.avatars.get(id);
    if (!avatar) return null;
    const state = this.dynamicStates.get(id);
    return {
      manifest: avatar,
      state,
      spriteAsset: avatar.spriteAsset,
      vectorAnimation: avatar.vectorAnimation,
      networkGateway: avatar.networkGateway || null
    };
  }

  /**
   * Returns registered 2D SVG sprites.
   */
  get2DSprites() {
    return Object.values(SVG_SPRITE_REGISTRY);
  }

  /**
   * Returns JSON-based vector animation timelines.
   */
  getVectorAnimations() {
    return VECTOR_ANIMATIONS;
  }

  /**
   * Returns list of scheduled and active avatar events.
   */
  getAvatarEvents(filter = {}) {
    if (filter.episode_id) {
      return this.scheduledEvents.filter(e => e.avatar_event?.episode_id === filter.episode_id);
    }
    return this.scheduledEvents;
  }

  /**
   * Triggers an avatar event, scheduling it for the 2D transparent overlay.
   */
  triggerAvatarEvent(eventPayload) {
    const rawEvent = eventPayload.avatar_event ? eventPayload.avatar_event : eventPayload;
    
    const newEvent = {
      id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      active: true,
      triggeredAt: Date.now(),
      avatar_event: {
        episode_id: rawEvent.episode_id || 'super_puff_101',
        sync_anchor: {
          d9_cycle: rawEvent.sync_anchor?.d9_cycle ?? 4,
          d9_beat: rawEvent.sync_anchor?.d9_beat ?? 2,
          stem_trigger: rawEvent.sync_anchor?.stem_trigger || 'trip-hop_bass_drop'
        },
        render_target: {
          layer: rawEvent.render_target?.layer || 'glassmorphism_hud_top',
          sprite_asset: rawEvent.render_target?.sprite_asset || '/assets/vectors/avatars/avatar_base.svg',
          css_scale: rawEvent.render_target?.css_scale ?? 1.5,
          position: rawEvent.render_target?.position || { x: '80%', y: '20%' }
        },
        behavior: {
          entry_transition: rawEvent.behavior?.entry_transition || 'fade_slide_up',
          pulse_frequency: rawEvent.behavior?.pulse_frequency || '432Hz_sync',
          duration_beats: rawEvent.behavior?.duration_beats ?? 18
        }
      }
    };

    this.scheduledEvents.unshift(newEvent);
    // Keep max 50 events in history
    if (this.scheduledEvents.length > 50) {
      this.scheduledEvents.pop();
    }

    this.emitEvent({ type: 'AVATAR_EVENT_TRIGGERED', event: newEvent });
    return newEvent;
  }

  /**
   * Registers or updates a smart object avatar in the host registry.
   */
  registerAvatar(avatarData) {
    if (!avatarData || !avatarData.id) {
      throw new Error('Avatar must have a unique id');
    }
    this.avatars.set(avatarData.id, avatarData);
    if (!this.dynamicStates.has(avatarData.id)) {
      this.dynamicStates.set(avatarData.id, this._createInitialState(avatarData.id, avatarData));
    }
    this.emitEvent({ type: 'AVATAR_REGISTERED', avatarId: avatarData.id });
    return this.getAvatar(avatarData.id);
  }

  /**
   * Low-Latency Avatar Interaction Endpoint
   */
  interact(avatarId, action, params = {}) {
    const avatar = this.avatars.get(avatarId);
    if (!avatar) {
      throw new Error(`Avatar ${avatarId} not found`);
    }

    const state = this.dynamicStates.get(avatarId);
    state.lastInteractionTime = Date.now();

    const result = {
      avatarId,
      action,
      timestamp: Date.now(),
      success: true
    };

    switch (action) {
      case 'strikePetal': {
        const { petalIndex, velocity = 0.8 } = params;
        state.totalStrikes = (state.totalStrikes || 0) + 1;
        state.contributionPoints = (state.contributionPoints || 0) + Math.round(velocity * 10);
        state.triadSyncPercent = Math.min(100, (state.triadSyncPercent || 90) + 1);

        const petal = avatar.audioProfile?.petals?.[petalIndex] || {
          index: petalIndex,
          midiNote: 60 + petalIndex,
          noteName: `Note-${petalIndex}`,
          frequency432Hz: getMidiNoteFrequency432(60 + petalIndex)
        };

        const addedRpm = Math.min(120, velocity * 40 * 1.6);
        state.currentRpm = Math.min(avatar.physics?.maxRpm || 1200, (state.currentRpm || 0) + addedRpm);

        result.strike = {
          petalIndex,
          midiNote: petal.midiNote,
          noteName: petal.noteName,
          frequency432Hz: petal.frequency432Hz,
          velocity,
          addedRpm,
          tool: state.activeTool
        };
        break;
      }

      case 'spin': {
        const { torque = 50 } = params;
        const max = avatar.physics?.maxRpm || 1200;
        state.currentRpm = Math.max(0, Math.min(max, (state.currentRpm || 0) + torque));
        result.currentRpm = state.currentRpm;
        break;
      }

      case 'toggleAutoSpin': {
        state.autoSpin = params.autoSpin !== undefined ? Boolean(params.autoSpin) : !state.autoSpin;
        result.autoSpin = state.autoSpin;
        break;
      }

      case 'setVibe': {
        state.vibe = params.vibe === 'void' ? 'void' : 'harmonic';
        result.vibe = state.vibe;
        break;
      }

      case 'startTriadChallenge': {
        state.triadChallengeActive = true;
        state.triadSyncPercent = 98;
        state.contributionPoints = (state.contributionPoints || 0) + 50;
        result.triadChallengeActive = true;
        result.triadSyncPercent = state.triadSyncPercent;
        break;
      }

      default:
        result.updated = true;
    }

    result.updatedState = {
      currentRpm: state.currentRpm,
      autoSpin: state.autoSpin,
      activeTool: state.activeTool,
      vibe: state.vibe,
      triadSyncPercent: state.triadSyncPercent,
      contributionPoints: state.contributionPoints
    };

    return result;
  }

  /**
   * Harmony Exchange Feed
   */
  getHarmonyFeed(avatarId) {
    if (avatarId) {
      return this.harmonyFeed.filter(e => e.avatarId === avatarId);
    }
    return this.harmonyFeed;
  }

  postToHarmonyFeed(entry) {
    const newEntry = {
      id: `jam_${Date.now().toString(36)}`,
      name: entry.name || 'Untitled 432Hz Jam',
      avatarId: entry.avatarId || 'lotus-nexus',
      creator: entry.creator || 'FluidmotionTV_User',
      bpm: entry.bpm || 112,
      vibe: entry.vibe || 'harmonic',
      tracksCount: entry.tracksCount || 1,
      code: entry.code || `D9-JAM-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString()
    };
    this.harmonyFeed.unshift(newEntry);
    return newEntry;
  }

  getConstellationStatus() {
    const lotus = this.avatars.get('lotus-nexus');
    const state = this.dynamicStates.get('lotus-nexus');
    return {
      networkTitle: 'FluidmotionTV Constellation Sovereign Flow Network',
      gatewayNode: 'NODE-GATEWAY-LOTUS-ALPHA',
      syncPercentage: state?.triadSyncPercent || 94,
      resonanceVibe: state?.vibe === 'harmonic' ? 'ACTIVE (Harmonic Dawn)' : 'ACTIVE (Void Resonance)',
      triads: lotus?.networkGateway?.triads || [],
      connectedAvatarsCount: this.avatars.size,
      activePeers: 14,
      totalPointsHarvested: state?.contributionPoints || 120,
      vramPreservationEfficiency: '99.2% (2D SVG Vector Canvas vs 3D VRAM)'
    };
  }

  addListener(fn) {
    this.eventListeners.add(fn);
    return () => this.eventListeners.delete(fn);
  }

  emitEvent(event) {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Avatar Host event error:', err);
      }
    }
  }
}

// Global Avatar Host singleton instance
export const avatarHost = new SmartObjectAvatarHost();

// Standalone CLI execution
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('avatar-host.js')) {
  console.log('=== DRAGON 9 SMART OBJECT AVATAR HOSTING MODULE (2D/3D) ===');
  console.log(`Initialized with ${avatarHost.getAvatars().length} smart object avatars:`);
  avatarHost.getAvatars().forEach(a => {
    console.log(`- [${a.id}] ${a.name} (${a.category}) | Sprite: ${a.spriteAsset}`);
  });

  console.log('\n2D SVG Sprites registered:');
  avatarHost.get2DSprites().forEach(s => {
    console.log(`- ${s.id}: ${s.path} (${s.vramFootprint})`);
  });

  console.log('\nActive Avatar Events:');
  console.log(JSON.stringify(avatarHost.getAvatarEvents()[0], null, 2));
}
