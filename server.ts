/**
 * Dragon 9 Local Machine Backend Server
 * Connects Nutflox Cartoon Pipeline, Horizon Engine MIDI Framework,
 * FluidMotion Companion, and Express REST APIs with Vite integration.
 *
 * @license Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { orchestrator } from './orchestrator.js';
import { FLAGSHIP_MANIFESTS } from './cartoon-generator.js';
import { generate432HzTuningTable } from './horizon-midi.js';
import { avatarHost } from './avatar-host.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // API Routes
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      machine: 'dragon9',
      timestamp: new Date().toISOString()
    });
  });

  // System & Telemetry status
  app.get('/api/dragon9/status', (req, res) => {
    try {
      const status = orchestrator.getSystemStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Pre-packaged manifests from Dragon 9 Asset Architect
  app.get('/api/dragon9/manifests', (req, res) => {
    res.json({
      presets: [
        {
          key: 'superPuff',
          name: 'Super Puff - Episode 101',
          episodeTitle: 'The Cosmic Marshmallow Nebula',
          genreRecommendation: 'g-funk',
          cycle: 'CYCLE-03:BEAT-07',
          manifest: FLAGSHIP_MANIFESTS.superPuff
        },
        {
          key: 'peeDubSurfChronicles',
          name: 'Pee Dub Surf Chronicles - Episode 204',
          episodeTitle: 'Point Break at Tidal Nine',
          genreRecommendation: 'dub-reggae',
          cycle: 'CYCLE-06:BEAT-02',
          manifest: FLAGSHIP_MANIFESTS.peeDubSurfChronicles
        }
      ]
    });
  });

  // Validate & parse manifest
  app.post('/api/dragon9/manifests/validate', (req, res) => {
    try {
      const { manifest } = req.body;
      if (!manifest) {
        return res.status(400).json({ error: 'Missing manifest payload' });
      }
      const parsed = orchestrator.parseManifest(manifest);
      res.json({ valid: true, parsed });
    } catch (err: any) {
      res.status(400).json({ valid: false, error: err.message });
    }
  });

  // Assemble Cartoon Episode into FFmpeg Queue
  app.post('/api/dragon9/cartoons/assemble', async (req, res) => {
    try {
      const { manifestKey, customManifest, audioStems } = req.body;
      let manifest = customManifest;
      if (!manifest && manifestKey) {
        manifest = FLAGSHIP_MANIFESTS[manifestKey as keyof typeof FLAGSHIP_MANIFESTS];
      }
      if (!manifest) {
        manifest = FLAGSHIP_MANIFESTS.superPuff;
      }

      const result = await orchestrator.cartoonGenerator.assembleEpisode(manifest, audioStems || {});
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Render queue list
  app.get('/api/dragon9/render-queue', (req, res) => {
    try {
      const queue = orchestrator.getRenderQueue();
      res.json({ queue });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Simulate or trigger render progress
  app.post('/api/dragon9/render-queue/:jobId/simulate', (req, res) => {
    try {
      const { jobId } = req.params;
      const job = orchestrator.simulateRender(jobId);
      if (!job) {
        return res.status(404).json({ error: `Job ${jobId} not found` });
      }
      res.json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cancel render job
  app.post('/api/dragon9/render-queue/:jobId/cancel', (req, res) => {
    try {
      const { jobId } = req.params;
      const job = orchestrator.cancelJob(jobId);
      if (!job) {
        return res.status(404).json({ error: `Job ${jobId} not found` });
      }
      res.json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Procedural MIDI Generation (432Hz Harmonic Tuning)
  app.post('/api/dragon9/midi/generate', (req, res) => {
    try {
      const { genre = 'g-funk', bpm, bars } = req.body;
      const track = orchestrator.generateSoundtrack(genre, { bpm, bars });
      res.json({
        genre: track.genre,
        bpm: track.bpm,
        bars: track.bars,
        tuning: track.tuning,
        dragon9Sequencer: track.dragon9Sequencer,
        base64: track.base64,
        noteSummary: track.noteSummary
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Binary MIDI File Download (.mid)
  app.get('/api/dragon9/midi/download/:genre', (req, res) => {
    try {
      const { genre } = req.params;
      const bpm = req.query.bpm ? Number(req.query.bpm) : undefined;
      const bars = req.query.bars ? Number(req.query.bars) : undefined;
      const track = orchestrator.horizonMidi.generateTrack(genre, { bpm, bars });

      res.setHeader('Content-Type', 'audio/midi');
      res.setHeader('Content-Disposition', `attachment; filename="dragon9_${genre}_432hz.mid"`);
      res.send(Buffer.from(track.binary));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 432Hz Harmonic Tuning Reference Table
  app.get('/api/dragon9/tuning/table', (req, res) => {
    try {
      const table = generate432HzTuningTable();
      res.json({
        standard: 'A=432Hz Verdi Universal',
        referenceA4Hz: 432.0,
        centOffset: -31.77,
        table
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Unified Media Factory Orchestration
  app.post('/api/dragon9/orchestrate', async (req, res) => {
    try {
      const { manifestPreset, customManifest, genre, bpm, simulateRender = true } = req.body;
      const result = await orchestrator.runUnifiedPipeline({
        manifestPreset,
        customManifest,
        genre,
        bpm,
        simulateRender
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // ElevenLabs Character Dialogue & Voice Asset Routes
  // ==========================================

  // List supported character voice profiles & ElevenLabs IDs
  app.get('/api/dragon9/elevenlabs/voices', (req, res) => {
    res.json({
      configured: Boolean(process.env.ELEVENLABS_API_KEY),
      provider: 'ElevenLabs Multilingual v2 / 432Hz Unified Pipeline',
      voices: [
        {
          id: '21m00Tcm4TlvDq8ikWAM',
          name: 'Rachel (Super Puff)',
          character: 'Super Puff',
          description: 'High-energy hero voice with bouncy harmonic cadence',
          recommendedSettings: { stability: 0.45, similarity_boost: 0.85, style: 0.65 }
        },
        {
          id: 'AZnzlk1XvdvUeBnXmlld',
          name: 'Domi (Mayor Fluffington)',
          character: 'Mayor Fluffington',
          description: 'Warm, theatrical, slightly frantic aristocratic voice',
          recommendedSettings: { stability: 0.70, similarity_boost: 0.75, style: 0.30 }
        },
        {
          id: 'TxGEqnHWrfWFTfGW9XjX',
          name: 'Josh (General Crisp)',
          character: 'General Crisp',
          description: 'Deep raspy cyborg warlord tone with gritty authority',
          recommendedSettings: { stability: 0.60, similarity_boost: 0.90, style: 0.75 }
        },
        {
          id: 'pNInz6obpgDQGcFmaJgB',
          name: 'Adam (Pee Dub)',
          character: 'Pee Dub',
          description: 'Relaxed chill surf-punk delivery with rhythmic flow',
          recommendedSettings: { stability: 0.50, similarity_boost: 0.80, style: 0.50 }
        },
        {
          id: 'ErXwobaYiN019PkySvjV',
          name: 'Antoni (Duke Kelp)',
          character: 'Duke Kelp',
          description: 'Smooth baritone deep-sea monarch',
          recommendedSettings: { stability: 0.65, similarity_boost: 0.85, style: 0.40 }
        },
        {
          id: 'cyber_dragon_clean_vocoder',
          name: 'Cyber Dragon Clean Vocoder',
          character: 'Cybernetic Dragon Guardian',
          description: 'Drone-free clean harmonic robotic baritone with 432Hz sync',
          recommendedSettings: { stability: 0.90, similarity_boost: 0.95, style: 0.20 }
        }
      ]
    });
  });

  // Synthesize single dialogue line via ElevenLabs
  app.post('/api/dragon9/elevenlabs/synthesize', async (req, res) => {
    try {
      const { voiceId = '21m00Tcm4TlvDq8ikWAM', text, modelId = 'eleven_multilingual_v2', voiceSettings } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Missing text for dialogue synthesis' });
      }

      const apiKey = process.env.ELEVENLABS_API_KEY;

      if (apiKey) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: voiceSettings || { stability: 0.55, similarity_boost: 0.85, style: 0.35 }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          return res.status(response.status).json({
            success: false,
            error: `ElevenLabs API error: ${errText}`,
            configured: true
          });
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        return res.json({
          success: true,
          audioDataUrl: `data:audio/mpeg;base64,${base64Audio}`,
          voiceId,
          text,
          provider: 'ElevenLabs Live'
        });
      }

      // If ELEVENLABS_API_KEY is not set, return metadata and simulated audio preview
      const wordCount = text.split(/\s+/).length;
      const estimatedDurationSec = Number((wordCount * 0.35 + 0.6).toFixed(2));

      return res.json({
        success: true,
        simulated: true,
        message: 'ELEVENLABS_API_KEY not configured in environment. Voice stem timing and parameters mapped for pipeline.',
        voiceId,
        text,
        estimatedDurationSec,
        provider: 'Dragon 9 Voice Synthesizer Fallback'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Batch map and prepare all dialogue stems for a manifest
  app.post('/api/dragon9/elevenlabs/batch-manifest', (req, res) => {
    try {
      const { manifestKey = 'superPuff', customManifest } = req.body;
      const manifest = customManifest || FLAGSHIP_MANIFESTS[manifestKey as keyof typeof FLAGSHIP_MANIFESTS] || FLAGSHIP_MANIFESTS.superPuff;
      const voiceStems = orchestrator.cartoonGenerator.renderQueue.mapVoiceStems(manifest);

      res.json({
        seriesTitle: manifest.seriesTitle,
        episodeTitle: manifest.episodeTitle,
        totalStems: voiceStems.length,
        voiceStems,
        ffmpegFilterSnippet: voiceStems.map((s, i) => `[${i + 2}:a]${s.adelayFilter}[dialogue_${i}]`).join('; ')
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mobile Container Orchestration Script ($HOME/dragon9/comedy_pipeline/assemble_show.sh)
  app.get('/api/dragon9/container/script', (req, res) => {
    try {
      const manifestKey = (req.query.manifest as string) || 'superPuff';
      const manifest = FLAGSHIP_MANIFESTS[manifestKey as keyof typeof FLAGSHIP_MANIFESTS] || FLAGSHIP_MANIFESTS.superPuff;
      const voiceStems = orchestrator.cartoonGenerator.renderQueue.mapVoiceStems(manifest);
      const script = orchestrator.cartoonGenerator.renderQueue.generateMobileContainerScript(manifest, {}, 'D9-CONTAINER-JOB', voiceStems);

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(script);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Download container bash script directly
  app.get('/api/dragon9/container/script/download', (req, res) => {
    try {
      const manifestKey = (req.query.manifest as string) || 'superPuff';
      const manifest = FLAGSHIP_MANIFESTS[manifestKey as keyof typeof FLAGSHIP_MANIFESTS] || FLAGSHIP_MANIFESTS.superPuff;
      const voiceStems = orchestrator.cartoonGenerator.renderQueue.mapVoiceStems(manifest);
      const script = orchestrator.cartoonGenerator.renderQueue.generateMobileContainerScript(manifest, {}, 'D9-CONTAINER-JOB', voiceStems);

      res.setHeader('Content-Type', 'application/x-sh');
      res.setHeader('Content-Disposition', 'attachment; filename="assemble_show.sh"');
      res.send(script);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Smart Object Avatar Hosting Routes (2D & 3D)
  // ==========================================

  // List all hosted smart object avatars with metadata & state
  app.get('/api/dragon9/avatars', (req, res) => {
    try {
      const avatars = avatarHost.getAvatars();
      res.json({
        avatars,
        count: avatars.length,
        vramPreservationStatus: 'Optimal (2D Vector Blit & WebGL Hybrid)',
        timestamp: Date.now()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get lightweight 2D SVG sprites
  app.get('/api/dragon9/avatars/sprites', (req, res) => {
    try {
      const sprites = avatarHost.get2DSprites();
      res.json({ sprites, count: sprites.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get JSON-based vector animation timelines
  app.get('/api/dragon9/avatars/animations', (req, res) => {
    try {
      const animations = avatarHost.getVectorAnimations();
      res.json({ animations });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // List scheduled & active avatar events
  app.get('/api/dragon9/avatars/events', (req, res) => {
    try {
      const episode_id = req.query.episode_id as string | undefined;
      const events = avatarHost.getAvatarEvents({ episode_id });
      res.json({ events });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger or schedule an avatar event (supports avatar_event schema)
  app.post('/api/dragon9/avatars/events', (req, res) => {
    try {
      const eventPayload = req.body;
      const triggered = avatarHost.triggerAvatarEvent(eventPayload);
      res.json({
        success: true,
        message: 'Avatar event queued for 2D transparent overlay render',
        event: triggered
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get single avatar details (metadata, 2D sprite specs, state)
  app.get('/api/dragon9/avatars/:id', (req, res) => {
    try {
      const { id } = req.params;
      const avatar = avatarHost.getAvatar(id);
      if (!avatar) {
        return res.status(404).json({ error: `Avatar ${id} not found` });
      }
      res.json(avatar);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update avatar state directly
  app.post('/api/dragon9/avatars/:id/state', (req, res) => {
    try {
      const { id } = req.params;
      const avatar = avatarHost.getAvatar(id);
      if (!avatar) {
        return res.status(404).json({ error: `Avatar ${id} not found` });
      }
      if (avatar.state) {
        Object.assign(avatar.state, req.body);
        avatar.state.lastInteractionTime = Date.now();
      }
      res.json({ success: true, updatedState: avatar.state });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Register or update avatar
  app.post('/api/dragon9/avatars', (req, res) => {
    try {
      const avatarData = req.body;
      const saved = avatarHost.registerAvatar(avatarData);
      res.json({ success: true, avatar: saved });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Low-latency avatar interaction (petal strikes, spins, tool change, vibe switch, etc.)
  app.post('/api/dragon9/avatars/:id/interact', (req, res) => {
    try {
      const { id } = req.params;
      const { action, params } = req.body;
      if (!action) {
        return res.status(400).json({ error: 'Missing interaction action' });
      }
      const outcome = avatarHost.interact(id, action, params || {});
      res.json(outcome);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Harmony Exchange Feed
  app.get('/api/dragon9/avatars/:id/feed', (req, res) => {
    try {
      const { id } = req.params;
      const feed = avatarHost.getHarmonyFeed(id);
      res.json({ feed });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Share jam to Harmony Exchange Feed
  app.post('/api/dragon9/avatars/:id/feed', (req, res) => {
    try {
      const { id } = req.params;
      const entry = { ...req.body, avatarId: id };
      const created = avatarHost.postToHarmonyFeed(entry);
      res.json({ success: true, entry: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // FluidmotionTV Constellation Network Status
  app.get('/api/dragon9/network/constellation', (req, res) => {
    try {
      const constellation = avatarHost.getConstellationStatus();
      res.json(constellation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // FluidmotionTV Triad Challenge Trigger
  app.post('/api/dragon9/network/triad-challenge', (req, res) => {
    try {
      const outcome = avatarHost.interact('lotus-nexus', 'startTriadChallenge', {});
      const constellation = avatarHost.getConstellationStatus();
      res.json({ success: true, outcome, constellation });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Vite Frontend Middleware
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DRAGON 9 LOCAL MEDIA FACTORY] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
