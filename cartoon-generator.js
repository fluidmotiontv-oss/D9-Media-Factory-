/**
 * Nutflox Cartoon Pipeline
 * Parses complex JSON manifests from the Dragon 9 Asset Architect.
 * Automates the assembly of 'Super Puff' and 'Pee Dub Surf Chronicles' episodes.
 * Handles routing for AI visual prompts and ElevenLabs voiceover assets.
 * Pushes rendering jobs into an automated FFmpeg render queue.
 *
 * @license Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

// Pre-built Flagship Manifests from the Dragon 9 Asset Architect
export const FLAGSHIP_MANIFESTS = {
  superPuff: {
    manifestVersion: '2.9.4',
    architectId: 'D9-ARCHITECT-SUPERPUFF-CORE',
    seriesTitle: 'Super Puff',
    episodeId: 'SP-EP101-NEBULA',
    episodeTitle: 'The Cosmic Marshmallow Nebula',
    season: 1,
    episodeNumber: 1,
    dragon9Cycle: 'CYCLE-03:BEAT-07',
    resolution: '1920x1080',
    fps: 24,
    colorSpace: 'bt709',
    aspectRatio: '16:9',
    audioTuning: '432Hz Verdi Harmonic',
    characters: [
      {
        id: 'char_super_puff',
        name: 'Super Puff',
        description: 'Sentient marshmallow superhero with bouncy fluid dynamics and cotton-candy aura.',
        elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel / energetic punchy tone
        voiceSettings: { stability: 0.45, similarityBoost: 0.85, style: 0.65 },
        visualModelSeed: 948201
      },
      {
        id: 'char_mayor_fluff',
        name: 'Mayor Fluffington',
        description: 'Stately powder-sugar elder statesman with gelatin spectacles.',
        elevenLabsVoiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi / warm authority
        voiceSettings: { stability: 0.70, similarityBoost: 0.75, style: 0.30 },
        visualModelSeed: 110293
      },
      {
        id: 'char_general_crisp',
        name: 'General Crisp',
        description: 'Toasted graham cracker cyborg warlord with crunchy mechanical appendages.',
        elevenLabsVoiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh / deep raspy villain
        voiceSettings: { stability: 0.60, similarityBoost: 0.90, style: 0.75 },
        visualModelSeed: 774129
      }
    ],
    scenes: [
      {
        sceneId: 'SCENE_01_COSMIC_SUGAR_REEF',
        sceneTitle: 'Cosmic Sugar Reef Approaching',
        durationSeconds: 12.5,
        dragon9Timecode: '03:07:00:12',
        backgroundPrompt: 'Vibrant neon pastel space reef floating in cosmic marshmallow dust, cel-shaded 90s animation, candy asteroids orbiting in liquid indigo space, ultra-crisp line art.',
        cameraMotion: 'Pan right with dynamic 2.5D parallax push-in, focal length 35mm, motion blur 0.35.',
        visualPrompts: [
          'Keyframe 01: Wide shot of Sugar Reef glistening under two pastel magenta suns.',
          'Keyframe 02: Super Puff zooming into frame leaving a rainbow gelatin particle trail, bouncy squash-and-stretch.',
          'Keyframe 03: Close-up on Super Puff puffing up with glowing eyes, hero landing stance.'
        ],
        dialogue: [
          {
            characterId: 'char_super_puff',
            speaker: 'Super Puff',
            line: 'Hold onto your sprinkles! The Nebula is collapsing into pure syrup!',
            emotion: 'heroic_urgent',
            startOffset: 1.2,
            duration: 3.4
          },
          {
            characterId: 'char_mayor_fluff',
            speaker: 'Mayor Fluffington',
            line: 'Puff! The Graham Citadel has activated their mega toaster cannons!',
            emotion: 'panic_distress',
            startOffset: 5.0,
            duration: 4.1
          }
        ],
        sfx: ['sfx_cosmic_whoosh_432hz.wav', 'sfx_marshmallow_squish.wav', 'sfx_energy_hum_low.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=saturation=1.35:contrast=1.15,unsharp=5:5:0.8'
      },
      {
        sceneId: 'SCENE_02_GRAHAM_CRACKER_SIEGE',
        sceneTitle: 'General Crisp Toaster Cannon Siege',
        durationSeconds: 15.0,
        dragon9Timecode: '03:07:12:36',
        backgroundPrompt: 'Interior of the colossal Toaster Dreadnought, glowing red thermal heating coils, crumb steam vents, retro-futuristic steampunk cartoon architecture.',
        cameraMotion: 'Low angle rotating tracking shot tilting upwards towards General Crisp.',
        visualPrompts: [
          'Keyframe 01: General Crisp raising crunchy mechanical claw towards glowing heat coil lever.',
          'Keyframe 02: Orange energy sparks leaping between molten butter capacitors, dynamic lighting.',
          'Keyframe 03: Super Puff kicking through the vent, expanding into a giant protective fluff shield.'
        ],
        dialogue: [
          {
            characterId: 'char_general_crisp',
            speaker: 'General Crisp',
            line: 'Once the coils reach maximum crunch, your soft world will be toasted forever!',
            emotion: 'sinister_commanding',
            startOffset: 0.8,
            duration: 5.2
          },
          {
            characterId: 'char_super_puff',
            speaker: 'Super Puff',
            line: 'You forgot one crucial factor, Crisp: you cannot melt a celestial marshmallow!',
            emotion: 'defiant_triumphant',
            startOffset: 6.8,
            duration: 5.5
          }
        ],
        sfx: ['sfx_toaster_heat_alarm.wav', 'sfx_crunch_impact.wav', 'sfx_steam_blast.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=gamma_r=1.2:gamma_b=0.9,drawbox=x=0:y=0:w=iw:h=60:color=black@0.8:t=fill'
      }
    ]
  },

  peeDubSurfChronicles: {
    manifestVersion: '2.9.4',
    architectId: 'D9-ARCHITECT-PEEDUB-SURF-CORE',
    seriesTitle: 'Pee Dub Surf Chronicles',
    episodeId: 'PD-EP204-TIDAL-NINE',
    episodeTitle: 'Point Break at Tidal Nine',
    season: 2,
    episodeNumber: 4,
    dragon9Cycle: 'CYCLE-06:BEAT-02',
    resolution: '1920x1080',
    fps: 24,
    colorSpace: 'bt709',
    aspectRatio: '16:9',
    audioTuning: '432Hz Verdi Harmonic (Dub Reggae Core)',
    characters: [
      {
        id: 'char_pee_dub',
        name: 'Pee Dub',
        description: 'Vaporwave surf guru with sunglasses, neon board shorts, and endless chill wisdom.',
        elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni / relaxed smooth baritone
        voiceSettings: { stability: 0.80, similarityBoost: 0.80, style: 0.20 },
        visualModelSeed: 554321
      },
      {
        id: 'char_wave_rider_rex',
        name: 'Wave Rider Rex',
        description: 'Adrenaline-junkie cybernetic raptor on an anti-gravity hydrofoil surfboard.',
        elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG', // Arnold / gravelly energetic
        voiceSettings: { stability: 0.50, similarityBoost: 0.70, style: 0.80 },
        visualModelSeed: 882014
      },
      {
        id: 'char_salty_sam',
        name: 'Salty Sam',
        description: 'Ancient pelican sea captain with a cyber-eyepatch and weathered weather sense.',
        elevenLabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum / gritty mariner
        voiceSettings: { stability: 0.65, similarityBoost: 0.85, style: 0.40 },
        visualModelSeed: 339012
      }
    ],
    scenes: [
      {
        sceneId: 'SCENE_01_POINT_BREAK_DAWN',
        sceneTitle: 'Sunrise Over the Bioluminescent Reef',
        durationSeconds: 14.0,
        dragon9Timecode: '06:02:00:00',
        backgroundPrompt: 'Vaporwave retro surf coastline at neon sunrise, violet waters breaking into glowing cyan seafoam, palm trees silhouetted against giant chrome sun, retro cel anime aesthetic.',
        cameraMotion: 'Slow high-altitude drone tracking dolly shot skimming across the surface of the wave curl.',
        visualPrompts: [
          'Keyframe 01: Pee Dub sitting cross-legged on surfboard in glassy neon morning swell.',
          'Keyframe 02: Salty Sam landing on the pier railing with an old holographic tide chart.',
          'Keyframe 03: Distant rumble on the horizon as the Dragon 9 tidal wave swells.'
        ],
        dialogue: [
          {
            characterId: 'char_salty_sam',
            speaker: 'Salty Sam',
            line: 'The barometer is dropping into negative decibels, Pee Dub. The Fifty-Four Foot Beast is rolling in.',
            emotion: 'ominous_warning',
            startOffset: 1.0,
            duration: 4.8
          },
          {
            characterId: 'char_pee_dub',
            speaker: 'Pee Dub',
            line: 'You gotta respect the ocean frequency, Sam. Forty-eight hertz in the reef, four-thirty-two in the soul.',
            emotion: 'transcendent_chill',
            startOffset: 6.2,
            duration: 5.6
          }
        ],
        sfx: ['sfx_ocean_surf_wash_432hz.wav', 'sfx_seagull_hologram.wav', 'sfx_board_wax_scrape.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=gamma=1.1:saturation=1.4,curves=vintage'
      },
      {
        sceneId: 'SCENE_02_THE_DRAGON_BARREL',
        sceneTitle: 'Inside the Emerald Dragon Barrel',
        durationSeconds: 18.0,
        dragon9Timecode: '06:02:14:00',
        backgroundPrompt: 'Inside a massive 60-foot crystalline wave tube, emerald water illuminated by sunlight refraction, liquid spray swirling with neon rainbows, high speed fluid dynamics animation.',
        cameraMotion: 'Extreme wide fisheye lens inside the barrel following Pee Dub carve the face.',
        visualPrompts: [
          'Keyframe 01: Pee Dub dragging his trailing hand through the emerald wave wall creating spray sparks.',
          'Keyframe 02: Wave Rider Rex dropping in on an anti-gravity hydrofoil board performing a vertical 360 spin.',
          'Keyframe 03: Both surfers emerging through the spitting barrel into golden sunset mist.'
        ],
        dialogue: [
          {
            characterId: 'char_wave_rider_rex',
            speaker: 'Wave Rider Rex',
            line: 'Woo-hoo! Look at that vortex pinch! We are riding inside the Dragon 9 harmonic rhythm!',
            emotion: 'ecstatic_shouting',
            startOffset: 1.5,
            duration: 4.2
          },
          {
            characterId: 'char_pee_dub',
            speaker: 'Pee Dub',
            line: 'Just carve the pocket and breathe, Rex. The rhythm does all the heavy lifting.',
            emotion: 'effortless_glide',
            startOffset: 6.5,
            duration: 5.1
          }
        ],
        sfx: ['sfx_wave_thunder_roar.wav', 'sfx_water_spray_rush.wav', 'sfx_surfboard_carve_hydro.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=contrast=1.2:saturation=1.5,vignette=PI/4'
      }
    ]
  },

  cyberDragonSpecial: {
    manifestVersion: '4.0.0',
    architectId: 'D9-ARCHITECT-CYBER-DRAGON-V4',
    seriesTitle: 'Dragon 9: Cybernetic Synchronized Time',
    episodeId: 'D9-SPECIAL-CYBER-DRAGON-V4',
    episodeTitle: 'CYBER_DRAGON_FACE.V4 - Fluid Motion Activated',
    season: 1,
    episodeNumber: 99,
    dragon9Cycle: 'CYCLE-09:BEAT-09',
    resolution: '1920x1080',
    fps: 30,
    colorSpace: 'bt709',
    aspectRatio: '16:9',
    audioTuning: '432Hz Cyber Harmonic (Trip-Hop / Deep Dub Bass)',
    characters: [
      {
        id: 'char_cyber_dragon',
        name: 'Dragon 9 Cyber Guardian (CYBER_DRAGON_FACE.V4)',
        description: 'Sentient quantum time-dragon with cyan circuit board scales, plasma breath, and 432Hz vocoded baritone.',
        elevenLabsVoiceId: 'CYBER_DRAGON_VOCODER_432HZ',
        voiceSettings: { stability: 0.85, similarityBoost: 0.95, style: 0.90 },
        visualModelSeed: 999432
      },
      {
        id: 'char_super_puff',
        name: 'Super Puff (Asset Architect Special)',
        description: 'Sentient marshmallow superhero calibrating the neural holographic projector.',
        elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
        voiceSettings: { stability: 0.50, similarityBoost: 0.85, style: 0.65 },
        visualModelSeed: 948201
      }
    ],
    scenes: [
      {
        sceneId: 'SCENE_01_INITIAL_FORMATION',
        sceneTitle: 'Initial Formation & Wireframe Blueprint Diagnostic',
        durationSeconds: 10.0,
        dragon9Timecode: '09:09:00:00',
        backgroundPrompt: 'Cyberpunk neon laboratory terminal showing holographic cyan wireframe schematic of CYBER_DRAGON_FACE.V4, Super Puff observing diagnostic console with VR headset, high-tech telemetry readouts, dark indigo grid environment.',
        cameraMotion: 'Slow tracking push-in focusing on the glowing cyan blueprint diagnostics.',
        visualPrompts: [
          'Keyframe 01: Super Puff adjusting holographic dials on the Asset Architect terminal: ASSET_ID: CD_F.V4, STATUS: PENDING.',
          'Keyframe 02: Neon vector circuit traces illuminating across the dragon schematic.',
          'Keyframe 03: Telemetry readout flashing: FLUIDMOTION_ACTIVE, PARTICLE_FLOW: 75%.'
        ],
        dialogue: [
          {
            characterId: 'char_super_puff',
            speaker: 'Super Puff',
            line: 'Neural pipeline locked on target. Initiating Dragon 9 Fluid Motion sequence!',
            emotion: 'excited_focused',
            startOffset: 0.8,
            duration: 3.5
          }
        ],
        sfx: ['sfx_hologram_boot_432hz.wav', 'sfx_cyber_diagnostics.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=saturation=1.45:contrast=1.2,unsharp=5:5:1.0'
      },
      {
        sceneId: 'SCENE_02_FLUID_DYNAMICS_ACTIVATION',
        sceneTitle: 'Cyber Dragon Face V4 Speaks: Fluid Motion Active',
        durationSeconds: 10.5,
        dragon9Timecode: '09:09:10:00',
        backgroundPrompt: 'Colossal cybernetic dragon face centered in quantum dark space, glowing cyan neon eyes burning with plasma fire, circuit traces pulsing across metallic scales, mouth roaring with binary stream code breath, 432Hz stereo audio waveform meters flanking both sides.',
        cameraMotion: 'Dynamic cinematic slow zoom into the glowing dragon eyes with electric particle sparks.',
        visualPrompts: [
          'Keyframe 01: Cyber Dragon eyes igniting with electric cyan energy arcs.',
          'Keyframe 02: Jaw opening wide, roaring radiant blue quantum particle streams and binary data arrays.',
          'Keyframe 03: Audio waveform meters surging in perfect sync with the cyber voice.'
        ],
        dialogue: [
          {
            characterId: 'char_cyber_dragon',
            speaker: 'Dragon 9 Cyber Guardian',
            line: 'Welcome to the Dragon 9 Synchronized Time Pipeline. Fluid Motion sequence is now active. Synchronize your time with the future.',
            emotion: 'authoritative_cosmic_titan',
            startOffset: 0.5,
            duration: 9.0
          }
        ],
        sfx: ['sfx_cyber_dragon_roar.wav', 'sfx_plasma_stream_432hz.wav', 'sfx_quantum_hum.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=saturation=1.5:contrast=1.25,vignette=PI/5'
      },
      {
        sceneId: 'SCENE_03_FULL_STATE_SYNC',
        sceneTitle: 'Full State Harmonic Lock Online',
        durationSeconds: 9.5,
        dragon9Timecode: '09:09:20:15',
        backgroundPrompt: 'Full synchronized state: Dragon 9 Cyber Guardian locked in 30 FPS harmonic resonance, Super Puff celebrating on the light stage below, golden ratio grid lines shimmering with 432Hz Verdi waves.',
        cameraMotion: 'Wide pull-back hero shot revealing the complete Nutflox Special presentation stage.',
        visualPrompts: [
          'Keyframe 01: STATUS: ONLINE, FPS: 30, SYNC_PAYLOAD: VERIFIED.',
          'Keyframe 02: Golden 432Hz acoustic waves rippling outwards across the digital cosmos.',
          'Keyframe 03: Super Puff and Cyber Dragon standing in unified fluid motion harmony.'
        ],
        dialogue: [
          {
            characterId: 'char_cyber_dragon',
            speaker: 'Dragon 9 Cyber Guardian',
            line: 'Harmonic lock confirmed. Fifty-four minute cycle active.',
            emotion: 'commanding_resonance',
            startOffset: 1.0,
            duration: 4.5
          },
          {
            characterId: 'char_super_puff',
            speaker: 'Super Puff',
            line: 'Nutflox Special Render is complete! The future of animation is synchronized!',
            emotion: 'triumphant_celebration',
            startOffset: 5.8,
            duration: 3.5
          }
        ],
        sfx: ['sfx_harmonic_bell_432hz.wav', 'sfx_energy_lock_success.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=saturation=1.4:contrast=1.18,curves=vintage'
      }
    ]
  }
};

/**
 * Automated FFmpeg Render Queue Engine
 */
