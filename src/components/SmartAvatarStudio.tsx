/**
 * Smart Object Avatar Hosting Studio & WebGL Canvas
 * Renders interactive 3D Smart Object Avatars including the Lotus Nexus
 * 3D Musical Fidget Spinner & Piano, Super Puff, and Pee Dub.
 * Integrates with the Dragon 9 backend, 432Hz Verdi tuning, and FluidmotionTV network.
 *
 * @license Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Play,
  RotateCw,
  Volume2,
  Sliders,
  Radio,
  Share2,
  Download,
  Upload,
  Globe,
  Award,
  Layers,
  Wand2,
  Activity,
  CheckCircle2,
  Music
} from 'lucide-react';
import { getMidiNoteFrequency432 } from '../utils/audioSynth';
import { SmartAvatarSummary, HarmonyFeedItem, ConstellationStatus } from '../types';

interface SmartAvatarStudioProps {
  onAvatarSelect?: (avatarId: string) => void;
}

interface LoopEvent {
  time: number; // 0 to 8s
  petalIndex: number;
  midiNote: number;
  freq: number;
}

interface LoopTrack {
  id: number;
  name: string;
  empty: boolean;
  muted: boolean;
  events: LoopEvent[];
}

const PETAL_NOTES = [
  { index: 0, midiNote: 60, noteName: 'C4', label: 'C4' },
  { index: 1, midiNote: 62, noteName: 'D4', label: 'D4' },
  { index: 2, midiNote: 64, noteName: 'E4', label: 'E4' },
  { index: 3, midiNote: 65, noteName: 'F4', label: 'F4' },
  { index: 4, midiNote: 67, noteName: 'G4', label: 'G4' },
  { index: 5, midiNote: 69, noteName: 'A4', label: 'A4' },
  { index: 6, midiNote: 71, noteName: 'B4', label: 'B4' },
  { index: 7, midiNote: 72, noteName: 'C5', label: 'C5' }
];

export function SmartAvatarStudio({ onAvatarSelect }: SmartAvatarStudioProps) {
  // Selected Avatar state
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('lotus-nexus');
  const [avatarSummaries, setAvatarSummaries] = useState<SmartAvatarSummary[]>([]);
  const [constellation, setConstellation] = useState<ConstellationStatus | null>(null);

  // Settings state
  const [aestheticVibe, setAestheticVibe] = useState<'harmonic' | 'void'>('harmonic');
  const [strikerTool, setStrikerTool] = useState<'finger' | 'wand' | 'drumstick'>('wand');
  const [synthModel, setSynthModel] = useState<'piano' | 'pad' | 'pluck'>('piano');
  const [petalShape, setPetalShape] = useState<'lotus' | 'round' | 'star'>('lotus');
  const [petalSpacing, setPetalSpacing] = useState<number>(100);
  const [showNoteLabels, setShowNoteLabels] = useState<boolean>(true);
  const [backingBeat, setBackingBeat] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [selectedNoteForEditor, setSelectedNoteForEditor] = useState<string>('G4');

  // Synth controls
  const [masterVol, setMasterVol] = useState<number>(75);
  const [filterCutoff, setFilterCutoff] = useState<number>(60);
  const [filterRes, setFilterRes] = useState<number>(40);
  const [envelopeAttack, setEnvelopeAttack] = useState<number>(10); // 0.1s
  const [envelopeDecay, setEnvelopeDecay] = useState<number>(150); // 1.5s
  const [delayFeedback, setDelayFeedback] = useState<number>(30);

  // 4-Track Loop Pedal state
  const [loopProgress, setLoopProgress] = useState<number>(0); // 0 to 8s
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isRecordingLoop, setIsRecordingLoop] = useState<boolean>(false);
  const [loopTracks, setLoopTracks] = useState<LoopTrack[]>([
    { id: 0, name: 'Track 1', empty: true, muted: false, events: [] },
    { id: 1, name: 'Track 2', empty: true, muted: false, events: [] },
    { id: 2, name: 'Track 3', empty: true, muted: false, events: [] },
    { id: 3, name: 'Track 4', empty: true, muted: false, events: [] }
  ]);

  // Harmony Exchange Feed
  const [feedItems, setFeedItems] = useState<HarmonyFeedItem[]>([]);
  const [saveJamName, setSaveJamName] = useState<string>('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Real-time Physics & Metrics
  const [spinSpeedRpm, setSpinSpeedRpm] = useState<number>(0);
  const [networkSync, setNetworkSync] = useState<number>(95);
  const [contributionPts, setContributionPts] = useState<number>(120);
  const [triadChallengeActive, setTriadChallengeActive] = useState<boolean>(false);
  const [lastStruckPetal, setLastStruckPetal] = useState<number | null>(null);

  // WebGL Canvas and Three.js references
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const spinnerGroupRef = useRef<THREE.Group | null>(null);
  const petalMeshesRef = useRef<THREE.Mesh[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopStartTimeRef = useRef<number>(Date.now());
  const recordingStartTimeRef = useRef<number>(0);

  // Physics simulation references
  const angularVelocityRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseSpeedRef = useRef<number>(0);
  const autoSpinSpeedRef = useRef<number>(0.02);

  // Audio nodes cache
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize Web Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const gain = ctx.createGain();
      gain.gain.value = masterVol / 100;
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = gain;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [masterVol]);

  // Update master volume node
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(masterVol / 100, audioCtxRef.current.currentTime, 0.05);
    }
  }, [masterVol]);

  // Play a 432Hz synthesized musical note
  const playSynthesizedNote = useCallback((midiNote: number, velocity: number = 0.8) => {
    try {
      const ctx = getAudioContext();
      if (!ctx || !masterGainRef.current) return;

      const freq = getMidiNoteFrequency432(midiNote);
      const now = ctx.currentTime;

      // Primary Oscillator
      const osc = ctx.createOscillator();
      if (synthModel === 'piano') {
        osc.type = 'sine';
      } else if (synthModel === 'pad') {
        osc.type = 'triangle';
      } else {
        osc.type = 'square';
      }
      osc.frequency.setValueAtTime(freq, now);

      // Lowpass Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const cutoffFreq = 200 + (filterCutoff / 100) * 8000;
      filter.frequency.setValueAtTime(cutoffFreq, now);
      filter.Q.setValueAtTime((filterRes / 100) * 15, now);

      // Gain Envelope (Attack / Decay)
      const noteGain = ctx.createGain();
      const attackSec = Math.max(0.01, envelopeAttack / 100);
      const decaySec = Math.max(0.1, envelopeDecay / 100);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(velocity * 0.9, now + attackSec);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + attackSec + decaySec);

      // Delay Node
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.28; // 432Hz rhythm delay
      const feedbackGain = ctx.createGain();
      feedbackGain.gain.value = (delayFeedback / 100) * 0.7;

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGainRef.current);

      if (delayFeedback > 5) {
        noteGain.connect(delay);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        delay.connect(masterGainRef.current);
      }

      osc.start(now);
      osc.stop(now + attackSec + decaySec + 0.5);
    } catch (err) {
      console.warn('Audio synthesis error:', err);
    }
  }, [getAudioContext, synthModel, filterCutoff, filterRes, envelopeAttack, envelopeDecay, delayFeedback]);

  // Handle striking a petal
  const handleStrikePetal = useCallback((petalIndex: number, velocity: number = 0.8) => {
    const noteInfo = PETAL_NOTES[petalIndex];
    if (!noteInfo) return;

    // Tool impulse multiplier
    let toolMultiplier = 1.0;
    if (strikerTool === 'wand') toolMultiplier = 1.6;
    if (strikerTool === 'drumstick') toolMultiplier = 2.2;

    const addedImpulse = (velocity * 0.08 * toolMultiplier);
    angularVelocityRef.current += addedImpulse;

    // Play synthesized sound in 432Hz
    playSynthesizedNote(noteInfo.midiNote, velocity);
    setLastStruckPetal(petalIndex);
    setSelectedNoteForEditor(noteInfo.label);

    // Contribution & sync
    setContributionPts(prev => prev + Math.round(velocity * 10 * toolMultiplier));
    setNetworkSync(prev => Math.min(100, prev + 0.5));

    // Flash visual petal
    if (petalMeshesRef.current[petalIndex]) {
      const mesh = petalMeshesRef.current[petalIndex];
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        mat.emissive.set(aestheticVibe === 'harmonic' ? 0x00e5ff : 0xa855f7);
        mat.emissiveIntensity = 2.0;
        setTimeout(() => {
          if (mat && mat.emissive) {
            mat.emissive.set(0x000000);
            mat.emissiveIntensity = 0.0;
          }
        }, 300);
      }
    }

    // Record into active loop track if recording
    if (isRecordingLoop) {
      const loopTime = ((Date.now() - recordingStartTimeRef.current) / 1000) % 8.0;
      setLoopTracks(prev => {
        const next = [...prev];
        const track = { ...next[activeTrackIndex] };
        track.empty = false;
        track.events = [
          ...track.events,
          {
            time: Number(loopTime.toFixed(2)),
            petalIndex,
            midiNote: noteInfo.midiNote,
            freq: getMidiNoteFrequency432(noteInfo.midiNote)
          }
        ];
        next[activeTrackIndex] = track;
        return next;
      });
    }

    // Low-latency reporting to Node.js backend
    fetch(`/api/dragon9/avatars/${selectedAvatarId}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'strikePetal',
        params: { petalIndex, velocity }
      })
    }).catch(() => {});
  }, [strikerTool, playSynthesizedNote, aestheticVibe, isRecordingLoop, activeTrackIndex, selectedAvatarId]);

  // Fetch hosted avatars and constellation info
  useEffect(() => {
    fetch('/api/dragon9/avatars')
      .then(r => r.json())
      .then(data => {
        if (data.avatars) setAvatarSummaries(data.avatars);
      })
      .catch(() => {});

    fetch('/api/dragon9/network/constellation')
      .then(r => r.json())
      .then(data => {
        setConstellation(data);
      })
      .catch(() => {});

    fetch(`/api/dragon9/avatars/${selectedAvatarId}/feed`)
      .then(r => r.json())
      .then(data => {
        if (data.feed) setFeedItems(data.feed);
      })
      .catch(() => {});
  }, [selectedAvatarId]);

  // 3D Three.js WebGL Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, -0.5, 7.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00e5ff, 2.5, 50);
    pointLight1.position.set(5, 5, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xd4af37, 2.2, 50);
    pointLight2.position.set(-5, -5, 6);
    scene.add(pointLight2);

    // Spinner Main Group
    const spinnerGroup = new THREE.Group();
    scene.add(spinnerGroup);
    spinnerGroupRef.current = spinnerGroup;

    // Build the 3D Procedural Lotus or Avatar Geometry
    buildAvatar3D(spinnerGroup);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Update angular physics
      if (autoSpin) {
        angularVelocityRef.current = THREE.MathUtils.lerp(
          angularVelocityRef.current,
          autoSpinSpeedRef.current,
          0.05
        );
      } else if (!isDraggingRef.current) {
        // Friction decay
        angularVelocityRef.current *= Math.pow(0.985, dt * 60);
        if (Math.abs(angularVelocityRef.current) < 0.0001) {
          angularVelocityRef.current = 0;
        }
      }

      currentAngleRef.current += angularVelocityRef.current;
      if (spinnerGroupRef.current) {
        spinnerGroupRef.current.rotation.z = currentAngleRef.current;
        // Subtle 3D floating wobble
        spinnerGroupRef.current.rotation.x = Math.sin(now * 0.001) * 0.08;
        spinnerGroupRef.current.rotation.y = Math.cos(now * 0.0012) * 0.06;
      }

      // Calculate RPM
      const currentRpm = Math.round(Math.abs((angularVelocityRef.current * 60) / (2 * Math.PI)) * 60);
      setSpinSpeedRpm(currentRpm);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [selectedAvatarId, petalShape, aestheticVibe, autoSpin]);

  // Procedural 3D Mesh Generator for Avatar
  const buildAvatar3D = (group: THREE.Group) => {
    // Clear existing children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }
    petalMeshesRef.current = [];

    const isHarmonic = aestheticVibe === 'harmonic';
    const primaryGlowHex = isHarmonic ? 0x00e5ff : 0xa855f7;
    const accentGoldHex = isHarmonic ? 0xd4af37 : 0x3b82f6;

    if (selectedAvatarId === 'lotus-nexus') {
      // 1. Center Jewel & Bearing
      const coreGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 32);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.9,
        roughness: 0.15,
        emissive: primaryGlowHex,
        emissiveIntensity: 0.25
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.x = Math.PI / 2;
      group.add(coreMesh);

      // Bearing ring
      const ringGeo = new THREE.TorusGeometry(0.58, 0.08, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: accentGoldHex,
        metalness: 0.95,
        roughness: 0.1
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      // Center Crystal Facet
      const jewelGeo = new THREE.OctahedronGeometry(0.32, 1);
      const jewelMat = new THREE.MeshStandardMaterial({
        color: primaryGlowHex,
        emissive: primaryGlowHex,
        emissiveIntensity: 0.6,
        roughness: 0.1
      });
      const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
      group.add(jewelMesh);

      // 2. Eight Petals (Musical Keys)
      const numPetals = 8;
      const spacingFactor = petalSpacing / 100;

      for (let i = 0; i < numPetals; i++) {
        const angle = (i / numPetals) * Math.PI * 2;
        const petalGroup = new THREE.Group();
        petalGroup.rotation.z = angle;

        // Create Petal Shape Geometry
        let petalGeo: THREE.BufferGeometry;
        if (petalShape === 'round') {
          petalGeo = new THREE.SphereGeometry(0.48, 24, 16);
          petalGeo.scale(1, 2.0, 0.45);
        } else if (petalShape === 'star') {
          petalGeo = new THREE.ConeGeometry(0.5, 2.2, 4);
          petalGeo.rotateZ(Math.PI);
        } else {
          // Standard pointed Lotus petal
          petalGeo = new THREE.ConeGeometry(0.52, 2.2, 16);
          petalGeo.scale(1, 1, 0.4);
          petalGeo.rotateZ(Math.PI);
        }

        const petalMat = new THREE.MeshStandardMaterial({
          color: (i % 2 === 0) ? 0x0f172a : 0x1e293b,
          metalness: 0.6,
          roughness: 0.25,
          wireframe: false
        });

        const petalMesh = new THREE.Mesh(petalGeo, petalMat);
        petalMesh.position.y = 1.4 * spacingFactor;
        petalGroup.add(petalMesh);

        // Petal tip gem
        const tipGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const tipMat = new THREE.MeshStandardMaterial({
          color: (i % 2 === 0) ? primaryGlowHex : accentGoldHex,
          emissive: (i % 2 === 0) ? primaryGlowHex : accentGoldHex,
          emissiveIntensity: 0.5
        });
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        tipMesh.position.y = 2.4 * spacingFactor;
        petalGroup.add(tipMesh);

        group.add(petalGroup);
        petalMeshesRef.current.push(petalMesh);
      }
    } else if (selectedAvatarId === 'super-puff') {
      // Super Puff 3D Marshmallow Mesh
      const puffGeo = new THREE.CylinderGeometry(1.2, 1.3, 1.8, 32);
      const puffMat = new THREE.MeshStandardMaterial({
        color: 0xfdf2f8,
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0xf472b6,
        emissiveIntensity: 0.2
      });
      const puffMesh = new THREE.Mesh(puffGeo, puffMat);
      group.add(puffMesh);

      // Hero mask / eyes
      const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.0
      });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.4, 0.3, 1.25);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.4, 0.3, 1.25);
      group.add(leftEye);
      group.add(rightEye);

      // Rainbow ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.6
      });
      const halo = new THREE.Mesh(ringGeo, ringMat);
      halo.rotation.x = Math.PI / 2;
      group.add(halo);
    } else if (selectedAvatarId === 'cyber-dragon' || selectedAvatarId === 'cyber_dragon') {
      // Cyber Dragon Quantum 3D Core & Circuit Torus Geometry
      const headGeo = new THREE.OctahedronGeometry(1.6, 2);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.95,
        roughness: 0.1,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.35,
        wireframe: false
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      group.add(headMesh);

      // Glowing Plasma Eyes
      const eyeGeo = new THREE.ConeGeometry(0.25, 0.6, 8);
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.0
      });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.5, 0.4, 1.2);
      leftEye.rotation.x = Math.PI / 2;
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.5, 0.4, 1.2);
      rightEye.rotation.x = Math.PI / 2;
      group.add(leftEye);
      group.add(rightEye);

      // Golden Circuit Ring
      const circuitRingGeo = new THREE.TorusGeometry(2.0, 0.08, 16, 64);
      const circuitRingMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xfacc15,
        emissiveIntensity: 0.5
      });
      const circuitRing = new THREE.Mesh(circuitRingGeo, circuitRingMat);
      circuitRing.rotation.x = Math.PI / 3;
      group.add(circuitRing);

      // Binary Stream Orbiting Shield
      const orbitGeo = new THREE.IcosahedronGeometry(2.4, 1);
      const orbitMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.2,
        wireframe: true
      });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      group.add(orbitMesh);
    } else {
      // Pee Dub Vaporwave Surfer Surfboard Mesh
      const boardGeo = new THREE.CylinderGeometry(0.5, 0.7, 4.0, 16);
      boardGeo.scale(0.8, 1.0, 0.2);
      const boardMat = new THREE.MeshStandardMaterial({
        color: 0x0e7490,
        metalness: 0.8,
        roughness: 0.1,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.3
      });
      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.rotation.z = Math.PI / 4;
      group.add(boardMesh);

      // Wave curl torus
      const waveGeo = new THREE.TorusGeometry(2.2, 0.3, 16, 64, Math.PI * 1.5);
      const waveMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveMesh.position.z = -0.5;
      group.add(waveMesh);
    }
  };

  // 4-Track Loop Playback Timer (8-second continuous cycle)
  useEffect(() => {
    const loopInterval = setInterval(() => {
      const elapsed = ((Date.now() - loopStartTimeRef.current) / 1000) % 8.0;
      setLoopProgress(elapsed);

      // Trigger events on active unmuted tracks
      loopTracks.forEach(track => {
        if (track.muted || track.empty) return;
        track.events.forEach(evt => {
          if (Math.abs(evt.time - elapsed) < 0.1) {
            playSynthesizedNote(evt.midiNote, 0.75);
          }
        });
      });
    }, 100);

    return () => clearInterval(loopInterval);
  }, [loopTracks, playSynthesizedNote]);

  // Backing Beat 112 BPM rhythm loop
  useEffect(() => {
    if (!backingBeat) return;
    const intervalMs = (60 / 112) * 1000;
    const timer = setInterval(() => {
      // Kick & Snare low-pass pop
      try {
        const ctx = getAudioContext();
        if (!ctx || !masterGainRef.current) return;
        const now = ctx.currentTime;
        const kick = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kick.frequency.setValueAtTime(108, now); // 432 / 4 = 108Hz harmonic sub
        kick.frequency.exponentialRampToValueAtTime(32, now + 0.15);
        kickGain.gain.setValueAtTime(0.7, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        kick.connect(kickGain);
        kickGain.connect(masterGainRef.current);
        kick.start(now);
        kick.stop(now + 0.2);
      } catch {}
    }, intervalMs);

    return () => clearInterval(timer);
  }, [backingBeat, getAudioContext]);

  // Mouse / Touch Drag to Spin and Strike Petals
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    mouseSpeedRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    mouseSpeedRef.current = dist;

    // Add angular torque based on horizontal drag
    const torque = (dx * 0.005);
    angularVelocityRef.current += torque;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Direct Click on Petal Keys
  const handlePetalClick = (index: number) => {
    handleStrikePetal(index, 0.9);
  };

  // Start Triad Challenge
  const handleStartTriadChallenge = async () => {
    setTriadChallengeActive(true);
    setNetworkSync(98);
    setContributionPts(prev => prev + 50);
    setNotificationMsg('Triad Challenge Engaged! 4 Constellation nodes synchronizing across FluidmotionTV network.');

    try {
      await fetch('/api/dragon9/network/triad-challenge', { method: 'POST' });
    } catch {}

    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Save current jam to Harmony Feed
  const handleSaveJam = async () => {
    const name = saveJamName.trim() || `Lotus Jam ${Date.now().toString(36)}`;
    try {
      const res = await fetch(`/api/dragon9/avatars/${selectedAvatarId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bpm: 112,
          vibe: aestheticVibe,
          tracksCount: loopTracks.filter(t => !t.empty).length || 1,
          code: `D9-JAM-${Math.floor(Math.random() * 90000 + 10000)}`
        })
      });
      const data = await res.json();
      if (data.entry) {
        setFeedItems(prev => [data.entry, ...prev]);
        setNotificationMsg(`Jam "${name}" published to Harmony Exchange Feed!`);
        setSaveJamName('');
        setTimeout(() => setNotificationMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Save jam error:', err);
    }
  };

  // Music Box Melodies Player
  const handlePlayMelody = (melody: string) => {
    if (melody === 'none') return;
    let sequence: { noteIdx: number; delayMs: number }[] = [];

    if (melody === 'harmonic') {
      sequence = [
        { noteIdx: 0, delayMs: 0 },
        { noteIdx: 2, delayMs: 300 },
        { noteIdx: 4, delayMs: 600 },
        { noteIdx: 5, delayMs: 900 },
        { noteIdx: 7, delayMs: 1200 }
      ];
    } else if (melody === 'joy') {
      sequence = [
        { noteIdx: 2, delayMs: 0 },
        { noteIdx: 2, delayMs: 250 },
        { noteIdx: 3, delayMs: 500 },
        { noteIdx: 4, delayMs: 750 },
        { noteIdx: 4, delayMs: 1000 },
        { noteIdx: 3, delayMs: 1250 },
        { noteIdx: 2, delayMs: 1500 },
        { noteIdx: 1, delayMs: 1750 }
      ];
    } else {
      // Cosmic Scale Run
      sequence = [0, 1, 2, 3, 4, 5, 6, 7].map((idx, i) => ({
        noteIdx: idx,
        delayMs: i * 180
      }));
    }

    sequence.forEach(step => {
      setTimeout(() => {
        handleStrikePetal(step.noteIdx, 0.85);
      }, step.delayMs);
    });
  };

  return (
    <div className="relative w-full h-[760px] bg-[#020617] text-white rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl select-none font-sans">
      {/* Fluid Dynamic Ambient Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden blur-[90px] opacity-40">
        <div
          className={`absolute w-[500px] h-[500px] rounded-full top-[-10%] left-[15%] transition-all duration-700 ${
            aestheticVibe === 'harmonic'
              ? 'bg-gradient-to-br from-cyan-400 to-blue-700'
              : 'bg-gradient-to-br from-purple-600 to-indigo-950'
          }`}
        />
        <div
          className={`absolute w-[450px] h-[450px] rounded-full bottom-[-10%] right-[10%] transition-all duration-700 ${
            aestheticVibe === 'harmonic'
              ? 'bg-gradient-to-br from-amber-400 to-fuchsia-600'
              : 'bg-gradient-to-br from-blue-500 to-zinc-950'
          }`}
        />
      </div>

      {/* Constellation SVG Map (Triads 1 - 4 behind WebGL Canvas) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
        viewBox="0 0 1000 700"
      >
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Triad 1 (Top Left) */}
        <polygon
          points="180,180 320,130 260,280"
          stroke="rgba(0, 229, 255, 0.4)"
          strokeWidth="1"
          fill="rgba(0, 229, 255, 0.03)"
          filter="url(#glow-cyan)"
        />
        <circle cx="180" cy="180" r="7" fill="#090d16" stroke="#00e5ff" strokeWidth="2" />
        <circle cx="320" cy="130" r="7" fill="#090d16" stroke="#00e5ff" strokeWidth="2" />
        <circle cx="260" cy="280" r="7" fill="#090d16" stroke="#00e5ff" strokeWidth="2" />

        {/* Triad 2 (Top Right) */}
        <polygon
          points="720,160 840,250 780,110"
          stroke="rgba(212, 175, 55, 0.4)"
          strokeWidth="1"
          fill="rgba(212, 175, 55, 0.03)"
          filter="url(#glow-gold)"
        />
        <circle cx="720" cy="160" r="7" fill="#090d16" stroke="#d4af37" strokeWidth="2" />
        <circle cx="840" cy="250" r="7" fill="#090d16" stroke="#d4af37" strokeWidth="2" />
        <circle cx="780" cy="110" r="7" fill="#090d16" stroke="#d4af37" strokeWidth="2" />

        {/* Triad 3 (Bottom Left) */}
        <polygon
          points="170,520 290,590 230,460"
          stroke="rgba(212, 175, 55, 0.4)"
          strokeWidth="1"
          fill="rgba(212, 175, 55, 0.03)"
          filter="url(#glow-gold)"
        />
        <circle cx="170" cy="520" r="7" fill="#090d16" stroke="#d4af37" strokeWidth="2" />
        <circle cx="290" cy="590" r="7" fill="#090d16" stroke="#d4af37" strokeWidth="2" />
        <circle cx="230" cy="460" r="7" fill="#090d16" stroke="#d4af37" strokeWidth="2" />

        {/* Triad 4 (Bottom Right) */}
        <polygon
          points="730,490 850,550 790,410"
          stroke="rgba(0, 229, 255, 0.4)"
          strokeWidth="1"
          fill="rgba(0, 229, 255, 0.03)"
          filter="url(#glow-cyan)"
        />
        <circle cx="730" cy="490" r="7" fill="#090d16" stroke="#00e5ff" strokeWidth="2" />
        <circle cx="850" cy="550" r="7" fill="#090d16" stroke="#00e5ff" strokeWidth="2" />
        <circle cx="790" cy="410" r="7" fill="#090d16" stroke="#00e5ff" strokeWidth="2" />
      </svg>

      {/* WebGL 3D Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-1 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Center Prompt & Instructions */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 space-y-1">
        <h3 className="font-serif tracking-[0.25em] text-lg sm:text-xl text-zinc-100/90 font-light drop-shadow-md">
          {selectedAvatarId === 'lotus-nexus'
            ? 'CLICK & SWIPE TO SPIN THE LOTUS'
            : selectedAvatarId === 'super-puff'
            ? 'SUPER PUFF SENTIENT HERO'
            : 'PEE DUB SURF CHRONICLES'}
        </h3>
        <p className="text-xs tracking-wider text-zinc-400 font-sans">
          Strike petals with your {strikerTool.toUpperCase()} to trigger 432Hz notes
        </p>
      </div>

      {/* Interactive Petal Ring Click Overlay (for direct touch / click triggers) */}
      {selectedAvatarId === 'lotus-nexus' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] pointer-events-none z-10 flex items-center justify-center">
          {PETAL_NOTES.map((note, i) => {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const radius = 110;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isStruck = lastStruckPetal === i;

            return (
              <button
                key={note.label}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handlePetalClick(i);
                }}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className={`absolute pointer-events-auto w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer shadow-lg ${
                  isStruck
                    ? 'bg-cyan-400 text-zinc-950 scale-125 ring-4 ring-cyan-300/60'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 hover:scale-110'
                }`}
              >
                <span>{note.label}</span>
                {showNoteLabels && (
                  <span className="text-[8px] opacity-70">
                    {Math.round(getMidiNoteFrequency432(note.midiNote))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-emerald-500/90 text-zinc-950 font-semibold text-xs rounded-xl shadow-xl backdrop-blur flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* UI Overlay Grid */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pointer-events-auto bg-zinc-950/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-zinc-400">
              ← SOVEREIGN FLOW
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-xs font-bold tracking-wider text-cyan-400 font-mono">
              FLUIDMOTION NETWORK
            </span>
          </div>

          {/* Avatar Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setSelectedAvatarId('lotus-nexus');
                if (onAvatarSelect) onAvatarSelect('lotus-nexus');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedAvatarId === 'lotus-nexus'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lotus Nexus 3D
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedAvatarId('super-puff');
                if (onAvatarSelect) onAvatarSelect('super-puff');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedAvatarId === 'super-puff'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Super Puff
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedAvatarId('pee-dub');
                if (onAvatarSelect) onAvatarSelect('pee-dub');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedAvatarId === 'pee-dub'
                  ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pee Dub Surfer
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-serif tracking-widest font-bold text-zinc-200">
              LOTUS <span className="text-cyan-400">NEXUS</span>
            </span>
            <span className="block text-[10px] font-mono text-zinc-500">
              432Hz SMART OBJECT AVATAR
            </span>
          </div>
        </header>

        {/* Main Sidebars Area */}
        <div className="flex-1 flex justify-between items-start gap-4 py-3 overflow-hidden">
          {/* Left Sidebar - Lotus Settings */}
          <aside className="w-64 max-h-[580px] overflow-y-auto pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 space-y-3.5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-1.5">
              <span className="font-mono uppercase font-bold text-amber-400 tracking-wider text-[11px]">
                Lotus Settings
              </span>
              <span className="text-[10px] font-mono text-zinc-500">v2.4.0</span>
            </div>

            {/* Aesthetic Vibe */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">
                Aesthetic Vibe
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAestheticVibe('harmonic')}
                  className={`py-1.5 px-2 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    aestheticVibe === 'harmonic'
                      ? 'bg-amber-400/20 border border-amber-400/80 text-amber-300 font-bold'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  Harmonic Dawn
                </button>
                <button
                  type="button"
                  onClick={() => setAestheticVibe('void')}
                  className={`py-1.5 px-2 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    aestheticVibe === 'void'
                      ? 'bg-purple-500/20 border border-purple-500/80 text-purple-300 font-bold'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  Void Resonance
                </button>
              </div>
            </div>

            {/* Striker Tool */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">
                Striker Tool
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['finger', 'wand', 'drumstick'] as const).map(tool => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setStrikerTool(tool)}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-mono capitalize transition-all cursor-pointer ${
                      strikerTool === tool
                        ? 'bg-cyan-400/20 border border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Music Box Tunes */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">
                Music Box Tunes
              </label>
              <select
                onChange={e => handlePlayMelody(e.target.value)}
                defaultValue="none"
                className="w-full bg-slate-900/90 border border-white/10 rounded-lg p-1.5 text-zinc-200 text-[11px] font-mono outline-none cursor-pointer"
              >
                <option value="none">-- Select Melody --</option>
                <option value="harmonic">Harmonic Sunrise</option>
                <option value="joy">Ode to Joy Pentatonic</option>
                <option value="cosmic">Cosmic Scale Run</option>
              </select>
            </div>

            {/* Synth Models */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">
                Synth Models
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setSynthModel('piano')}
                  className={`py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    synthModel === 'piano'
                      ? 'bg-cyan-500 text-zinc-950 font-bold'
                      : 'bg-white/5 border border-white/10 text-zinc-400'
                  }`}
                >
                  Piano
                </button>
                <button
                  type="button"
                  onClick={() => setSynthModel('pad')}
                  className={`py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    synthModel === 'pad'
                      ? 'bg-cyan-500 text-zinc-950 font-bold'
                      : 'bg-white/5 border border-white/10 text-zinc-400'
                  }`}
                >
                  Cosmic Pad
                </button>
                <button
                  type="button"
                  onClick={() => setSynthModel('pluck')}
                  className={`py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    synthModel === 'pluck'
                      ? 'bg-cyan-500 text-zinc-950 font-bold'
                      : 'bg-white/5 border border-white/10 text-zinc-400'
                  }`}
                >
                  Crystal Bell
                </button>
              </div>
            </div>

            {/* Petal Shape */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">
                Petal Shape
              </label>
              <select
                value={petalShape}
                onChange={e => setPetalShape(e.target.value as any)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-lg p-1.5 text-zinc-200 text-[11px] font-mono outline-none cursor-pointer"
              >
                <option value="lotus">Lotus (Pointed)</option>
                <option value="round">Rose (Rounded)</option>
                <option value="star">Crystal (Diamond)</option>
              </select>
            </div>

            {/* Petal Spacing */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>Petal Spacing</span>
                <span className="text-cyan-400 font-bold">{petalSpacing}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="185"
                value={petalSpacing}
                onChange={e => setPetalSpacing(Number(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowNoteLabels(!showNoteLabels)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono cursor-pointer hover:bg-white/10"
              >
                <span>Show Note Labels</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    showNoteLabels ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]' : 'bg-zinc-600'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setBackingBeat(!backingBeat)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono cursor-pointer hover:bg-white/10"
              >
                <span>Backing Beat (112 BPM)</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    backingBeat ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setAutoSpin(!autoSpin)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono cursor-pointer hover:bg-white/10"
              >
                <span>Auto-Spin Orbit</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    autoSpin ? 'bg-amber-400 shadow-[0_0_8px_#d4af37]' : 'bg-zinc-600'
                  }`}
                />
              </button>
            </div>

            {/* Petal Sampler Editor */}
            <div className="border-t border-white/10 pt-2 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 font-bold">
                <span>Petal Sampler Editor</span>
                <span className="text-amber-300">{selectedNoteForEditor}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                <label className="p-1.5 bg-white/5 border border-white/10 rounded text-center cursor-pointer hover:bg-white/10 block truncate">
                  <span>Load Sound</span>
                  <input type="file" accept="audio/*" className="hidden" />
                </label>
                <label className="p-1.5 bg-white/5 border border-white/10 rounded text-center cursor-pointer hover:bg-white/10 block truncate">
                  <span>Load Image</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            {/* Network Gateway Challenge */}
            <div className="border-t border-white/10 pt-2">
              <button
                type="button"
                onClick={handleStartTriadChallenge}
                className="w-full py-2 px-3 rounded-lg border border-amber-400 text-amber-300 font-mono font-bold text-[11px] hover:bg-amber-400/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Start Triad Challenge</span>
              </button>
            </div>
          </aside>

          {/* Right Sidebar - Synth & 4-Track Looper */}
          <aside className="w-72 max-h-[580px] overflow-y-auto pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 space-y-3.5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-cyan-400/20 pb-1.5">
              <span className="font-mono uppercase font-bold text-cyan-400 tracking-wider text-[11px]">
                Synth Controls
              </span>
              <span className="text-[10px] font-mono text-zinc-500">432Hz Core</span>
            </div>

            {/* Sliders: Vol, Cutoff, Res, Attack, Decay, Delay */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Master Volume</span>
                  <span className="text-cyan-300 font-bold">{masterVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVol}
                  onChange={e => setMasterVol(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Filter Cutoff</span>
                  <span className="text-cyan-300 font-bold">{filterCutoff}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={filterCutoff}
                  onChange={e => setFilterCutoff(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Filter Q (Resonance)</span>
                  <span className="text-cyan-300 font-bold">{filterRes}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterRes}
                  onChange={e => setFilterRes(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span>Attack</span>
                    <span>{(envelopeAttack / 100).toFixed(2)}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={envelopeAttack}
                    onChange={e => setEnvelopeAttack(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span>Decay</span>
                    <span>{(envelopeDecay / 100).toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="400"
                    value={envelopeDecay}
                    onChange={e => setEnvelopeDecay(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Delay Feedback</span>
                  <span className="text-cyan-300 font-bold">{delayFeedback}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={delayFeedback}
                  onChange={e => setDelayFeedback(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* 4-Track Loop Pedal */}
            <div className="border-t border-cyan-400/20 pt-2 space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="font-bold text-cyan-400">4-Track Loop Pedal</span>
                <span className="text-zinc-400 text-[10px]">
                  Progress: {loopProgress.toFixed(1)}s / 8s
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-75"
                  style={{ width: `${(loopProgress / 8.0) * 100}%` }}
                />
              </div>

              {/* Tracks 1 - 4 list */}
              <div className="space-y-1">
                {loopTracks.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-mono"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTrackIndex(t.id)}
                      className={`flex-1 text-left px-2 py-1 rounded cursor-pointer ${
                        activeTrackIndex === t.id
                          ? 'bg-cyan-500 text-zinc-950 font-bold'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {t.name} {t.empty ? '(Empty)' : `(${t.events.length} notes)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoopTracks(prev => {
                          const next = [...prev];
                          next[t.id].muted = !next[t.id].muted;
                          return next;
                        });
                      }}
                      className={`px-1.5 py-1 rounded cursor-pointer ${
                        t.muted ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Mute
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoopTracks(prev => {
                          const next = [...prev];
                          next[t.id].events = [];
                          next[t.id].empty = true;
                          return next;
                        });
                      }}
                      className="px-1.5 py-1 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>

              {/* Record & Clear Loop buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!isRecordingLoop) {
                      recordingStartTimeRef.current = Date.now();
                      setIsRecordingLoop(true);
                    } else {
                      setIsRecordingLoop(false);
                    }
                  }}
                  className={`py-2 px-2 rounded-lg font-mono font-bold text-[10px] transition-all cursor-pointer ${
                    isRecordingLoop
                      ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_#ef4444]'
                      : 'bg-white/5 border border-white/10 text-zinc-300 hover:border-red-400'
                  }`}
                >
                  {isRecordingLoop ? 'Stop Recording' : 'Record Loop'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoopTracks(prev =>
                      prev.map(t => ({ ...t, empty: true, events: [] }))
                    );
                  }}
                  className="py-2 px-2 rounded-lg font-mono font-bold text-[10px] bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Harmony Exchange Feed */}
            <div className="border-t border-white/10 pt-2 space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-cyan-400 block">
                Harmony Exchange Feed
              </label>

              <select
                className="w-full bg-slate-900/90 border border-white/10 rounded-lg p-1.5 text-zinc-200 text-[10px] font-mono outline-none cursor-pointer"
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'seed-sunrise') handlePlayMelody('harmonic');
                  if (val === 'seed-nebula') handlePlayMelody('joy');
                  if (val === 'seed-gateway') handlePlayMelody('cosmic');
                }}
              >
                <option value="none">-- Collective Song Feed --</option>
                {feedItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.bpm} BPM)
                  </option>
                ))}
              </select>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Save Jam Name..."
                  value={saveJamName}
                  onChange={e => setSaveJamName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded p-1.5 text-[10px] font-mono text-zinc-200 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveJam}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-[10px] font-mono rounded cursor-pointer"
                >
                  Save
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `D9-LOTUS-JAM-432HZ-${Date.now()}`
                    );
                    setNotificationMsg('Jam Code copied to clipboard!');
                    setTimeout(() => setNotificationMsg(null), 2500);
                  }}
                  className="p-1.5 rounded border border-amber-400/60 text-amber-300 hover:bg-amber-400/10 cursor-pointer text-center"
                >
                  Export Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationMsg('Jam Code imported into active Track 1.');
                    setTimeout(() => setNotificationMsg(null), 2500);
                  }}
                  className="p-1.5 rounded border border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10 cursor-pointer text-center"
                >
                  Import Code
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Metrics Bar */}
        <footer className="pointer-events-auto bg-slate-950/70 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">SPIN SPEED:</span>
            <span className="text-cyan-400 font-bold">{spinSpeedRpm} RPM</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">NETWORK SYNC:</span>
            <span className="text-emerald-400 font-bold">{networkSync.toFixed(1)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">CONTRIBUTION:</span>
            <span className="text-amber-400 font-bold">{contributionPts} Pts</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">RESONANCE VIBE:</span>
            <span className="text-cyan-300 font-bold">
              {aestheticVibe === 'harmonic' ? 'ACTIVE (Harmonic Dawn)' : 'ACTIVE (Void Resonance)'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
