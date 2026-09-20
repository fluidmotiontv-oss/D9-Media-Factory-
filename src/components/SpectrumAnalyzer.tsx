/**
 * D3.js Real-Time Spectrum Analyzer Component
 * Visualizes 432Hz Harmonic Audio Stems, FFT Frequency Distribution,
 * and Dragon 9 54-Minute Clock Synchronization.
 *
 * @license Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity, Radio, Sparkles, Volume2, Maximize2, Zap,
  Layers, Waves, Gauge, Eye, Disc
} from 'lucide-react';
import { Dragon9Clock } from '../types';
import { getMasterAnalyser, getAudioContext } from '../utils/audioSynth';

interface SpectrumAnalyzerProps {
  genre: 'g-funk' | 'dub-reggae' | 'trip-hop';
  bpm: number;
  clock?: Dragon9Clock | null;
  isPlaying: boolean;
  activeBar?: number;
}

// 432Hz Harmonic Frequency Series Markers
const HARMONIC_432_SERIES = [
  { freq: 27, label: '27 Hz (Sub/16)', stem: 'Infra-Bass', color: '#06b6d4' },
  { freq: 54, label: '54 Hz (D9 Oct/8)', stem: 'Low Sub Bass', color: '#10b981' },
  { freq: 108, label: '108 Hz (Sub/4)', stem: 'Kick / Roots', color: '#34d399' },
  { freq: 216, label: '216 Hz (Oct/2)', stem: 'Warmth / Body', color: '#fbbf24' },
  { freq: 432, label: '432.0 Hz [A4]', stem: 'Verdi Fundamental', color: '#f59e0b', isCenter: true },
  { freq: 864, label: '864 Hz (Oct x2)', stem: 'Lead / Chords', color: '#ec4899' },
  { freq: 1296, label: '1296 Hz (x3)', stem: 'Whistle Glide', color: '#a855f7' },
  { freq: 1728, label: '1728 Hz (Oct x4)', stem: 'High Presence', color: '#818cf8' },
  { freq: 3456, label: '3456 Hz (Oct x8)', stem: 'Air & Transients', color: '#38bdf8' }
];

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  genre,
  bpm,
  clock,
  isPlaying,
  activeBar = 0
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 300
  });

  // Display options
  const [viewMode, setViewMode] = useState<'curve' | 'bars' | 'dual'>('curve');
  const [scaleType, setScaleType] = useState<'log' | 'linear'>('log');
  const [showHarmonics, setShowHarmonics] = useState<boolean>(true);
  const [hoveredData, setHoveredData] = useState<{
    freq: number;
    magnitude: number;
    nearestNote: string;
    stem: string;
  } | null>(null);

  // Fallback / Clock pulse states
  const [internalClockTime, setInternalClockTime] = useState<number>(Date.now());
  const [currentPeakFreq, setCurrentPeakFreq] = useState<number>(432);
  const [rmsEnergy, setRmsEnergy] = useState<number>(0);

  // Peak hold array for spectrum bars
  const peakHoldRef = useRef<Float32Array>(new Float32Array(64));

  // Update container size dynamically via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.min(340, Math.max(240, Math.floor(width * 0.38)))
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute nearest note tuned to 432Hz
  const getNearest432Note = (freq: number): string => {
    if (freq <= 0) return '-';
    // MIDI note formula relative to A4 = 432Hz: n = 69 + 12 * log2(f / 432)
    const midi = 69 + 12 * Math.log2(freq / 432);
    const roundedMidi = Math.round(midi);
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[((roundedMidi % 12) + 12) % 12];
    const octave = Math.floor(roundedMidi / 12) - 1;
    const cents = Math.round((midi - roundedMidi) * 100);
    const centsStr = cents >= 0 ? `+${cents}` : `${cents}`;
    return `${noteName}${octave} (${centsStr}¢)`;
  };

  // Determine stem name based on frequency band
  const getStemForFrequency = (freq: number): string => {
    if (freq < 90) return 'Track 2: Sub Bass (54Hz)';
    if (freq < 280) return 'Track 1: Drums & Roots';
    if (freq < 750) return 'Track 3: Harmonic Chords / Skanks';
    if (freq < 2400) return 'Track 4: Signature Lead / Whistle';
    return 'Track 0: 432Hz Overtones & Air';
  };

  // Main D3 Rendering & Animation Engine
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    let animationId: number;
    const margin = { top: 24, right: 30, bottom: 40, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Defs: Gradients and Glow Filters
    const defs = svg.append('defs');

    // Gradient 1: Emerald to Cyan to Gold
    const spectrumGradient = defs.append('linearGradient')
      .attr('id', 'd9-spectrum-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    spectrumGradient.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4'); // Cyan sub
    spectrumGradient.append('stop').attr('offset', '35%').attr('stop-color', '#10b981'); // Emerald bass
    spectrumGradient.append('stop').attr('offset', '65%').attr('stop-color', '#fbbf24'); // Gold 432Hz
    spectrumGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ec4899'); // Pink lead

    // Gradient 2: Vertical Fill Fader
    const areaFillGradient = defs.append('linearGradient')
      .attr('id', 'd9-area-fill')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    areaFillGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.45);
    areaFillGradient.append('stop').attr('offset', '50%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.2);
    areaFillGradient.append('stop').attr('offset', '100%').attr('stop-color', '#090d16').attr('stop-opacity', 0.0);

    // Waveform Gradient
    const waveGrad = defs.append('linearGradient')
      .attr('id', 'd9-wave-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    waveGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    waveGrad.append('stop').attr('offset', '50%').attr('stop-color', '#a78bfa');
    waveGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f472b6');

    // Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'd9-glow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter().append('feMergeNode')
      .attr('in', d => d);

    // Main Graph Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid Background
    const minFreq = 20;
    const maxFreq = 6000;

    // X Scale: Logarithmic or Linear
    const xScale = scaleType === 'log'
      ? d3.scaleLog().domain([minFreq, maxFreq]).range([0, width]).clamp(true)
      : d3.scaleLinear().domain([minFreq, maxFreq]).range([0, width]).clamp(true);

    // Y Scale: Magnitude (0 to 255 byte value)
    const yScale = d3.scaleLinear().domain([0, 255]).range([height, 0]);

    // Draw Grid Lines
    const freqTicks = scaleType === 'log'
      ? [30, 54, 108, 216, 432, 864, 1296, 2000, 4000]
      : [100, 432, 1000, 2000, 3000, 4000, 5000];

    const xAxis = d3.axisBottom(xScale)
      .tickValues(freqTicks)
      .tickFormat(d => {
        const v = +d;
        return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;
      });

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${Math.round(((+d) / 255) * 100)}%`);

    // Add X Grid
    g.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickValues(freqTicks).tickSize(-height).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '2,3')
      .attr('stroke-opacity', 0.6);

    // Add Y Grid
    g.append('g')
      .attr('class', 'y-grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '2,3')
      .attr('stroke-opacity', 0.5);

    // Axis Elements
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis text-[10px] font-mono')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#3f3f46');
    xAxisGroup.selectAll('text').attr('fill', '#a1a1aa').attr('dy', '10px');

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis text-[10px] font-mono')
      .call(yAxis);

    yAxisGroup.select('.domain').attr('stroke', '#3f3f46');
    yAxisGroup.selectAll('text').attr('fill', '#71717a');

    // Frequency Label on X axis
    g.append('text')
      .attr('x', width)
      .attr('y', height + 32)
      .attr('text-anchor', 'end')
      .attr('class', 'fill-zinc-400 text-[10px] font-mono')
      .text('FREQUENCY (Hz) • LOG SCALE');

    // 432Hz Special Highlight Zone
    const centerFreqX = xScale(432);
    if (centerFreqX >= 0 && centerFreqX <= width) {
      g.append('rect')
        .attr('x', centerFreqX - 18)
        .attr('y', 0)
        .attr('width', 36)
        .attr('height', height)
        .attr('fill', '#f59e0b')
        .attr('fill-opacity', 0.07)
        .attr('pointer-events', 'none');
    }

    // Dynamic Spectrum Elements
    const areaPath = g.append('path')
      .attr('class', 'spectrum-area')
      .attr('fill', 'url(#d9-area-fill)')
      .attr('pointer-events', 'none');

    const linePath = g.append('path')
      .attr('class', 'spectrum-line')
      .attr('fill', 'none')
      .attr('stroke', 'url(#d9-spectrum-grad)')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#d9-glow)')
      .attr('pointer-events', 'none');

    // Waveform Path (for Dual Mode)
    const wavePath = g.append('path')
      .attr('class', 'waveform-line')
      .attr('fill', 'none')
      .attr('stroke', 'url(#d9-wave-grad)')
      .attr('stroke-width', 1.8)
      .attr('stroke-opacity', 0.75)
      .attr('pointer-events', 'none');

    // Spectrum Bars Group
    const barsGroup = g.append('g').attr('class', 'spectrum-bars');

    // Harmonic Lines Group
    const harmonicsGroup = g.append('g').attr('class', 'harmonic-markers');

    // Interactive Hover Crosshair Group
    const hoverGroup = g.append('g').attr('class', 'hover-cursor').style('display', 'none');
    const hoverLineX = hoverGroup.append('line')
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#00e5ff')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1.2);

    const hoverLineY = hoverGroup.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('stroke', '#00e5ff')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1.2);

    const hoverDot = hoverGroup.append('circle')
      .attr('r', 4.5)
      .attr('fill', '#00e5ff')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    // Transparent Overlay for Mouse Events
    const overlay = g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    // D3 Area & Line Generators
    const areaGenerator = d3.area<{ freq: number; val: number }>()
      .x(d => xScale(d.freq))
      .y0(height)
      .y1(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3.line<{ freq: number; val: number }>()
      .x(d => xScale(d.freq))
      .y(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    // Real-Time Animation Loop
    let sampleRate = 44100;
    try {
      const ctx = getAudioContext();
      if (ctx) sampleRate = ctx.sampleRate;
    } catch {}

    const numPoints = 120;
    const freqPoints = Array.from({ length: numPoints }, (_, i) => {
      // Logarithmic distribution of sample points across range
      const ratio = i / (numPoints - 1);
      const freq = minFreq * Math.pow(maxFreq / minFreq, ratio);
      return freq;
    });

    const numBarBins = 48;
    const barFreqs = Array.from({ length: numBarBins }, (_, i) => {
      const ratio = i / (numBarBins - 1);
      return minFreq * Math.pow(maxFreq / minFreq, ratio);
    });

    const renderLoop = () => {
      const now = performance.now();
      const timeSec = now / 1000;
      const analyser = getMasterAnalyser();

      let spectrumValues: { freq: number; val: number }[] = [];
      let barValues: { freq: number; val: number; color: string }[] = [];
      let waveformValues: [number, number][] = [];
      let peakFrequency = 432;
      let maxMagnitude = 0;
      let calculatedRms = 0;

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(freqData);

        const timeData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);

        const nyquist = sampleRate / 2;
        const binWidth = nyquist / bufferLength;

        // Check if there is actual active audio signal
        let totalEnergy = 0;
        for (let i = 0; i < bufferLength; i++) {
          totalEnergy += freqData[i];
        }
        const hasRealSignal = totalEnergy > 50;

        if (hasRealSignal) {
          // Compute curve points by mapping sampled frequencies to FFT bin
          spectrumValues = freqPoints.map(f => {
            const binIdx = Math.min(bufferLength - 1, Math.max(0, Math.round(f / binWidth)));
            const val = freqData[binIdx];
            if (val > maxMagnitude) {
              maxMagnitude = val;
              peakFrequency = f;
            }
            return { freq: f, val };
          });

          // Compute bar values
          barValues = barFreqs.map((f, i) => {
            const binIdx = Math.min(bufferLength - 1, Math.max(0, Math.round(f / binWidth)));
            const val = freqData[binIdx];

            // Update peak hold
            if (val > peakHoldRef.current[i]) {
              peakHoldRef.current[i] = val;
            } else {
              peakHoldRef.current[i] = Math.max(0, peakHoldRef.current[i] - 1.8);
            }

            let color = '#06b6d4';
            if (f > 80 && f < 300) color = '#10b981';
            else if (f >= 300 && f < 900) color = '#fbbf24';
            else if (f >= 900) color = '#ec4899';

            return { freq: f, val, color };
          });

          // Waveform data
          if (viewMode === 'dual') {
            waveformValues = [];
            const step = Math.max(1, Math.floor(bufferLength / width));
            for (let i = 0; i < width; i++) {
              const dataIdx = Math.min(bufferLength - 1, i * step);
              const v = (timeData[dataIdx] / 128.0) - 1.0;
              const y = (height / 2) + v * (height * 0.35);
              waveformValues.push([i, y]);
            }
          }

          calculatedRms = Math.min(100, Math.round((totalEnergy / (bufferLength * 255)) * 100 * 3));
        } else {
          // Synthetic ambient 432Hz harmonic resonance pulse when idle
          const pulse = Math.sin(timeSec * 4.32 * Math.PI) * 0.5 + 0.5;
          const tempoPulse = Math.sin(timeSec * (bpm / 60) * 2 * Math.PI) * 0.5 + 0.5;

          spectrumValues = freqPoints.map(f => {
            // Harmonics around 54, 108, 216, 432, 864
            let val = 12 + Math.sin(f * 0.05 + timeSec * 3) * 6;

            HARMONIC_432_SERIES.forEach(h => {
              const diff = Math.abs(f - h.freq);
              const bandwidth = h.freq * 0.12;
              if (diff < bandwidth) {
                const weight = 1 - (diff / bandwidth);
                const boost = h.isCenter ? (140 + pulse * 45) : (80 + tempoPulse * 30);
                val += weight * boost;
              }
            });

            val = Math.min(240, Math.max(8, val));
            if (val > maxMagnitude) {
              maxMagnitude = val;
              peakFrequency = f;
            }
            return { freq: f, val };
          });

          barValues = barFreqs.map((f, i) => {
            let val = 15;
            HARMONIC_432_SERIES.forEach(h => {
              const diff = Math.abs(f - h.freq);
              if (diff < h.freq * 0.15) {
                val += (1 - (diff / (h.freq * 0.15))) * (h.isCenter ? 160 : 90);
              }
            });
            val += Math.sin(i * 0.4 + timeSec * 2) * 8;
            val = Math.min(235, Math.max(10, val));
            peakHoldRef.current[i] = Math.max(val, peakHoldRef.current[i] - 1.2);

            let color = '#06b6d4';
            if (f > 80 && f < 300) color = '#10b981';
            else if (f >= 300 && f < 900) color = '#fbbf24';
            else if (f >= 900) color = '#ec4899';

            return { freq: f, val, color };
          });

          calculatedRms = isPlaying ? 65 : 18;
          peakFrequency = 432.0;
        }
      }

      setCurrentPeakFreq(Math.round(peakFrequency * 10) / 10);
      setRmsEnergy(calculatedRms);

      // 1. Render Curve Mode
      if (viewMode === 'curve' || viewMode === 'dual') {
        areaPath.datum(spectrumValues).attr('d', areaGenerator);
        linePath.datum(spectrumValues).attr('d', lineGenerator);
        barsGroup.selectAll('*').remove();
      } else {
        areaPath.attr('d', '');
        linePath.attr('d', '');
      }

      // 2. Render Waveform (Dual Mode)
      if (viewMode === 'dual' && waveformValues.length > 0) {
        const waveLineGen = d3.line<[number, number]>()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveLinear);
        wavePath.datum(waveformValues).attr('d', waveLineGen);
      } else {
        wavePath.attr('d', '');
      }

      // 3. Render Bars Mode
      if (viewMode === 'bars') {
        const barWidth = Math.max(3, (width / numBarBins) - 2);

        const bars = barsGroup.selectAll<SVGRectElement, { freq: number; val: number; color: string }>('rect.spectrum-bar')
          .data(barValues, d => d.freq);

        bars.enter()
          .append('rect')
          .attr('class', 'spectrum-bar')
          .attr('rx', 2)
          .merge(bars)
          .attr('x', d => xScale(d.freq) - barWidth / 2)
          .attr('y', d => yScale(d.val))
          .attr('width', barWidth)
          .attr('height', d => Math.max(0, height - yScale(d.val)))
          .attr('fill', d => d.color)
          .attr('fill-opacity', 0.85);

        bars.exit().remove();

        // Peak Hold Caps
        const peakCaps = barsGroup.selectAll<SVGRectElement, number>('rect.peak-cap')
          .data(Array.from(peakHoldRef.current.slice(0, numBarBins)));

        peakCaps.enter()
          .append('rect')
          .attr('class', 'peak-cap')
          .attr('rx', 1)
          .merge(peakCaps)
          .attr('x', (_, i) => xScale(barFreqs[i]) - barWidth / 2)
          .attr('y', (d: number) => yScale(Number(d)) - 2)
          .attr('width', barWidth)
          .attr('height', 2)
          .attr('fill', '#ffffff')
          .attr('fill-opacity', 0.9);

        peakCaps.exit().remove();
      }

      // 4. Render Harmonic Series Markers
      if (showHarmonics) {
        const markers = harmonicsGroup.selectAll<SVGGElement, typeof HARMONIC_432_SERIES[0]>('g.harmonic-marker')
          .data(HARMONIC_432_SERIES);

        const markerEnter = markers.enter()
          .append('g')
          .attr('class', 'harmonic-marker');

        markerEnter.append('line')
          .attr('class', 'marker-line')
          .attr('y1', 0).attr('y2', height)
          .attr('stroke-dasharray', '3,3');

        markerEnter.append('circle')
          .attr('class', 'marker-dot')
          .attr('r', 3);

        markerEnter.append('text')
          .attr('class', 'marker-text font-mono text-[9px]')
          .attr('text-anchor', 'middle')
          .attr('dy', -6);

        const markerUpdate = markerEnter.merge(markers)
          .attr('transform', d => `translate(${xScale(d.freq)},0)`)
          .style('display', d => (xScale(d.freq) >= 0 && xScale(d.freq) <= width ? 'block' : 'none'));

        markerUpdate.select('.marker-line')
          .attr('stroke', d => d.color)
          .attr('stroke-width', d => (d.isCenter ? 1.8 : 1.0))
          .attr('stroke-opacity', d => (d.isCenter ? 0.85 : 0.4));

        markerUpdate.select('.marker-dot')
          .attr('cy', 8)
          .attr('fill', d => d.color)
          .attr('r', d => (d.isCenter ? 4.5 : 3.0))
          .attr('filter', d => (d.isCenter ? 'url(#d9-glow)' : 'none'));

        markerUpdate.select('.marker-text')
          .attr('y', 20)
          .attr('fill', d => d.color)
          .attr('font-weight', d => (d.isCenter ? 'bold' : 'normal'))
          .text(d => (d.isCenter ? '432Hz ★' : `${d.freq}Hz`));

        markers.exit().remove();
      } else {
        harmonicsGroup.selectAll('*').remove();
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Setup Mouse Hover Crosshair on Overlay
    overlay
      .on('mousemove', function (event) {
        const [mx, my] = d3.pointer(event);
        const freqAtX = xScale.invert(mx);
        const magAtY = yScale.invert(my);

        hoverGroup.style('display', 'block');
        hoverLineX.attr('x1', mx).attr('x2', mx);
        hoverLineY.attr('y1', my).attr('y2', my);
        hoverDot.attr('cx', mx).attr('cy', my);

        const roundedFreq = Math.round(freqAtX * 10) / 10;
        setHoveredData({
          freq: roundedFreq,
          magnitude: Math.round((magAtY / 255) * 100),
          nearestNote: getNearest432Note(roundedFreq),
          stem: getStemForFrequency(roundedFreq)
        });
      })
      .on('mouseleave', function () {
        hoverGroup.style('display', 'none');
        setHoveredData(null);
      });

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, scaleType, viewMode, showHarmonics, bpm, isPlaying]);

  // Dragon 9 Clock metrics
  const d9Cycle = clock?.cycle ?? 4;
  const d9Beat = clock?.beat ?? 2;
  const d9Tick = clock?.tick ?? 18;
  const cycleProgress = clock?.cycleProgressPct ?? 44;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Header & Telemetry Status Bar */}
      <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>432Hz REAL-TIME SPECTRUM ANALYZER</span>
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold">
            D3.js ENGINE • FFT 512
          </span>

          <span className="hidden sm:inline-block text-zinc-500">•</span>
          <span className="hidden sm:inline-block text-amber-400">
            A4 = 432.0 Hz Harmonic Lock
          </span>
        </div>

        {/* View Mode & Scale Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-zinc-800/90 rounded-lg p-0.5 border border-zinc-700/80">
            <button
              type="button"
              onClick={() => setViewMode('curve')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'curve' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Contour
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bars')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'bars' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Stems
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dual')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'dual' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dual FFT+Wave
            </button>
          </div>

          {/* Scale Type */}
          <button
            type="button"
            onClick={() => setScaleType(scaleType === 'log' ? 'linear' : 'log')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700 transition-colors cursor-pointer"
            title="Toggle Frequency Scale"
          >
            {scaleType.toUpperCase()}
          </button>

          {/* Harmonics Toggle */}
          <button
            type="button"
            onClick={() => setShowHarmonics(!showHarmonics)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
              showHarmonics
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            432Hz Series
          </button>
        </div>
      </div>

      {/* Main D3 Canvas / SVG Container */}
      <div
        ref={containerRef}
        className="relative w-full bg-zinc-950 flex items-center justify-center select-none"
        style={{ minHeight: '260px' }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto block overflow-visible"
        />

        {/* Real-time Hover Crosshair Telemetry HUD Pill */}
        {hoveredData ? (
          <div className="absolute top-3 right-4 z-20 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/40 text-[11px] font-mono shadow-xl pointer-events-none space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-white font-bold">{hoveredData.freq} Hz</span>
              <span className="text-amber-400 font-semibold">[{hoveredData.nearestNote}]</span>
            </div>
            <div className="text-zinc-400 text-[10px]">
              Magnitude: <span className="text-emerald-400 font-semibold">{hoveredData.magnitude}%</span> • {hoveredData.stem}
            </div>
          </div>
        ) : (
          <div className="absolute top-3 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-3 bg-zinc-900/70 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-zinc-800/80 text-[10px] font-mono text-zinc-400">
            <div>Peak: <span className="text-amber-400 font-bold">{currentPeakFreq} Hz</span></div>
            <div>RMS Level: <span className="text-emerald-400 font-bold">{rmsEnergy}%</span></div>
            <div>Tuning: <span className="text-cyan-400">Verdi -31.8¢</span></div>
          </div>
        )}
      </div>

      {/* Synchronized Dragon 9 Clock & Stems Frequency Band Map */}
      <div className="p-4 bg-zinc-900/95 border-t border-zinc-800 grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* Metric 1: Master Clock Sync */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="uppercase tracking-wider">Dragon 9 Clock Sync</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-white font-bold text-sm">
              Cycle 0{d9Cycle} : Beat 0{d9Beat}
            </span>
            <span className="text-emerald-400 text-[11px] font-semibold">
              {isPlaying ? `Bar ${activeBar || 1}/4` : '54-Min Lock'}
            </span>
          </div>
          {/* Progress bar of current cycle */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-400">
            <span>54 Micro-Pulses</span>
            <span>Tick #{d9Tick}</span>
          </div>
        </div>

        {/* Metric 2: 432Hz Sub Bass Stem (Track 2) */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="uppercase tracking-wider text-cyan-400">Track 2: Sub Bass Stem</span>
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-white font-bold text-sm">54.0 Hz & 108.0 Hz</div>
          <p className="text-[10px] text-zinc-400 leading-snug">
            Tuned to D9 roots ({genre === 'dub-reggae' ? 'Dub One-Drop Sub' : genre === 'g-funk' ? 'Bouncy Sawtooth' : 'Acoustic Trip-Hop Sub'})
          </p>
        </div>

        {/* Metric 3: Skank / Rhodes Chords Stem (Track 3) */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="uppercase tracking-wider text-amber-400">Track 3: Harmonic Chords</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-white font-bold text-sm">216.0 Hz & 432.0 Hz</div>
          <p className="text-[10px] text-zinc-400 leading-snug">
            {genre === 'trip-hop' ? 'Rhodes Minor 9th Voicings' : genre === 'dub-reggae' ? 'Offbeat Organ Skanks' : 'G-Funk Analog Comping'}
          </p>
        </div>

        {/* Metric 4: High Lead & Whistle (Track 4) */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="uppercase tracking-wider text-pink-400">Track 4: Signature Lead</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="text-white font-bold text-sm">864.0 Hz & 1296.0 Hz</div>
          <p className="text-[10px] text-zinc-400 leading-snug">
            {genre === 'g-funk' ? 'West Coast High Sine Whistle' : genre === 'dub-reggae' ? 'Spring Reverb Echoes' : 'Melancholic Flute Textures'}
          </p>
        </div>
      </div>
    </div>
  );
};