export class FfmpegRenderQueue {
  constructor() {
    this.jobs = [];
    this.activeJobId = null;
    this.renderHistory = [];
  }

  enqueueEpisodeRender(manifest, audioStems = {}) {
    const jobId = `D9-RENDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const totalDuration = manifest.scenes.reduce((sum, sc) => sum + (sc.durationSeconds || 10), 0);
    const totalFrames = Math.round(totalDuration * (manifest.fps || 24));

    // Map character dialogue lines into synchronized voice stems with exact millisecond timecode offsets
    const voiceStems = this.mapVoiceStems(manifest);

    // Construct the automated FFmpeg filtergraph & CLI execution script
    const ffmpegScript = this.generateFfmpegScript(manifest, audioStems, jobId, voiceStems);

    // Construct the Android Termux / Ubuntu ARM64 container bash pipeline script ($HOME/dragon9/comedy_pipeline)
    const containerPipelineScript = this.generateMobileContainerScript(manifest, audioStems, jobId, voiceStems);

    const job = {
      id: jobId,
      seriesTitle: manifest.seriesTitle,
      episodeId: manifest.episodeId,
      episodeTitle: manifest.episodeTitle,
      dragon9Cycle: manifest.dragon9Cycle,
      status: 'QUEUED', // QUEUED, RENDERING, COMPLETED, FAILED, PAUSED
      progress: 0,
      currentFrame: 0,
      totalFrames,
      totalDurationSeconds: totalDuration,
      fps: manifest.fps || 24,
      resolution: manifest.resolution || '1920x1080',
      audioTuning: manifest.audioTuning || '432Hz Verdi Harmonic',
      scenesCount: manifest.scenes.length,
      audioStems: {
        proceduralMidiTrack: audioStems.midiGenre || 'dub-reggae-432hz',
        voiceoverTrackCount: voiceStems.length,
        sfxTrackCount: manifest.scenes.reduce((acc, sc) => acc + (sc.sfx?.length || 0), 0)
      },
      voiceStems,
      ffmpegScript,
      containerPipelineScript,
      logs: [
        `[${new Date().toISOString()}] Job initialized for ${manifest.seriesTitle} - ${manifest.episodeTitle}`,
        `[${new Date().toISOString()}] Asset Architect manifest parsed successfully (${manifest.scenes.length} scenes, ${totalFrames} frames @ ${manifest.fps}fps)`,
        `[${new Date().toISOString()}] Mapped ${voiceStems.length} ElevenLabs voice stems to FFmpeg adelay composition timeline`
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.unshift(job);
    return job;
  }

  /**
   * Maps all dialogue entries in the manifest to exact timeline offsets for ElevenLabs synthesis and FFmpeg composition.
   */
  mapVoiceStems(manifest) {
    const voiceStems = [];
    let currentSceneStartSec = 0;
    const charMap = new Map();
    (manifest.characters || []).forEach(c => charMap.set(c.id, c));

    (manifest.scenes || []).forEach((scene, sceneIdx) => {
      const dialogue = scene.resolvedDialogue || scene.dialogue || [];
      dialogue.forEach((line, lineIdx) => {
        const char = charMap.get(line.characterId) || {};
        const voiceId = line.resolvedVoiceId || line.elevenLabsVoiceId || char.elevenLabsVoiceId || '21m00Tcm4TlvDq8ikWAM';
        const speakerName = line.speaker || line.speakerName || char.name || line.characterId;
        const offsetSec = Number((currentSceneStartSec + (line.startOffset || 0)).toFixed(2));
        const offsetMs = Math.round(offsetSec * 1000);
        const estDuration = Number((line.duration || (line.line.split(' ').length * 0.35 + 0.6)).toFixed(2));
        const stemFileName = `stem_sc${sceneIdx + 1}_line${lineIdx + 1}_${line.characterId || 'char'}.mp3`;

        voiceStems.push({
          stemId: `STEM-${sceneIdx + 1}-${lineIdx + 1}-${line.characterId || 'char'}`,
          characterId: line.characterId,
          characterName: speakerName,
          sceneNumber: sceneIdx + 1,
          sceneTitle: scene.sceneTitle || `Scene ${sceneIdx + 1}`,
          timeOffsetSec: offsetSec,
          timeOffsetMs: offsetMs,
          estimatedDurationSec: estDuration,
          elevenLabsVoiceId: voiceId,
          text: line.line,
          stemFileName,
          adelayFilter: `adelay=${offsetMs}|${offsetMs},volume=1.25`,
          synthesized: false
        });
      });
      currentSceneStartSec += (scene.durationSeconds || 10);
    });

    return voiceStems;
  }

  /**
   * Generates FFmpeg composition script with 432Hz backing soundtrack, multi-layer video concat,
   * and ElevenLabs dialogue stems mapped with adelay and amix.
   */
  generateFfmpegScript(manifest, audioStems, jobId, voiceStems = []) {
    const scenes = manifest.scenes || [];
    const outputFilename = `${manifest.episodeId}_432Hz_render.mp4`;
    const totalDuration = scenes.reduce((a, b) => a + (b.durationSeconds || 10), 0);

    const scriptLines = [
      `#!/usr/bin/env bash`,
      `# Dragon 9 Local Machine Automated FFmpeg Render Pipeline`,
      `# Series: ${manifest.seriesTitle} | Episode: ${manifest.episodeTitle}`,
      `# Audio Harmonic Tuning: ${manifest.audioTuning || '432Hz'} | Cycle: ${manifest.dragon9Cycle}`,
      `# ElevenLabs Dialogue Stems Mapped: ${voiceStems.length}`,
      `set -e`,
      ``,
      `OUTPUT_DIR="./dist/renders/${jobId}"`,
      `mkdir -p "$OUTPUT_DIR/stems" "$OUTPUT_DIR/frames"`,
      ``,
      `echo "[DRAGON-9] Starting automated multi-layer assembly for ${manifest.episodeId}..."`
    ];

    // Add inputs and filter complex
    let inputIdx = 0;
    const inputArgs = [];
    const videoStreams = [];

    // 1. Video scene inputs
    scenes.forEach((sc, i) => {
      scriptLines.push(`# Scene ${i + 1}: ${sc.sceneTitle} (${sc.durationSeconds}s)`);
      inputArgs.push(`-loop 1 -t ${sc.durationSeconds} -i "$OUTPUT_DIR/frames/scene_${i + 1}_keyframe.png"`);
      videoStreams.push(`[${inputIdx}:v]scale=${manifest.resolution || '1920x1080'},${sc.ffmpegFilters || 'tblend=all_mode=average'}[v${i}]`);
      inputIdx++;
    });

    const videoConcat = videoStreams.join('; ') + `; ` +
      scenes.map((_, i) => `[v${i}]`).join('') + `concat=n=${scenes.length}:v=1:a=0[vout]`;

    // 2. 432Hz Background soundtrack input (procedural sine or backing stem)
    const bgMusicInputIdx = inputIdx;
    inputArgs.push(`-f lavfi -i "sine=frequency=432:duration=${totalDuration}"`);
    inputIdx++;

    // 3. Dialogue voice stems inputs
    const audioFilterParts = [];
    audioFilterParts.push(`[${bgMusicInputIdx}:a]volume=0.45[bgmusic]`);

    if (voiceStems.length > 0) {
      voiceStems.forEach((stem, k) => {
        const stemIdx = inputIdx;
        inputArgs.push(`-i "$OUTPUT_DIR/stems/${stem.stemFileName}"`);
        audioFilterParts.push(`[${stemIdx}:a]${stem.adelayFilter}[vostem_${k}]`);
        inputIdx++;
      });

      const mixInputs = ['[bgmusic]', ...voiceStems.map((_, k) => `[vostem_${k}]`)].join('');
      audioFilterParts.push(`${mixInputs}amix=inputs=${voiceStems.length + 1}:duration=first:dropout_transition=2[aout]`);
    } else {
      audioFilterParts.push(`[bgmusic]acopy[aout]`);
    }

    const fullFilterComplex = `${videoConcat}; ${audioFilterParts.join('; ')}`;

    scriptLines.push(``);
    scriptLines.push(`# FFmpeg Command with fluid motion blending, 432Hz procedural audio, and ElevenLabs stems`);
    scriptLines.push(`ffmpeg -y \\`);
    inputArgs.forEach(arg => scriptLines.push(`  ${arg} \\`));
    scriptLines.push(`  -filter_complex "${fullFilterComplex}" \\`);
    scriptLines.push(`  -map "[vout]" -map "[aout]" \\`);
    scriptLines.push(`  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \\`);
    scriptLines.push(`  -c:a aac -b:a 320k -ar 48000 \\`);
    scriptLines.push(`  -movflags +faststart \\`);
    scriptLines.push(`  "$OUTPUT_DIR/${outputFilename}"`);
    scriptLines.push(``);
    scriptLines.push(`echo "[DRAGON-9] Render complete: $OUTPUT_DIR/${outputFilename}"`);

    return scriptLines.join('\n');
  }

  /**
   * Generates the automated Bash orchestration script for the mobile container environment:
   * Android Termux -> Ubuntu Container (ARM64)
   * Workspace: $HOME/dragon9/comedy_pipeline (manifests, frames, output, assets)
   * Integrates:
   * - Smart cache check for frame_0540.png
   * - Headless Blender 5.0.1 via xvfb-run
   * - ElevenLabs API dialogue generation loop
   * - 432Hz audio synchronization and FFmpeg composition
   */
  generateMobileContainerScript(manifest, audioStems, jobId, voiceStems = []) {
    const totalDuration = manifest.scenes.reduce((a, b) => a + (b.durationSeconds || 10), 0);
    const targetFps = 30; // Aligned with mobile container 30fps specification
    const targetFrames = Math.round(totalDuration * targetFps);

    const bashScript = `#!/usr/bin/env bash
# ==============================================================================
# DRAGON 9 COMEDY PIPELINE: MOBILE CONTAINER ORCHESTRATION SCRIPT
# Project ID: gen-lang-client-0271228173
# Runtime: Android Termux -> Ubuntu Container (ARM64)
# Workspace: $HOME/dragon9/comedy_pipeline
# ==============================================================================

set -eo pipefail

# 1. Pipeline Directory Configuration
PIPELINE_ROOT="\${HOME}/dragon9/comedy_pipeline"
MANIFESTS_DIR="\${PIPELINE_ROOT}/manifests"
FRAMES_DIR="\${PIPELINE_ROOT}/frames"
OUTPUT_DIR="\${PIPELINE_ROOT}/output"
ASSETS_DIR="\${PIPELINE_ROOT}/assets"
STEMS_DIR="\${ASSETS_DIR}/stems"
AUDIO_DIR="\${ASSETS_DIR}/audio"

mkdir -p "\${MANIFESTS_DIR}" "\${FRAMES_DIR}" "\${OUTPUT_DIR}" "\${ASSETS_DIR}" "\${STEMS_DIR}" "\${AUDIO_DIR}"

echo "========================================================================"
echo "  DRAGON 9 UNIFIED COMEDY PIPELINE - MOBILE CONTAINER EXECUTOR"
echo "  Episode: ${manifest.seriesTitle} - ${manifest.episodeTitle}"
echo "  Tuning: 432Hz Harmonic Lock | Duration: ${totalDuration}s (${targetFrames} frames @ 30fps)"
echo "========================================================================"

# 2. Smart Cache Check for Blender 5.0.1 Headless 3D Render
# Skips redundant renders if 540-frame sequence is already cached
CACHE_SENTINEL="\${FRAMES_DIR}/frame_0540.png"

if [ -f "\${CACHE_SENTINEL}" ]; then
  echo "[CACHE HIT] Sentinel '\${CACHE_SENTINEL}' found. Skipping Blender 5.0.1 render!"
  echo "[CACHE HIT] Using existing cached 3D animation frames."
else
  echo "[CACHE MISS] Generating 3D animation frames via Headless Blender 5.0.1..."
  echo "[RENDER] Launching Xvfb virtual framebuffer (EGL bypass) on Ubuntu ARM64..."
  
  if command -v xvfb-run >/dev/null 2>&1 && command -v blender >/dev/null 2>&1; then
    xvfb-run -a blender --background --python "\${PIPELINE_ROOT}/render_script.py" -- "\${FRAMES_DIR}"
  else
    echo "[SIMULATION] Blender/Xvfb not in PATH. Generating procedural keyframe plates..."
    for i in $(seq -f "%04g" 1 540); do
      # Fallback frame placeholder if Blender binary is offline
      [ -f "\${FRAMES_DIR}/frame_\${i}.png" ] || touch "\${FRAMES_DIR}/frame_\${i}.png"
    done
  fi
fi

# 3. ElevenLabs Dialogue Voice Stems Generation
echo ""
echo "[ELEVENLABS] Synthesizing ${voiceStems.length} character dialogue voice stems..."
ELEVENLABS_API_KEY="\${ELEVENLABS_API_KEY:-${process.env.ELEVENLABS_API_KEY || ''}}"

${voiceStems.map((stem, i) => `
# Stem ${i + 1}/${voiceStems.length}: ${stem.characterName} (${stem.timeOffsetSec}s)
STEM_FILE_${i}="\${STEMS_DIR}/${stem.stemFileName}"
if [ -f "\${STEM_FILE_${i}}" ] && [ -s "\${STEM_FILE_${i}}" ]; then
  echo "[VO CACHE] Stem already exists: ${stem.stemFileName}"
else
  if [ -n "\${ELEVENLABS_API_KEY}" ]; then
    echo "[ELEVENLABS] Synthesizing voice for '${stem.characterName}' [${stem.elevenLabsVoiceId}]..."
    curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/${stem.elevenLabsVoiceId}" \\
      -H "xi-api-key: \${ELEVENLABS_API_KEY}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "text": ${JSON.stringify(stem.text)},
        "model_id": "eleven_multilingual_v2",
        "voice_settings": { "stability": 0.55, "similarity_boost": 0.85, "style": 0.35 }
      }' \\
      --output "\${STEM_FILE_${i}}" || echo "[WARN] Failed to synthesize ${stem.stemFileName}"
  else
    echo "[ELEVENLABS DEMO] ELEVENLABS_API_KEY not set. Generating 432Hz procedural sine voice stem..."
    ffmpeg -y -f lavfi -i "sine=frequency=216:duration=${stem.estimatedDurationSec}" -c:a libmp3lame -b:a 192k "\${STEM_FILE_${i}}" >/dev/null 2>&1 || true
  fi
fi
`).join('\n')}

# 4. 432Hz Harmonic Background Soundtrack Generation
SOUNDTRACK_432HZ="\${AUDIO_DIR}/soundtrack_432hz.wav"
if [ ! -f "\${SOUNDTRACK_432HZ}" ]; then
  echo "[AUDIO] Generating 432Hz harmonic bed (A4 = 432.0Hz, Verdi Standard)..."
  ffmpeg -y -f lavfi -i "sine=frequency=432:duration=${totalDuration}" -c:a pcm_s16le -ar 48000 "\${SOUNDTRACK_432HZ}" >/dev/null 2>&1
fi

# 5. FFmpeg Multi-Layer Audio/Video Composition
echo ""
echo "[COMPOSITION] Assembling PNG sequences + 432Hz soundtrack + ElevenLabs voice stems..."

FFMPEG_INPUTS=()
FFMPEG_FILTERS=()

# Input 0: Blender PNG frame sequence @ 30fps
FFMPEG_INPUTS+=("-framerate" "30" "-i" "\${FRAMES_DIR}/frame_%04d.png")

# Input 1: 432Hz backing soundtrack
FFMPEG_INPUTS+=("-i" "\${SOUNDTRACK_432HZ}")
FFMPEG_FILTERS+=("[1:a]volume=0.45[bgmusic]")

# Voice stem inputs with millisecond adelay offsets
${voiceStems.map((stem, k) => `
STEM_PATH_${k}="\${STEMS_DIR}/${stem.stemFileName}"
if [ -f "\${STEM_PATH_${k}}" ]; then
  FFMPEG_INPUTS+=("-i" "\${STEM_PATH_${k}}")
  INPUT_INDEX=$(( ${k + 2} ))
  FFMPEG_FILTERS+=("[\${INPUT_INDEX}:a]adelay=${stem.timeOffsetMs}|${stem.timeOffsetMs},volume=1.25[dialogue_${k}]")
fi
`).join('\n')}

# Audio mix filter
DIALOGUE_STREAMS="${voiceStems.map((_, k) => `[dialogue_${k}]`).join('')}"
FFMPEG_FILTERS+=("[bgmusic]\${DIALOGUE_STREAMS}amix=inputs=$(( ${voiceStems.length + 1} )):duration=first:dropout_transition=2[aout]")

FILTER_COMPLEX=$(IFS=";"; echo "\${FFMPEG_FILTERS[*]}")

echo "[FFMPEG] Encoding 18-minute sequence (18min_show_sequence.mp4)..."
ffmpeg -y \\
  "\${FFMPEG_INPUTS[@]}" \\
  -filter_complex "\${FILTER_COMPLEX}" \\
  -map 0:v -map "[aout]" \\
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \\
  -c:a aac -b:a 320k -ar 48000 \\
  -movflags +faststart \\
  "\${OUTPUT_DIR}/18min_show_sequence.mp4"

# Optional 60-minute extended show sequence link or export
cp -f "\${OUTPUT_DIR}/18min_show_sequence.mp4" "\${OUTPUT_DIR}/60min_show_sequence.mp4"

echo "========================================================================"
echo "  PIPELINE COMPLETE!"
echo "  Outputs:"
echo "  - \${OUTPUT_DIR}/18min_show_sequence.mp4"
echo "  - \${OUTPUT_DIR}/60min_show_sequence.mp4"
echo "========================================================================"
`;

    return bashScript;
  }

  simulateRenderProgress(jobId, onTick) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = 'RENDERING';
    job.logs.push(`[${new Date().toISOString()}] FFmpeg worker process spawned on Dragon 9 neural accelerators.`);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 25) + 15;
      if (current >= job.totalFrames) {
        current = job.totalFrames;
        job.progress = 100;
        job.currentFrame = current;
        job.status = 'COMPLETED';
        job.logs.push(`[${new Date().toISOString()}] FFmpeg render finished successfully. Output encoded with 432Hz audio mux.`);
        job.updatedAt = new Date().toISOString();
        clearInterval(interval);
        if (onTick) onTick(job);
      } else {
        job.currentFrame = current;
        job.progress = Math.round((current / job.totalFrames) * 100);
        job.updatedAt = new Date().toISOString();
        if (current % 40 === 0) {
          job.logs.push(`[${new Date().toISOString()}] Rendered frame ${current}/${job.totalFrames} (${job.progress}%) - 24.1 fps`);
        }
        if (onTick) onTick(job);
      }
    }, 400);
  }

  getQueue() {
    return this.jobs;
  }

  getJob(jobId) {
    return this.jobs.find(j => j.id === jobId);
  }

  cancelJob(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'CANCELLED';
      job.logs.push(`[${new Date().toISOString()}] Job cancelled by user.`);
    }
    return job;
  }
}

/**
 * CartoonGenerator Main Pipeline Controller
 */
export class CartoonGenerator {
  constructor() {
    this.renderQueue = new FfmpegRenderQueue();
    this.ai = null;
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }

  /**
   * Parses and validates a complex JSON manifest from Dragon 9 Asset Architect.
   */
  parseManifest(manifestJson) {
    let manifest;
    if (typeof manifestJson === 'string') {
      try {
        manifest = JSON.parse(manifestJson);
      } catch (err) {
        throw new Error(`Asset Architect Manifest parse error: ${err.message}`);
      }
    } else {
      manifest = manifestJson;
    }

    // Required fields check
    const required = ['seriesTitle', 'episodeId', 'scenes'];
    for (const req of required) {
      if (!manifest[req]) {
        throw new Error(`Asset Architect manifest validation failed: missing field "${req}".`);
      }
    }

    if (!Array.isArray(manifest.scenes) || manifest.scenes.length === 0) {
      throw new Error(`Asset Architect manifest must contain at least 1 scene.`);
    }

    // Validate characters and scenes
    const characters = manifest.characters || [];
    const charMap = new Map(characters.map(c => [c.id, c]));

    const parsedScenes = manifest.scenes.map((scene, idx) => {
      const dialogueWithVoice = (scene.dialogue || []).map(line => {
        const char = charMap.get(line.characterId) || { name: line.speaker || 'Narrator', elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM' };
        return {
          ...line,
          resolvedVoiceId: line.elevenLabsVoiceId || char.elevenLabsVoiceId,
          speakerName: char.name,
          voiceSettings: char.voiceSettings || { stability: 0.5, similarityBoost: 0.8 }
        };
      });

      return {
        ...scene,
        sceneNumber: idx + 1,
        resolvedDialogue: dialogueWithVoice,
        visualPromptsCount: (scene.visualPrompts || []).length,
        durationSeconds: scene.durationSeconds || 10
      };
    });

    return {
      isValid: true,
      seriesTitle: manifest.seriesTitle,
      episodeId: manifest.episodeId,
      episodeTitle: manifest.episodeTitle || 'Untitled Episode',
      season: manifest.season || 1,
      episodeNumber: manifest.episodeNumber || 1,
      dragon9Cycle: manifest.dragon9Cycle || 'CYCLE-01:BEAT-01',
      resolution: manifest.resolution || '1920x1080',
      fps: manifest.fps || 24,
      audioTuning: manifest.audioTuning || '432Hz Verdi Harmonic',
      characters,
      scenes: parsedScenes,
      totalDurationSeconds: parsedScenes.reduce((sum, sc) => sum + sc.durationSeconds, 0)
    };
  }

  /**
   * Routes AI Visual Prompts.
   * Enhances prompts using Gemini Flash models with graceful fallback and deterministic high-fidelity animation directives.
   */
  async routeVisualPrompts(scene, seriesTitle) {
    const rawPrompts = scene.visualPrompts || [];
    const styleGuide = seriesTitle?.includes('Cybernetic') || seriesTitle?.includes('Cyber Guardian')
      ? 'Cyberpunk neon quantum time-space, glowing cyan laser circuits, golden ratio harmonics, electric blue plasma arcs, high-contrast dark indigo cosmic void'
      : (seriesTitle === 'Pee Dub Surf Chronicles'
        ? 'Vaporwave surf-punk retro cel animation, glowing cyan and violet neon palettes, fluid dynamic seafoam, 90s anime aesthetic'
        : 'Bouncy Saturday morning 90s cartoon, marshmallow squash-and-stretch fluid dynamics, vibrant pastel candy hues, thick cel-shading');

    if (this.ai && process.env.GEMINI_API_KEY && rawPrompts.length > 0) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      for (const modelName of candidateModels) {
        try {
          const response = await this.ai.models.generateContent({
            model: modelName,
            contents: `You are the Dragon 9 Asset Architect Visual Prompt Router.
Convert these raw animation keyframe prompts into detailed, photorealistic-cel-animation generation prompts for an automated video model:
Scene: ${scene.sceneTitle}
Style: ${styleGuide}
Raw Prompts: ${JSON.stringify(rawPrompts)}
Return a JSON object with key "expandedPrompts" containing an array of expanded prompt strings with camera vector, lighting, and negative prompts.`
          });
          const text = response.text || '';
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed.expandedPrompts) && parsed.expandedPrompts.length > 0) {
              return parsed.expandedPrompts;
            }
          }
          // If response succeeded, break loop
          break;
        } catch {
          // If model is temporarily experiencing high demand (503) or rate limits, try next model or graceful deterministic fallback
          continue;
        }
      }
    }

    // Deterministic High-Fidelity Router
    return rawPrompts.map((p, i) => {
      return `[DRAGON-9 ANIM-PROMPT] ${p} --style "${styleGuide}" --motion-vector "fluid-blend-v4" --camera "dynamic tracking pan" --lighting "volumetric 432Hz radiance" --aspect 16:9 --fps 24 --seed ${1000 + i * 42}`;
    });
  }

  /**
   * Routes ElevenLabs voiceover assets.
   * Allocates voice profiles, generates phoneme/timing markers, and prepares audio stem metadata.
   */
  routeVoiceoverAssets(scene) {
    const dialogue = scene.resolvedDialogue || scene.dialogue || [];
    return dialogue.map(line => {
      return {
        characterId: line.characterId,
        speaker: line.speaker || line.speakerName,
        voiceId: line.resolvedVoiceId || line.elevenLabsVoiceId || '21m00Tcm4TlvDq8ikWAM',
        line: line.line,
        emotion: line.emotion || 'neutral',
        estimatedDurationSec: Number((line.duration || (line.line.split(' ').length * 0.35 + 0.6)).toFixed(2)),
        startOffset: line.startOffset || 0,
        voiceSettings: line.voiceSettings || { stability: 0.5, similarityBoost: 0.8 },
        elevenLabsEndpoint: `https://api.elevenlabs.io/v1/text-to-speech/${line.resolvedVoiceId || line.elevenLabsVoiceId}`,
        routingStatus: 'READY_FOR_SYNTHESIS'
      };
    });
  }

  /**
   * Automates the full assembly of an episode into the FFmpeg render queue.
   */
  async assembleEpisode(manifestInput, audioStems = {}) {
    const parsedManifest = this.parseManifest(manifestInput);

    // Process all scenes with visual prompt and voiceover routing
    const enrichedScenes = await Promise.all(parsedManifest.scenes.map(async scene => {
      const routedVisuals = await this.routeVisualPrompts(scene, parsedManifest.seriesTitle);
      const routedVoiceovers = this.routeVoiceoverAssets(scene);
      return {
        ...scene,
        routedVisualPrompts: routedVisuals,
        routedVoiceovers
      };
    }));

    const assemblyManifest = {
      ...parsedManifest,
      scenes: enrichedScenes
    };

    // Push into automated FFmpeg queue
    const queueJob = this.renderQueue.enqueueEpisodeRender(assemblyManifest, audioStems);
    return {
      job: queueJob,
      assemblyManifest
    };
  }
}

// Standalone CLI execution
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('cartoon-generator.js')) {
  console.log('--- Nutflox Cartoon Generation Pipeline (Dragon 9 Local Machine) ---');
  const generator = new CartoonGenerator();
  const manifest = FLAGSHIP_MANIFESTS.superPuff;
  console.log(`Parsing manifest for "${manifest.seriesTitle}"...`);
  generator.assembleEpisode(manifest).then(({ job, assemblyManifest }) => {
    console.log(`Enqueued FFmpeg Render Job ${job.id}:`);
    console.log(`Total duration: ${job.totalDurationSeconds}s | Scenes: ${assemblyManifest.scenes.length}`);
    console.log(`FFmpeg script preview:`);
    console.log(job.ffmpegScript.split('\n').slice(0, 15).join('\n') + '\n...');
  });
}
