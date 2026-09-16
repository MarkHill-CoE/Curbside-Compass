declare global { 
  interface Window { 
    __riotAudioPlayed?: boolean; 
    __riotAudioPending?: boolean;
    __riotAudio?: HTMLAudioElement;
  } 
}

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimulationConfig } from '../types';
import { Volume2, VolumeX, Sliders, RefreshCw, AlertTriangle, ShieldCheck, Flame, RotateCcw, CheckCircle } from 'lucide-react';
import { feedback, triggerFeedback } from '../utils/feedback';

interface NeighborhoodSimulationProps {
  config: SimulationConfig;
  onConfigChange?: (newConfig: Partial<SimulationConfig>) => void;
  activeQuestionNumber?: number;
  policyNote?: string;
  isCompleted?: boolean;
}

const TOTAL_LEGAL_CURBSIDE_STALLS = 11;

export const NeighborhoodSimulation: React.FC<NeighborhoodSimulationProps> = ({
  config,
  onConfigChange,
  activeQuestionNumber,
  policyNote,
  isCompleted
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(feedback.isSoundEnabled());
  const [showControls, setShowControls] = useState<boolean>(false);
  const [curbsideDemandCount, setCurbsideDemandCount] = useState<number>(0);
  const [curbsidePct, setCurbsidePct] = useState<number>(0);
  const [isRiotActive, setIsRiotActive] = useState<boolean>(false);
  const [isHarmonyActive, setIsHarmonyActive] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.33);
  const [visualAudioAlert, setVisualAudioAlert] = useState<{ text: string; icon: 'horn' | 'siren' | 'alarm' } | null>(null);
  const audioAlertTimerRef = useRef<number | null>(null);

  const triggerVisualAudioAlert = useCallback((text: string, icon: 'horn' | 'siren' | 'alarm' = 'horn') => {
    setVisualAudioAlert({ text, icon });
    if (audioAlertTimerRef.current) window.clearTimeout(audioAlertTimerRef.current);
    audioAlertTimerRef.current = window.setTimeout(() => {
      setVisualAudioAlert(null);
    }, 2200);
  }, []);

  // Escape key listener for Manual Sliders Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showControls) {
        setShowControls(false);
        document.getElementById('manual-controls-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showControls]);

  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1.33);

  const toggleRoadFireRef = useRef<(() => void) | null>(null);
  const handleCanvasClickRef = useRef<((clickX: number, clickY: number) => void) | null>(null);

  const toggleRoadFire = useCallback(() => {
    toggleRoadFireRef.current?.();
  }, []);

  useEffect(() => {
    return feedback.subscribe((enabled) => setSoundEnabled(enabled));
  }, []);

  // Audio context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled && !isCompleted);
  soundEnabledRef.current = soundEnabled && !isCompleted;

  
  const configRef = useRef<SimulationConfig>(config);
  configRef.current = config;
  
  const activeQuestionRef = useRef(activeQuestionNumber);
  activeQuestionRef.current = activeQuestionNumber;
  
  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;


  // Initialize or resume audio context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playHonk = useCallback((type: string) => {
    const vehicleNames: Record<string, string> = {
      boxTruck: 'Delivery Truck Horn',
      pickup: 'Pickup Truck Horn',
      police: 'Police Siren',
      firetruck: 'Fire Engine Siren',
      suv: 'SUV Horn',
      sedan: 'Car Horn'
    };
    triggerVisualAudioAlert(vehicleNames[type] || 'Vehicle Horn', type === 'police' || type === 'firetruck' ? 'siren' : 'horn');

    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      let f1 = 410;
      let f2 = 510;
      let duration = 0.35;
      let wave: OscillatorType = 'sawtooth';
      const volume = 0.15; // 15% procedural sound volume as requested

      if (type === 'boxTruck') {
        f1 = 130 + Math.random() * 15;
        f2 = 165 + Math.random() * 15;
        duration = 0.55;
        wave = 'square';
      } else if (type === 'pickup') {
        f1 = 280 + Math.random() * 20;
        f2 = 350 + Math.random() * 20;
        duration = 0.4;
      } else if (type === 'police') {
        f1 = 650 + Math.random() * 30;
        f2 = 780 + Math.random() * 30;
        duration = 0.35;
        wave = 'sawtooth';
      } else if (type === 'firetruck') {
        f1 = 160 + Math.random() * 20;
        f2 = 210 + Math.random() * 20;
        duration = 0.55;
        wave = 'square';
      } else if (type === 'suv') {
        f1 = 370 + Math.random() * 25;
        f2 = 450 + Math.random() * 25;
        duration = 0.38;
      }

      osc1.type = wave;
      osc2.type = wave;
      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Audio safety fallback
    }
  }, [getAudioContext]);

  const playCriticalAlarm = useCallback(() => {
    triggerVisualAudioAlert('Severe Curbside Congestion Alarm', 'alarm');

    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02); // 15% procedural alarm volume
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio safety fallback
    }
  }, [getAudioContext]);

  // Reshuffle signal
  const reshuffleTriggerRef = useRef<number>(0);
  const handleReshuffle = () => {
    reshuffleTriggerRef.current += 1;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Prevent default to stop page scroll
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = touchStartScaleRef.current * (dist / touchStartDistRef.current);
      setZoomScale(Math.min(Math.max(0.5, newScale), 4));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDistRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Stop page scrolling or browser zoom
    setZoomScale(s => Math.min(Math.max(0.5, s - e.deltaY * 0.005), 4));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gaugeCanvas = gaugeCanvasRef.current;
    const gaugeCtx = gaugeCanvas ? gaugeCanvas.getContext('2d') : null;

    let animFrameId: number;
    let alarmCooldown = 0;
    let overloadTimer = 0;
    let harmonyTimer = 0;
    let isHarmony = false;
    let harmonyFlowerGrowth = 0;
    const flowerBeds: Array<{x: number, y: number, color: string, z: number, id: number}> = [];
    const residents: Array<{x: number, y: number, state: 'inside' | 'walking_to_garden' | 'planting' | 'visiting', targetX: number, targetY: number, color: string, homeX: number, timer: number, friendIdx: number}> = [];
    const flowerColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#f368e0', '#ff9f43', '#0abde3', '#e17055', '#fdcb6e'];
    const compColors = ['#FF8C00', '#8A2BE2', '#FF1493', '#00FFFF', '#FFD700', '#ADFF2F']; // Complementary colors to the 6 house colors
    const shirtColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c'];
    const _lotWidth = 55;
    let flowerIdCounter = 0;
    for (let h = 0; h < 6; h++) {
      const startX = 10 + h * _lotWidth;
      const numResidents = (h === 5) ? 4 : 2;
      for (let r = 0; r < numResidents; r++) {
         const homeDoorX = (h === 5) ? (startX + (r % 2 === 0 ? 5 : 25)) : (startX + 28);
         residents.push({
             x: homeDoorX,
             y: 35,
             state: 'inside',
             targetX: homeDoorX,
             targetY: 35,
             color: shirtColors[Math.floor(Math.random() * shirtColors.length)],
             homeX: homeDoorX,
             timer: Math.random() * 2,
             friendIdx: -1
         });
      }
      if (h === 5) {
        for (let j = 0; j < 15; j++) {
          // Skinny 1 (x: startX+5 to startX+20, door at startX+10, width 3)
          // Front edge y = 36 to 39
          let fx1 = startX + 5 + Math.random() * 15;
          while (fx1 > startX + 9 && fx1 < startX + 14) {
              fx1 = startX + 5 + Math.random() * 15;
          }
          flowerBeds.push({ x: fx1, y: 36 + Math.random() * 3, z: Math.random() * 1.5, color: compColors[h], id: flowerIdCounter++ });
          
          // Skinny 2 (x: startX+25 to startX+40, door at startX+30, width 3)
          let fx2 = startX + 25 + Math.random() * 15;
          while (fx2 > startX + 29 && fx2 < startX + 34) {
              fx2 = startX + 25 + Math.random() * 15;
          }
          flowerBeds.push({ x: fx2, y: 36 + Math.random() * 3, z: Math.random() * 1.5, color: compColors[h], id: flowerIdCounter++ });
        }
      } else {
        for (let j = 0; j < 30; j++) {
          // Standard (x: startX+5 to startX+33, door at startX+13, width 4)
          // Garage starts at startX+33, so we stop before the driveway
          let fx = startX + 5 + Math.random() * 27;
          while (fx > startX + 12 && fx < startX + 18) { // wider berth for the door
              fx = startX + 5 + Math.random() * 27;
          }
          flowerBeds.push({ x: fx, y: 36 + Math.random() * 3, z: Math.random() * 1.5, color: compColors[h], id: flowerIdCounter++ });
        }
      }
    }
    
    const confetti: Array<{x: number, y: number, vx: number, vy: number, color: string, size: number, angle: number, spin: number}> = [];
    const confettiColors = ['#009A44', '#004B8D', '#FFC72C', '#E8552D', '#FFFFFF', '#0081BC'];
    let isRioting = false;


    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      color: string;
    }> = [];
    const flippedCars = new Set<number>();

    const edmontonPalette = [
      { name: 'Light Blue', hex: '#0081BC' },
      { name: 'Yellow', hex: '#FFC72C' },
      { name: 'Green', hex: '#009A44' },
      { name: 'Red', hex: '#E8552D' },
      { name: 'Dark Blue', hex: '#005087' },
      { name: 'Purple', hex: '#68217A' }
    ];

    const carTypes = ['sedan', 'suv', 'pickup', 'boxTruck', 'deliveryVan'];
    const colorCache = new Map<string, string>();

    function adjustColor(hex: string, percent: number): string {
      const key = `${hex}_${percent}`;
      if (colorCache.has(key)) return colorCache.get(key)!;
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, Math.max(0, (num >> 16) + amt));
      const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
      const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
      const res = '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
      colorCache.set(key, res);
      return res;
    }

    const offsetX = 380;
    const offsetY = 160;
    const scale = 2.2;
    const blockLength = 380;

    function project(x: number, y: number, z: number) {
      const rx = x * scale;
      const ry = y * scale;
      const rz = z * scale;
      return {
        x: (rx - ry) * 0.866025 + offsetX,
        y: (rx + ry) * 0.5 - rz + offsetY
      };
    }

    function drawFlatRect(x: number, y: number, w: number, d: number, color: string, targetCtx: CanvasRenderingContext2D = ctx!) {
      const p1 = project(x, y, 0);
      const p2 = project(x + w, y, 0);
      const p3 = project(x + w, y + d, 0);
      const p4 = project(x, y + d, 0);
      targetCtx.fillStyle = color;
      targetCtx.beginPath();
      targetCtx.moveTo(p1.x, p1.y);
      targetCtx.lineTo(p2.x, p2.y);
      targetCtx.lineTo(p3.x, p3.y);
      targetCtx.lineTo(p4.x, p4.y);
      targetCtx.closePath();
      targetCtx.fill();
    }

    function drawBlock(
      x: number,
      y: number,
      z: number,
      w: number,
      d: number,
      h: number,
      topColor: string,
      leftColor: string,
      rightColor: string,
      targetCtx: CanvasRenderingContext2D = ctx!
    ) {
      const p2 = project(x + w, y, z);
      const p3 = project(x + w, y + d, z);
      const p4 = project(x, y + d, z);
      const p1_top = project(x, y, z + h);
      const p2_top = project(x + w, y, z + h);
      const p3_top = project(x + w, y + d, z + h);
      const p4_top = project(x, y + d, z + h);

      targetCtx.strokeStyle = 'rgba(0,0,0,0.15)';
      targetCtx.lineWidth = 0.8;

      // Right Face
      targetCtx.fillStyle = rightColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p3.x, p3.y);
      targetCtx.lineTo(p2.x, p2.y);
      targetCtx.lineTo(p2_top.x, p2_top.y);
      targetCtx.lineTo(p3_top.x, p3_top.y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      // Left Face
      targetCtx.fillStyle = leftColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p3.x, p3.y);
      targetCtx.lineTo(p4.x, p4.y);
      targetCtx.lineTo(p4_top.x, p4_top.y);
      targetCtx.lineTo(p3_top.x, p3_top.y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      // Top Face
      targetCtx.fillStyle = topColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p1_top.x, p1_top.y);
      targetCtx.lineTo(p2_top.x, p2_top.y);
      targetCtx.lineTo(p3_top.x, p3_top.y);
      targetCtx.lineTo(p4_top.x, p4_top.y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();
    }

    function drawPitchedRoof(
      x: number,
      y: number,
      z: number,
      w: number,
      d: number,
      h: number,
      roofColor: string,
      gableColor: string,
      targetCtx: CanvasRenderingContext2D = ctx!
    ) {
      const p2_top = project(x + w, y, z);
      const p3_top = project(x + w, y + d, z);
      const p4_top = project(x, y + d, z);
      const r1 = project(x, y + d / 2, z + h);
      const r2 = project(x + w, y + d / 2, z + h);
      targetCtx.strokeStyle = 'rgba(0,0,0,0.2)';
      targetCtx.lineWidth = 0.8;

      targetCtx.fillStyle = gableColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p3_top.x, p3_top.y);
      targetCtx.lineTo(p2_top.x, p2_top.y);
      targetCtx.lineTo(r2.x, r2.y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = roofColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p4_top.x, p4_top.y);
      targetCtx.lineTo(p3_top.x, p3_top.y);
      targetCtx.lineTo(r2.x, r2.y);
      targetCtx.lineTo(r1.x, r1.y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();
    }

    // Offscreen layers
    const bgGroundCanvas = document.createElement('canvas');
    bgGroundCanvas.width = canvas.width;
    bgGroundCanvas.height = canvas.height;
    const bgGroundCtx = bgGroundCanvas.getContext('2d')!;

    const bgHousesCanvas = document.createElement('canvas');
    bgHousesCanvas.width = canvas.width;
    bgHousesCanvas.height = canvas.height;
    const bgHousesCtx = bgHousesCanvas.getContext('2d')!;

    const bgTreesCanvas = document.createElement('canvas');
    bgTreesCanvas.width = canvas.width;
    bgTreesCanvas.height = canvas.height;
    const bgTreesCtx = bgTreesCanvas.getContext('2d')!;

    function renderGroundBackground() {
      bgGroundCtx.clearRect(0, 0, bgGroundCanvas.width, bgGroundCanvas.height);

      // Asphalt roadway
      drawFlatRect(0, 93, blockLength, 45, '#505357', bgGroundCtx);

      // Center dashed road markings
      for (let i = 10; i < blockLength; i += 25) {
        drawFlatRect(i, 116, 12, 2, '#e0e0e0', bgGroundCtx);
      }

      // Lawns
      drawFlatRect(0, 0, blockLength, 70, '#86c274', bgGroundCtx);
      drawFlatRect(0, 78, blockLength, 15, '#7bb369', bgGroundCtx);

      // Driveways & Walkways for 6 homes (Driveways are strictly ONE car wide, width 9.5)
      const lotWidth = 55;
      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;

        if (h === 5) {
          // Skinny Lots (No front driveway)
          // Front walkway for Skinny 1 (x: i + 5)
          drawFlatRect(i + 9, 35, 3, 35, '#d0d4d8', bgGroundCtx);
          // Front walkway for Skinny 2 (x: i + 25)
          drawFlatRect(i + 29, 35, 3, 35, '#d0d4d8', bgGroundCtx);
        } else {
          // Standard Single-Family
          // Concrete single-car-wide driveway on private lot down to sidewalk (width 9.5, y = 35 to 70)
          drawFlatRect(i + 35, 35, 9.5, 35, '#9ca0a4', bgGroundCtx);
          drawFlatRect(i + 35, 53, 9.5, 0.4, '#7e8387', bgGroundCtx);

          // Driveway apron across boulevard (y = 78 to 93)
          drawFlatRect(i + 35, 78, 9.5, 15, '#9ca0a4', bgGroundCtx);
          drawFlatRect(i + 35, 86, 9.5, 0.4, '#7e8387', bgGroundCtx);

          // Front walkway from front door (y = 35) to sidewalk (y = 70)
          drawFlatRect(i + 13, 35, 4, 35, '#d0d4d8', bgGroundCtx);
          // Walkway connection branch to single-car driveway
          drawFlatRect(i + 17, 51, 18, 2.5, '#d0d4d8', bgGroundCtx);

          // Driveway dropped curb apron cut
          drawFlatRect(i + 34.8, 92.4, 9.9, 1.2, '#8e9398', bgGroundCtx);
        }
      }

      // Continuous Public Sidewalk with scored joint lines (y = 70 to 78)
      // Unobstructed pedestrian corridor cutting across all driveways
      drawFlatRect(0, 70, blockLength, 8, '#b5bac0', bgGroundCtx);
      drawFlatRect(0, 69.6, blockLength, 0.5, '#8a8f94', bgGroundCtx);
      drawFlatRect(0, 77.9, blockLength, 0.5, '#8a8f94', bgGroundCtx);
      for (let s = 0; s < blockLength; s += 8) {
        drawFlatRect(s, 70, 0.5, 8, '#9a9fa3', bgGroundCtx);
      }

      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;
        
        if (h !== 5) { // Skip driveway logic for house 5 which doesn't have a front driveway
          // 1.5m No-Parking Driveway Clearance Zones (1.5m = 5.0 simulation units)
          // Left 1.5m clearance zone: [i + 30, i + 35]
          // Right 1.5m clearance zone: [i + 44.5, i + 49.5]
          if (h !== 0) {
            // Left 1.5m yellow curb
            drawFlatRect(i + 30, 92.4, 5.0, 1.2, '#FBBF24', bgGroundCtx);
            // Left boundary limit line (white)
            drawFlatRect(i + 29.7, 91.5, 0.6, 2.8, '#FFFFFF', bgGroundCtx);
            // Left yellow road edge clearance stripe
            drawFlatRect(i + 30.5, 93.7, 4.0, 0.6, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);
          }

          // Right 1.5m yellow curb (applies to all driveways h = 0 to 5)
          drawFlatRect(i + 44.5, 92.4, 5.0, 1.2, '#FBBF24', bgGroundCtx);
          // Right boundary limit line (white)
          drawFlatRect(i + 49.5, 91.5, 0.6, 2.8, '#FFFFFF', bgGroundCtx);
          // Right yellow road edge clearance stripe
          drawFlatRect(i + 45.0, 93.7, 4.0, 0.6, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);

          // Stenciled "1.5m" curb labels
          const curbLabelPosR = project(i + 47.0, 95.0, 0);
          bgGroundCtx.save();
          bgGroundCtx.fillStyle = '#FBBF24';
          bgGroundCtx.font = 'bold 6px "Open Sans", sans-serif';
          bgGroundCtx.textAlign = 'center';
          bgGroundCtx.fillText('1.5m', curbLabelPosR.x, curbLabelPosR.y);
          if (h !== 0) {
            const curbLabelPosL = project(i + 32.5, 95.0, 0);
            bgGroundCtx.fillText('1.5m', curbLabelPosL.x, curbLabelPosL.y);
          }
          bgGroundCtx.restore();
        }
      }

      // Fire Hydrant 5m No-Parking Zone Road Markings in front of Blue House (Hydrant at x = 27, radius = 16.5m)
      // Zone spans from x = 10.5 to x = 43.5 along the curb and street (y = 92.5 to 97.5)
      // 1. Safety Yellow Painted Curb
      drawFlatRect(10.5, 92.5, 33, 1.2, '#FBBF24', bgGroundCtx);
      // 2. Yellow Pavement Chevron / Cross-Hatching on Asphalt
      drawFlatRect(10.5, 93.7, 33, 0.6, '#FBBF24', bgGroundCtx);
      for (let hx = 12; hx <= 42; hx += 3.5) {
        drawFlatRect(hx, 94.3, 0.9, 3.2, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);
      }
      // 3. 5m Distance Limit Boundary Lines
      drawFlatRect(10.2, 91.5, 0.8, 6.0, '#FFFFFF', bgGroundCtx);
      drawFlatRect(43.2, 91.5, 0.8, 6.0, '#FFFFFF', bgGroundCtx);
      // 4. Stenciled "NO PARKING 5m" road stencil text
      const roadLabelPos = project(27, 96, 0);
      bgGroundCtx.save();
      bgGroundCtx.fillStyle = '#FBBF24';
      bgGroundCtx.font = 'bold 8px "Open Sans", sans-serif';
      bgGroundCtx.textAlign = 'center';
      bgGroundCtx.fillText('NO PARKING 5m', roadLabelPos.x, roadLabelPos.y);
      bgGroundCtx.restore();
    }

    function drawFireHydrant(x: number, y: number, z: number, targetCtx: CanvasRenderingContext2D = bgHousesCtx) {
      // Ground shadow on grass boulevard
      const shadowPos = project(x, y, 0);
      targetCtx.save();
      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      targetCtx.beginPath();
      targetCtx.ellipse(shadowPos.x, shadowPos.y, 7, 4, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();

      // Flanged base ring (bolted dark cast iron on grass)
      drawBlock(x - 0.9, y - 0.9, z, 1.8, 1.8, 0.7, '#374151', '#1F2937', '#111827', targetCtx);

      // Lower hydrant barrel
      drawBlock(x - 0.7, y - 0.7, z + 0.7, 1.4, 1.4, 1.1, '#991B1B', '#7F1D1D', '#581C17', targetCtx);

      // Main hydrant body barrel (City of Edmonton fire-engine red)
      drawBlock(x - 0.6, y - 0.6, z + 1.8, 1.2, 1.2, 2.2, '#DC2626', '#B91C1C', '#991B1B', targetCtx);

      // White reflective safety collar around upper barrel
      drawBlock(x - 0.65, y - 0.65, z + 3.7, 1.3, 1.3, 0.35, '#FFFFFF', '#E5E7EB', '#D1D5DB', targetCtx);

      // Steamer pumper nozzle port (facing street +y)
      drawBlock(x - 0.4, y + 0.6, z + 2.3, 0.8, 0.5, 0.9, '#E5E7EB', '#D1D5DB', '#9CA3AF', targetCtx);

      // Side 2.5" hose outlet nozzle caps (left -x and right +x)
      drawBlock(x - 1.1, y - 0.3, z + 2.5, 0.5, 0.6, 0.7, '#D1D5DB', '#9CA3AF', '#6B7280', targetCtx);
      drawBlock(x + 0.6, y - 0.3, z + 2.5, 0.5, 0.6, 0.7, '#D1D5DB', '#9CA3AF', '#6B7280', targetCtx);

      // Hydrant bonnet (City of Edmonton high-flow safety yellow dome/cap)
      drawBlock(x - 0.75, y - 0.75, z + 4.0, 1.5, 1.5, 0.8, '#FBBF24', '#D97706', '#B45309', targetCtx);

      // Pentagonal top operating nut (for hydrant wrench)
      drawBlock(x - 0.25, y - 0.25, z + 4.8, 0.5, 0.5, 0.7, '#F59E0B', '#B45309', '#78350F', targetCtx);
    }

    function drawHydrantSign(x: number, y: number, z: number, targetCtx: CanvasRenderingContext2D = bgHousesCtx) {
      // Thin steel sign post
      drawBlock(x, y, z, 0.4, 0.4, 6.0, '#9CA3AF', '#6B7280', '#4B5563', targetCtx);
      // Rectangular sign plate facing street
      drawBlock(x - 0.6, y + 0.2, z + 4.2, 1.6, 0.2, 2.0, '#FFFFFF', '#E5E7EB', '#D1D5DB', targetCtx);
      // Red prohibition circle on sign
      const signPos = project(x + 0.2, y + 0.4, z + 5.2);
      targetCtx.save();
      targetCtx.strokeStyle = '#DC2626';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.arc(signPos.x, signPos.y, 3.5, 0, Math.PI * 2);
      targetCtx.stroke();
      targetCtx.fillStyle = '#DC2626';
      targetCtx.font = 'bold 5px sans-serif';
      targetCtx.textAlign = 'center';
      targetCtx.fillText('5m', signPos.x, signPos.y + 2);
      targetCtx.restore();
    }

    function renderHousesBackground() {
      bgHousesCtx.clearRect(0, 0, bgHousesCanvas.width, bgHousesCanvas.height);
      bgTreesCtx.clearRect(0, 0, bgTreesCanvas.width, bgTreesCanvas.height);
      const lotWidth = 55;

      for (let h = 0; h < 6; h++) {
        const i = 10 + h * lotWidth;
        const brand = edmontonPalette[h];
        const topC = brand.hex;
        const leftC = adjustColor(brand.hex, -15);
        const rightC = adjustColor(brand.hex, -30);
        const roofC = adjustColor(brand.hex, -45);
        
        // Example: If it's the last house, draw something different like a skinny split lot
        if (h === 5) {
            // Draw two skinny homes
            const skinny1X = i + 5;
            const skinny2X = i + 25;
            
            // Skinny 1
            drawBlock(skinny1X, 0, 0, 15, 35, 24, topC, leftC, rightC, bgHousesCtx);
            drawPitchedRoof(skinny1X - 1, -2, 24, 17, 39, 10, roofC, rightC, bgHousesCtx);
            drawBlock(skinny1X + 5, 35, 0, 3, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx); // Door
            drawBlock(skinny1X + 2, 35, 10, 4, 0.5, 8, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx); // Window
            
            // Skinny 2
            const topC2 = edmontonPalette[3].hex; // Red
            const leftC2 = adjustColor(topC2, -15);
            const rightC2 = adjustColor(topC2, -30);
            drawBlock(skinny2X, 0, 0, 15, 35, 24, topC2, leftC2, rightC2, bgHousesCtx);
            drawPitchedRoof(skinny2X - 1, -2, 24, 17, 39, 10, roofC, rightC, bgHousesCtx);
            drawBlock(skinny2X + 5, 35, 0, 3, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx); // Door
            drawBlock(skinny2X + 2, 35, 10, 4, 0.5, 8, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx); // Window
            
            // Note: Currently, the background rendering (driveway) will still draw the standard driveway for lot 5.
            // We would need to update `renderGroundBackground()` to handle these dynamic lot layouts too.
        } else {
            // Standard Single-Family Home
            drawBlock(i + 5, 0, 0, 28, 35, 18, topC, leftC, rightC, bgHousesCtx);
            drawPitchedRoof(i + 3, -2, 18, 32, 39, 15, roofC, rightC, bgHousesCtx);
            drawBlock(i + 8, 15, 18, 3, 3, 18, '#193A5A', '#11283f', '#0a1726', bgHousesCtx);

            drawBlock(i + 33, 10, 0, 11.5, 25, 11, adjustColor(topC, -5), leftC, rightC, bgHousesCtx);
            drawBlock(i + 32.5, 8, 11, 12.5, 27, 2, roofC, rightC, rightC, bgHousesCtx);

            drawBlock(i + 35, 35, 0, 8.5, 0.5, 9, '#e2e8f0', '#cbd5e1', '#94a3b8', bgHousesCtx);
            drawBlock(i + 35.5, 35.1, 3.0, 7.5, 0.2, 0.3, '#94a3b8', '#64748b', '#475569', bgHousesCtx);
            drawBlock(i + 35.5, 35.1, 6.0, 7.5, 0.2, 0.3, '#94a3b8', '#64748b', '#475569', bgHousesCtx);

            drawBlock(i + 13, 35, 0, 4, 0.5, 7, '#ffffff', '#e0e0e0', '#cccccc', bgHousesCtx);
            drawBlock(i + 12.5, 35.1, 0, 5, 0.5, 0.8, '#cbd5e1', '#94a3b8', '#64748b', bgHousesCtx);

            drawBlock(i + 6.5, 35, 5, 5, 0.5, 6, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx);
            drawBlock(i + 20, 35, 5, 5, 0.5, 6, '#eef5f9', '#a2c8e0', '#6ba1c4', bgHousesCtx);
        }
      }

      // Boulevard Trees (City of Edmonton Urban Forest - American Elms & Green Ashes)
      // Strictly planted on the grass boulevard (y = 84, between sidewalk y = 78 and curb y = 93)
      // NEVER planted on or overlapping driveways (driveways are at baseX + 35 to baseX + 44.5)
      const treePalette = [
        { main: '#009A44', dark: '#007a36', deep: '#005927', highlight: '#43b865', top: '#32964e' },
        { main: '#15803D', dark: '#166534', deep: '#14532D', highlight: '#22C55E', top: '#16A34A' },
        { main: '#047857', dark: '#065F46', deep: '#064E3B', highlight: '#10B981', top: '#059669' },
        { main: '#1E7E34', dark: '#155724', deep: '#0F3E1A', highlight: '#28A745', top: '#218838' },
        { main: '#009A44', dark: '#007a36', deep: '#005927', highlight: '#43b865', top: '#32964e' },
        { main: '#15803D', dark: '#166534', deep: '#14532D', highlight: '#22C55E', top: '#16A34A' },
      ];

      for (let h = 0; h < 6; h++) {
        const baseX = 10 + h * lotWidth;
        // On lot 0 (blue house), plant at x = 16 to leave full clearance for the boulevard fire hydrant at x = 27
        // On lots 1 to 5, plant centered on the boulevard lawn at baseX + 25 (driveway is at baseX + 35, walkway at baseX + 17)
        const treeX = h === 0 ? baseX + 6 : baseX + 25;
        const treeY = 84; // Center of grass boulevard (y = 78 to 93)
        const palette = treePalette[h % treePalette.length];

        // Dark organic bark mulch ring around tree base on the grass boulevard
        const mulchPos = project(treeX + 1, treeY + 1, 0);
        bgTreesCtx.save();
        bgTreesCtx.fillStyle = '#2c1e16';
        bgTreesCtx.beginPath();
        bgTreesCtx.ellipse(mulchPos.x, mulchPos.y, 7.5, 4, 0, 0, Math.PI * 2);
        bgTreesCtx.fill();
        bgTreesCtx.restore();

        // Sturdy tree trunk on the boulevard (width 2, depth 2, height 8)
        drawBlock(treeX, treeY, 0, 2, 2, 8, '#5c4033', '#4a332a', '#38261f', bgTreesCtx);

        // Lower foliage canopy (width 10, depth 10, height 9) - clear of driveway by >= 4 units
        drawBlock(treeX - 4, treeY - 4, 8, 10, 10, 9, palette.main, palette.dark, palette.deep, bgTreesCtx);

        // Upper crown canopy (width 7, depth 7, height 7)
        drawBlock(treeX - 2.5, treeY - 2.5, 17, 7, 7, 7, palette.highlight, palette.top, palette.dark, bgTreesCtx);
      }

      // Fire Hydrant in front of the blue house (House 0) on the boulevard (x = 27, y = 85.5)
      drawFireHydrant(27, 85.5, 0, bgHousesCtx);
      // City of Edmonton statutory 5m no-parking sign on boulevard post
      drawHydrantSign(30.5, 84, 0, bgHousesCtx);
    }

    renderGroundBackground();
    renderHousesBackground();

    interface HouseCarAssignment {
      type: string;
      x: number;
      y: number;
      w: number;
      d: number;
      color: string;
    }

    function generateHouseCarAssignments(drivewayCap: number): HouseCarAssignment[] {
      const assignments: HouseCarAssignment[] = [];
      const typesY = ['sedanY', 'suvY', 'pickupY'];
      const typesX = ['sedan', 'suv', 'pickup'];

      for (let h = 0; h < 6; h++) {
        const color = edmontonPalette[h].hex;
        const baseX = 10 + h * 55;

        // Skip driveway spots for lot 5 as it has skinny infills with no front driveways
        if (h !== 5) {
          const effectiveCap = Math.min(2, Math.max(1, drivewayCap));
          const drivewaySpotCoords: { x: number; y: number }[] =
            effectiveCap === 1
              ? [{ x: baseX + 35.5, y: 45 }]
              : [
                  { x: baseX + 35.5, y: 36 },
                  { x: baseX + 35.5, y: 53 }
                ];

          for (let d = 0; d < effectiveCap; d++) {
            const spot = drivewaySpotCoords[d];
            assignments.push({
              type: typesY[(h + d) % 3],
              x: spot.x,
              y: spot.y,
              w: 7.5,
              d: 15,
              color
            });
          }
        }

        // Curbside spots
        if (h !== 0) {
          assignments.push({
            type: typesX[h % 3],
            x: baseX - 4.5,
            y: 94,
            w: 16,
            d: 7.5,
            color
          });
          
          if (h === 5) {
            // For lot 5, without a driveway, we can fit an extra curbside car!
            assignments.push({
              type: typesX[(h + 1) % 3],
              x: baseX + 13.0,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
            assignments.push({
              type: typesX[(h + 2) % 3],
              x: baseX + 32.5,
              y: 94,
              w: 16,
              d: 7.5,
              color: edmontonPalette[3].hex // match the red house
            });
          } else {
             // Normal driveway
            assignments.push({
              type: typesX[(h + 1) % 3],
              x: baseX + 13.0,
              y: 94,
              w: 16,
              d: 7.5,
              color
            });
          }
        }
      }
      return assignments;
    }

    let currentDrivewayCap = configRef.current.drivewayCapacity;
    let houseCarAssignments = generateHouseCarAssignments(currentDrivewayCap);
    let activeIndices = Array.from({ length: houseCarAssignments.length }, (_, i) => i);

    function shuffleSlots() {
      for (let i = activeIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeIndices[i], activeIndices[j]] = [activeIndices[j], activeIndices[i]];
      }
      flippedCars.clear();
    }
    shuffleSlots();

    function drawHonkBubble(x: number, y: number, z: number) {
      const pos = project(x + 5, y + 2, z + 8);
      ctx!.save();
      ctx!.fillStyle = '#FFC72C';
      ctx!.strokeStyle = '#193A5A';
      ctx!.lineWidth = 1.5;

      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(pos.x - 4, pos.y + 12);
      ctx!.lineTo(pos.x - 8, pos.y + 20);
      ctx!.lineTo(pos.x + 2, pos.y + 14);
      ctx!.fillStyle = '#FFC72C';
      ctx!.fill();
      ctx!.stroke();
      
      // Honk lines
      ctx!.strokeStyle = '#193A5A';
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 6, pos.y - 2);
      ctx!.lineTo(pos.x - 2, pos.y + 2);
      ctx!.moveTo(pos.x + 2, pos.y - 2);
      ctx!.lineTo(pos.x + 6, pos.y + 2);
      ctx!.stroke();

      ctx!.restore();
    }

    function drawSpeechBubble(x: number, y: number, z: number) {
      const pos = project(x + 1, y - 1, z + 6);
      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.strokeStyle = '#193A5A';
      ctx!.lineWidth = 1.0;

      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.stroke();

      // little dot inside
      ctx!.fillStyle = '#193A5A';
      ctx!.beginPath();
      ctx!.arc(pos.x - 2, pos.y, 1, 0, Math.PI * 2);
      ctx!.arc(pos.x + 2, pos.y, 1, 0, Math.PI * 2);
      ctx!.fill();

      // tail
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 2, pos.y + 7);
      ctx!.lineTo(pos.x - 4, pos.y + 12);
      ctx!.lineTo(pos.x + 1, pos.y + 7);
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fill();
      ctx!.stroke();

      ctx!.restore();
    }

    function drawBystanderPhone(x: number, y: number, z: number, pedId: number) {
      const pos = project(x + 0.5, y + 0.5, z + 7.5);
      ctx!.save();

      // Bystander holding up smartphone recording the fire safely from the sidewalk (strictly NO voice bubbles)
      ctx!.fillStyle = '#111827';
      ctx!.strokeStyle = '#9ca3af';
      ctx!.lineWidth = 0.8;
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(pos.x - 3, pos.y - 9, 6, 8.5, 1.5);
      } else {
        ctx!.rect(pos.x - 3, pos.y - 9, 6, 8.5);
      }
      ctx!.fill();
      ctx!.stroke();

      // Phone screen
      ctx!.fillStyle = '#1e3a8a';
      ctx!.fillRect(pos.x - 2, pos.y - 8, 4, 6.5);

      // Blinking recording indicator light
      const blink = Math.sin(Date.now() * 0.007 + pedId) > 0;
      ctx!.fillStyle = blink ? '#ef4444' : '#7f1d1d';
      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y - 4.5, 1.2, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.restore();
    }

    function drawVehicle(
      x: number,
      y: number,
      z: number,
      type: string,
      primaryColor: string,
      isFlipped = false
    ) {
      const topC = primaryColor;
      const leftC = adjustColor(primaryColor, -15);
      const rightC = adjustColor(primaryColor, -30);
      const glass = type.includes('suv') ? '#81a3ba' : '#a2c8e0';
      const tire = '#1f1f1f';

      const zOffset = isFlipped ? z + 3 : z;
      const drawTopC = isFlipped ? '#222222' : topC;
      const drawLeftC = isFlipped ? '#111111' : leftC;
      const drawRightC = isFlipped ? '#000000' : rightC;

      if (type === 'deliveryVan') {
        const orangeBase = isFlipped ? '#442200' : '#FF5500';
        const orangeLeft = isFlipped ? '#331100' : '#E54D00';
        const orangeRight = isFlipped ? '#220000' : '#CC4300';
        const greenStripe = '#009A44';

        drawFlatRect(x - 1, y - 0.5, 24, 9, 'rgba(0,0,0,0.3)');
        drawBlock(x, y, zOffset, 15, 8, 9.5, orangeBase, orangeLeft, orangeRight);
        drawBlock(x + 15, y + 0.5, zOffset, 6, 7, 7, orangeBase, orangeLeft, orangeRight);
        drawBlock(x + 17, y + 0.8, zOffset + 3.5, 3.5, 6.4, 2.8, orangeBase, '#81a3ba', '#81a3ba');

        if (!isFlipped) {
          for (let s = 0; s < 3; s++) {
            const sx = x + 2 + s * 4.5;
            const p1 = project(sx, y + 8, zOffset + 1);
            const p2 = project(sx + 2, y + 8, zOffset + 1);
            const p3 = project(sx + 4.5, y + 8, zOffset + 8.5);
            const p4 = project(sx + 2.5, y + 8, zOffset + 8.5);

            ctx!.fillStyle = greenStripe;
            ctx!.beginPath();
            ctx!.moveTo(p1.x, p1.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.lineTo(p3.x, p3.y);
            ctx!.lineTo(p4.x, p4.y);
            ctx!.closePath();
            ctx!.fill();
          }
        } else {
          drawBlock(x + 3, y - 1, zOffset + 9.5, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 9.5, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'sedan') {
        drawFlatRect(x - 1, y - 0.5, 17, 8, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 2, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 0.8, 15, 7, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 3, y + 0.5, zOffset + 3.3, 8, 6, 2.2, drawTopC, glass, glass);
        } else {
          drawBlock(x + 3, y + 0.5, zOffset, 8, 6, 2.2, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 15, 7, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 2, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'sedanY') {
        drawFlatRect(x - 0.5, y - 1, 8, 17, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x - 0.5, y + 2, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x - 0.5, y + 11, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x + 6.5, y + 2, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x + 6.5, y + 11, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 0.8, 7, 15, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 0.5, y + 3, zOffset + 3.3, 6, 8, 2.2, drawTopC, glass, glass);
        } else {
          drawBlock(x + 0.5, y + 3, zOffset, 6, 8, 2.2, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 7, 15, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x - 1, y + 2, zOffset + 4.7, 1, 3, 2, tire, tire, tire);
          drawBlock(x - 1, y + 11, zOffset + 4.7, 1, 3, 2, tire, tire, tire);
        }
      } else if (type === 'police') {
        const white = '#ffffff';
        const black = '#111111';
        drawFlatRect(x - 1, y - 0.5, 17, 8, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 2, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 0.8, 15, 7, 2.5, white, '#dddddd', '#cccccc');
          // black doors
          drawBlock(x + 3, y - 0.2, zOffset + 1, 7, 7.4, 2.3, black, black, black);
          drawBlock(x + 3, y + 0.5, zOffset + 3.3, 8, 6, 2.2, white, glass, glass);
          // lights
          const lightColor = (Date.now() % 400 > 200) ? '#ff0000' : '#0000ff';
          drawBlock(x + 6, y + 2.5, zOffset + 5.5, 2, 2, 0.8, lightColor, lightColor, lightColor);
        } else {
          drawBlock(x + 3, y + 0.5, zOffset, 8, 6, 2.2, white, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 15, 7, 2.5, white, '#dddddd', '#cccccc');
          drawBlock(x + 3, y - 0.2, zOffset + 2.4, 7, 7.4, 2.3, black, black, black);
          drawBlock(x + 2, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'firetruck') {
        const red = '#cc0000';
        const redDark = '#990000';
        const chrome = '#eeeeee';
        drawFlatRect(x - 1, y - 0.5, 26, 10, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y - 0.5, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 2, y + 8, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y + 8, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 1.2, 24, 9, 7.5, red, redDark, redDark);
          drawBlock(x + 18, y + 0.5, zOffset + 4.2, 6, 8, 4.8, red, glass, glass); // cab
          drawBlock(x + 24, y + 1.5, zOffset + 2, 0.5, 6, 2, chrome, chrome, chrome); // grill
          
          // flashing lights
          const lightColor = (Date.now() % 300 > 150) ? '#ff0000' : '#ffffff';
          drawBlock(x + 19, y + 1, zOffset + 9, 3, 7, 1.0, lightColor, lightColor, lightColor);
        } else {
          drawBlock(x, y, zOffset + 2, 24, 9, 7.5, red, redDark, redDark);
          drawBlock(x + 2, y - 1, zOffset + 9.7, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y - 1, zOffset + 9.7, 4, 1.5, 2.5, tire, tire, tire);
        }
      } else if (type === 'suv') {
        drawFlatRect(x - 1, y - 0.5, 18, 8.5, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x, y, zOffset + 1, 16, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 2, y + 0.5, zOffset + 4.2, 11, 6.5, 2.8, drawTopC, glass, glass);
        } else {
          drawBlock(x + 2, y + 0.5, zOffset, 11, 6.5, 2.8, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.8, 16, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 2, y - 1, zOffset + 6.0, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 6.0, 3.5, 1, 2, tire, tire, tire);
        }
      } else if (type === 'suvY') {
        drawFlatRect(x - 0.5, y - 1, 8.5, 18, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x - 0.5, y + 2, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x - 0.5, y + 11, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x + 7, y + 2, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x + 7, y + 11, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x, y, zOffset + 1, 7.5, 16, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 0.5, y + 2, zOffset + 4.2, 6.5, 11, 2.8, drawTopC, glass, glass);
        } else {
          drawBlock(x + 0.5, y + 2, zOffset, 6.5, 11, 2.8, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.8, 7.5, 16, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x - 1, y + 2, zOffset + 6.0, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x - 1, y + 11, zOffset + 6.0, 1, 3.5, 2, tire, tire, tire);
        }
      } else if (type === 'pickup') {
        drawFlatRect(x - 1, y - 0.5, 20, 8.5, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          // Bed (Drawn first)
          drawBlock(x, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab (Drawn next so it overlaps the bed slightly if needed)
          drawBlock(x + 7, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Windshield/Roof
          drawBlock(x + 8, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
        } else {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          // Bed (Drawn first since cab overlaps it from the front)
          drawBlock(x + 11, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab 
          drawBlock(x + 1, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, '#111', '#111');
          // Windshield/Roof
          drawBlock(x + 3, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
        }
      } else if (type === 'boxTruck') {
        drawFlatRect(x - 1, y - 0.5, 25, 9, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 19, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 19, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          // Box (White) with slight overhang over the cab
          drawBlock(x, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
          // Cab (Red) (Drawn after Box to appear in front)
          drawBlock(x + 16, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', adjustColor('#d94136', -15), adjustColor('#d94136', -30));
          // Windshield
          drawBlock(x + 20, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
        } else {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          // Cab (Red) (Drawn before Box because Box has higher X and is closer in projection)
          drawBlock(x + 1, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', '#111', '#111');
          // Windshield
          drawBlock(x + 1, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
          // Box (White)
          drawBlock(x + 7, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
        }
      }
    }

    function drawPedestrian(
      x: number,
      y: number,
      z: number,
      shirtColor: string,
      pose: 'normal' | 'bystander' | 'protester' = 'normal'
    ) {
      const skin = '#f0c8a0';
      const pants = '#2c3e50';
      drawBlock(x, y, z, 1, 1, 2.5, pants, pants, pants);
      drawBlock(x - 0.2, y - 0.2, z + 2.5, 1.4, 1.4, 3, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
      drawBlock(x + 0.1, y + 0.1, z + 5.5, 1.2, 1.2, 1.4, skin, skin, skin);

      if (pose === 'bystander') {
        // Bystander gathered on sidewalk watching road fire, arms held forward / observing
        drawBlock(x + 0.1, y + 0.9, z + 3.8, 0.8, 0.9, 1.5, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
      } else if (pose === 'protester') {
        // Protester standing on the road blocking traffic (demonstrating / arms raised in demonstration without placards)
        drawBlock(x - 0.3, y + 0.2, z + 3.6, 0.7, 0.7, 2.0, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
        drawBlock(x + 0.8, y + 0.2, z + 3.6, 0.7, 0.7, 2.0, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
        
        // Stick
        drawBlock(x + 0.5, y + 0.2, z + 4.0, 0.4, 0.4, 6.0, '#8b5a2b', '#6b4226', '#4a2e1b');
        // Cardboard
        drawBlock(x - 1.5, y + 0.1, z + 8.5, 3.5, 0.5, 2.5, '#f4ece1', '#e8dfd3', '#dbd0c1');
        
        // Text on Placard (Isometric Projection)
        const textPos = project(x + 0.25, y + 0.35, z + 9.75);
        ctx!.save();
        ctx!.font = 'bold ' + (1.2 * scale) + 'px sans-serif';
        ctx!.fillStyle = '#9e0000';
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        
        const signText = Math.abs(Math.floor(x * 10)) % 2 === 0 ? 'MORE PARKING' : 'HOMES FOR CARS';
        if (signText === 'MORE PARKING') {
            ctx!.fillText('MORE', textPos.x, textPos.y - 1.5 * scale);
            ctx!.fillText('PARKING', textPos.x, textPos.y + 0.5 * scale);
        } else {
            ctx!.fillText('HOMES', textPos.x, textPos.y - 1.5 * scale);
            ctx!.fillText('FOR CARS', textPos.x, textPos.y + 0.5 * scale);
        }
        ctx!.restore();
      }
    }

    function drawCyclist(x: number, y: number, z: number, bikeColor: string) {
      drawBlock(x, y, z, 3, 0.5, 2, '#333', '#222', '#111');
      drawBlock(x + 6, y, z, 3, 0.5, 2, '#333', '#222', '#111');
      drawBlock(x + 2, y, z + 1.5, 5, 0.5, 1.5, bikeColor, bikeColor, bikeColor);
      drawPedestrian(x + 3, y, z + 2, '#ffffff');
    }

    function drawScooter(x: number, y: number, z: number, scooterColor: string) {
      drawBlock(x, y, z, 7, 1, 0.6, scooterColor, scooterColor, scooterColor);
      drawBlock(x + 6, y + 0.2, z + 0.6, 0.5, 0.6, 4, '#333', '#222', '#111');
      drawPedestrian(x + 2, y, z + 0.6, '#0081BC');
    }

    const BASE_CAR_SPEED = 1.15;
    const MICRO_SPEED = BASE_CAR_SPEED * 0.75;
    const PED_SPEED = MICRO_SPEED * 0.25;

    const pedColors = ['#E8552D', '#0081BC', '#FFC72C', '#ffffff', '#68217A', '#009A44'];
    const pedestrians = Array.from({ length: 24 }, (_, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        x: Math.random() * blockLength,
        y: 73 + (i % 3) * 1.5,
        roadY: 98 + (i % 5) * 6,
        w: 2,
        d: 2,
        baseSpeed: PED_SPEED * dir,
        speed: PED_SPEED * dir,
        color: pedColors[i % pedColors.length],
        riotRole: i % 3,
        brawlPartner: i % 2 === 0 ? i + 1 : i - 1
      };
    });

    const microMobility = Array.from({ length: 12 }, (_, i) => ({
      type: i % 2 === 0 ? 'bike' : 'scooter',
      x: -50 - i * 65,
      y: i % 2 === 0 ? 110 : 124,
      baseY: i % 2 === 0 ? 110 : 124,
      targetY: i % 2 === 0 ? 110 : 124,
      w: i % 2 === 0 ? 8 : 7,
      d: 4,
      baseSpeed: MICRO_SPEED,
      speed: MICRO_SPEED,
      color: edmontonPalette[i % edmontonPalette.length].hex
    }));

    interface RoadObstacle {
      x: number;
      y: number;
      w: number;
      d: number;
      speed?: number;
      baseSpeed?: number;
      baseY?: number;
      targetY?: number;
      type: string;
      color?: string;
      isStatic?: boolean;
      stuckTimer?: number;
      honkCooldown?: number;
      honkBubbleTimer?: number;
      isStuckBehindVan?: boolean;
      isBurning?: boolean;
      isEmergency?: boolean;
    }

    const activeVehicles: RoadObstacle[] = [
      { type: 'sedan', x: -30, y: 110, baseY: 110, targetY: 110, w: 15, d: 7, baseSpeed: BASE_CAR_SPEED, speed: BASE_CAR_SPEED, color: edmontonPalette[0].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'suv', x: -160, y: 124, baseY: 124, targetY: 124, w: 16, d: 7.5, baseSpeed: 0.9, speed: 0.9, color: edmontonPalette[3].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'pickup', x: -280, y: 110, baseY: 110, targetY: 110, w: 18, d: 7.5, baseSpeed: 1.3, speed: 1.3, color: edmontonPalette[2].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 },
      { type: 'boxTruck', x: -420, y: 124, baseY: 124, targetY: 124, w: 24, d: 8.5, baseSpeed: 0.75, speed: 0.75, color: '', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0 }
    ];
    let emergencyVehicles: RoadObstacle[] = [];

    interface DeliveryVan extends RoadObstacle {
      id: number;
      state: 'APPROACHING' | 'STOPPED' | 'AT_DOOR' | 'RETURNING' | 'LEAVING' | 'COOLDOWN';
      targetHouse: number;
      targetStopX: number;
      stopTimer: number;
      driver: {
        x: number;
        y: number;
        targetDoorX: number;
        targetDoorY: number;
        hasPackage: boolean;
        active: boolean;
        path?: {x: number; y: number}[];
        pathIdx?: number;
      };
    }

    let deliveryVansList: DeliveryVan[] = [];

    function createDeliveryVan(id: number, targetHouse: number): DeliveryVan {
      // Van stopping position stops strictly clear of the 1.5m driveway clearance and 5m hydrant clearance
      const stopX = 10 + targetHouse * 55 + (targetHouse === 0 ? 60 : 7);
      const doorX = 10 + targetHouse * 55 + 13;
      return {
        id,
        type: 'deliveryVan',
        x: -150 - id * 130,
        y: 104,
        baseY: 104,
        targetY: 104,
        w: 21,
        d: 8,
        baseSpeed: 1.0,
        speed: 1.0,
        color: '#FF5500',
        state: 'APPROACHING',
        targetHouse,
        targetStopX: stopX,
        stopTimer: 0,
        driver: {
          x: 0,
          y: 0,
          targetDoorX: doorX,
          targetDoorY: 35,
          hasPackage: true,
          active: false
        }
      };
    }

    function updateDeliveryPool(weeklyDeliveries: number) {
      const numVansNeeded = Math.min(3, Math.max(1, Math.ceil(weeklyDeliveries / 6)));
      while (deliveryVansList.length < numVansNeeded) {
        const id = deliveryVansList.length;
        const houseIdx = (id * 2) % 6;
        deliveryVansList.push(createDeliveryVan(id, houseIdx));
      }
      if (deliveryVansList.length > numVansNeeded) {
        deliveryVansList = deliveryVansList.slice(0, numVansNeeded);
      }
    }

    function isCurbsideSpotOccupied(targetStopX: number, totalParked: number): boolean {
      for (let i = 0; i < totalParked; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        if (car && car.y >= 90) {
          if (Math.abs(car.x - targetStopX) < 22) {
            return true;
          }
        }
      }
      return false;
    }

    function drawGauge(curbsideCars: number) {
      if (!gaugeCtx || !gaugeCanvas) return;
      gaugeCtx.clearRect(0, 0, gaugeCanvas.width, gaugeCanvas.height);

      const cx = gaugeCanvas.width / 2;
      const cy = gaugeCanvas.height - Math.max(10, Math.round(gaugeCanvas.height * 0.2));
      const radius = Math.min(cx - 12, cy - 14); // Reduced radius to make room for text at top
      const lineWidth = Math.max(5, Math.round(radius * 0.16));

      const percentage = (curbsideCars / TOTAL_LEGAL_CURBSIDE_STALLS) * 100;
      const clampedPct = Math.min(200, Math.max(0, percentage));

      const startAngle = Math.PI;
      const endAngle = 2 * Math.PI;

      // Green arc
      gaugeCtx.strokeStyle = '#009A44';
      gaugeCtx.lineWidth = lineWidth;
      gaugeCtx.beginPath();
      gaugeCtx.arc(cx, cy, radius, startAngle, startAngle + Math.PI * 0.4, false);
      gaugeCtx.stroke();

      // Yellow arc
      gaugeCtx.strokeStyle = '#FFC72C';
      gaugeCtx.beginPath();
      gaugeCtx.arc(cx, cy, radius, startAngle + Math.PI * 0.4, startAngle + Math.PI * 0.65, false);
      gaugeCtx.stroke();

      // Red arc
      gaugeCtx.strokeStyle = '#E8552D';
      gaugeCtx.beginPath();
      gaugeCtx.arc(cx, cy, radius, startAngle + Math.PI * 0.65, endAngle, false);
      gaugeCtx.stroke();

      // Tick Labels
      const fontSize = Math.max(7, Math.round(radius * 0.15));
      gaugeCtx.fillStyle = '#ffffff';
      gaugeCtx.font = `bold ${fontSize}px "Open Sans", sans-serif`;
      gaugeCtx.textAlign = 'center';
      gaugeCtx.fillText('0%', cx - radius + 2, cy + fontSize + 2);
      gaugeCtx.fillText('100%', cx, cy - radius - 10);
      gaugeCtx.fillText('200%', cx + radius - 2, cy + fontSize + 2);

      // Pointer Needle
      const needleAngle = Math.PI + (clampedPct / 200) * Math.PI;
      const needleLen = radius - 3;

      gaugeCtx.save();
      gaugeCtx.translate(cx, cy);
      gaugeCtx.rotate(needleAngle);

      gaugeCtx.strokeStyle = '#ffffff';
      gaugeCtx.lineWidth = Math.max(1.8, Math.round(radius * 0.04));
      gaugeCtx.beginPath();
      gaugeCtx.moveTo(-3, 0);
      gaugeCtx.lineTo(needleLen, 0);
      gaugeCtx.stroke();

      gaugeCtx.fillStyle = '#FFC72C';
      gaugeCtx.beginPath();
      gaugeCtx.arc(0, 0, Math.max(2.5, Math.round(radius * 0.06)), 0, Math.PI * 2);
      gaugeCtx.fill();
      gaugeCtx.restore();
    }

    function spawnFireParticle(x: number, y: number, z: number) {
      particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 6,
        z: z + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: 0.4 + Math.random() * 0.5,
        life: 1.0,
        color: Math.random() > 0.4 ? '#FF5500' : Math.random() > 0.5 ? '#FFC72C' : '#555555'
      });
    }

    function updateAndDrawParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.life -= 0.03;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const pos = project(p.x, p.y, p.z);
        ctx!.save();
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.life;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, 2.5 * p.life + 1, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    function updateVanState(van: DeliveryVan, totalParked: number, activeRoadProtesters: { x: number; y: number }[] = []) {
      if (van.state === 'APPROACHING') {
        van.speed = van.baseSpeed;
        if (van.x > van.targetStopX - 60) {
          const occupied = isCurbsideSpotOccupied(van.targetStopX, totalParked);
          van.targetY = occupied ? 104 : 94;
        }

        if (Math.abs(van.y - (van.targetY || 104)) > 0.5) {
          van.y += ((van.targetY || 104) > van.y ? 1 : -1) * 0.35;
        } else {
          van.y = van.targetY || 104;
        }

        // Check if protesters ahead on the road are blocking the van
        const isBlockedByProtester = activeRoadProtesters.some(
          p => Math.abs(van.y - p.y) < 8.5 && p.x > van.x && p.x - (van.x + van.w) < 14
        );
        
        // Check if another van is ahead
        let isBlockedByVan = false;
        for (let j = 0; j < deliveryVansList.length; j++) {
          const otherVan = deliveryVansList[j];
          if (otherVan === van || otherVan.x <= van.x) continue;
          if (Math.abs(van.y - otherVan.y) < 8.5 && otherVan.x - (van.x + van.w) < 20) {
             isBlockedByVan = true;
             break;
          }
        }

        if (isBlockedByProtester || isBlockedByVan) {
          van.speed = 0;
        } else {
          van.x += van.speed || 1;
        }

        if (van.x >= van.targetStopX) {
          van.x = van.targetStopX;
          van.speed = 0;
          van.state = 'STOPPED';
          van.driver.active = true;
          van.driver.x = van.x + 10;
          van.driver.y = van.y - 2;
          van.driver.hasPackage = true;
          
          const targetHouse = van.targetHouse;
          const houseBaseX = 10 + targetHouse * 55;
          let apronX = houseBaseX + 39.75;
          if (targetHouse === 5) {
             apronX = 10 + 4 * 55 + 39.75; // Use neighbor's driveway for skinny lot
          }
          
          van.driver.path = [
            { x: van.driver.x, y: van.driver.y },
            { x: apronX, y: van.driver.y },
            { x: apronX, y: 74 },
            { x: van.driver.targetDoorX, y: 74 },
            { x: van.driver.targetDoorX, y: 35 }
          ];
          van.driver.pathIdx = 1;
        }
      } else if (van.state === 'STOPPED') {
        van.speed = 0;
        const d = van.driver;
        if (d.path && d.pathIdx !== undefined && d.pathIdx < d.path.length) {
          const target = d.path[d.pathIdx];
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1.5) {
            d.x += (dx / dist) * 0.45;
            d.y += (dy / dist) * 0.45;
          } else {
            d.x = target.x;
            d.y = target.y;
            d.pathIdx++;
          }
        } else {
          van.state = 'AT_DOOR';
          van.stopTimer = 0;
        }
      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        if (van.stopTimer > 65) {
          van.driver.hasPackage = false;
          van.state = 'RETURNING';

          const targetHouse = van.targetHouse;
          const houseBaseX = 10 + targetHouse * 55;
          let apronX = houseBaseX + 39.75;
          if (targetHouse === 5) {
             apronX = 10 + 4 * 55 + 39.75;
          }
          const vanDoorX = van.x + 10;
          const vanDoorY = van.y - 2;
          
          van.driver.path = [
            { x: van.driver.targetDoorX, y: 35 },
            { x: van.driver.targetDoorX, y: 74 },
            { x: apronX, y: 74 },
            { x: apronX, y: vanDoorY },
            { x: vanDoorX, y: vanDoorY }
          ];
          van.driver.pathIdx = 1;
        }
      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        if (d.path && d.pathIdx !== undefined && d.pathIdx < d.path.length) {
          const target = d.path[d.pathIdx];
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1.5) {
            d.x += (dx / dist) * 0.45;
            d.y += (dy / dist) * 0.45;
          } else {
            d.x = target.x;
            d.y = target.y;
            d.pathIdx++;
          }
        } else {
          d.active = false;
          van.state = 'LEAVING';
        }
      } else if (van.state === 'LEAVING') {
        van.targetY = 104;
        if (Math.abs(van.y - 104) > 0.5) {
          van.y += (104 > van.y ? 1 : -1) * 0.35;
        } else {
          van.y = 104;
        }

        van.speed = van.baseSpeed;
        // Check if protesters ahead on the road are blocking the van
        const isBlockedByProtester = activeRoadProtesters.some(
          p => Math.abs(van.y - p.y) < 8.5 && p.x > van.x && p.x - (van.x + van.w) < 14
        );
        
        // Check if another van is ahead
        let isBlockedByVan = false;
        for (let j = 0; j < deliveryVansList.length; j++) {
          const otherVan = deliveryVansList[j];
          if (otherVan === van || otherVan.x <= van.x) continue;
          if (Math.abs(van.y - otherVan.y) < 8.5 && otherVan.x - (van.x + van.w) < 20) {
             isBlockedByVan = true;
             break;
          }
        }

        if (isBlockedByProtester || isBlockedByVan) {
          van.speed = 0;
        } else {
          van.x += van.speed || 1;
        }

        if (van.x > blockLength + 120) {
          van.state = 'COOLDOWN';
          van.stopTimer = 0;
        }
      } else if (van.state === 'COOLDOWN') {
        van.stopTimer++;
        if (van.stopTimer > 180) {
          const newHouse = (van.targetHouse + 1) % 6;
          van.targetHouse = newHouse;
          van.targetStopX = 10 + newHouse * 55 + 35;
          van.driver.targetDoorX = 10 + newHouse * 55 + 24;
          van.x = -150 - Math.random() * 60;
          van.y = 104;
          van.targetY = 104;
          van.state = 'APPROACHING';
        }
      }
    }

    const allRoadObstacles: RoadObstacle[] = [];
    let lastReshuffleTrigger = reshuffleTriggerRef.current;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Check reshuffle signal
      if (reshuffleTriggerRef.current !== lastReshuffleTrigger) {
        lastReshuffleTrigger = reshuffleTriggerRef.current;
        shuffleSlots();
      }

      // Check if driveway capacity changed
      if (currentDrivewayCap !== configRef.current.drivewayCapacity) {
        currentDrivewayCap = configRef.current.drivewayCapacity;
        houseCarAssignments = generateHouseCarAssignments(currentDrivewayCap);
        activeIndices = Array.from({ length: houseCarAssignments.length }, (_, i) => i);
        shuffleSlots();
        renderGroundBackground();
      }

      const activeHouseholdCars = Math.round(configRef.current.householdCarsPerHome * 6);
      const activeVisitorCars = Math.round(configRef.current.visitorPassesPerHome * 6);
      const totalParkedCars = activeHouseholdCars + activeVisitorCars;
      const totalToRender = Math.min(houseCarAssignments.length, totalParkedCars);

      const weeklyDeliveries = Math.round(configRef.current.deliveriesPerHomePerWeek * 6);
      updateDeliveryPool(weeklyDeliveries);

      const totalDrivewaySpots = Math.min(2, Math.max(1, currentDrivewayCap)) * 6;
      const curbsideDemand = Math.max(0, totalParkedCars - totalDrivewaySpots);
      const gaugePercent = (curbsideDemand / TOTAL_LEGAL_CURBSIDE_STALLS) * 100;

      setCurbsideDemandCount(curbsideDemand);
      setCurbsidePct(Math.round(gaugePercent));
      drawGauge(curbsideDemand);

      if (alarmCooldown > 0) {
        alarmCooldown -= 1 / 60;
      }

      // Riot / Vehicle Fire Invariant: ONLY cars on the road (y >= 90) can burn. Driveway cars (y < 70) NEVER burn.
      const roadCarRenderIndices: number[] = [];
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        if (car && car.y >= 90) {
          roadCarRenderIndices.push(i);
        }
      }

      // Safety purge: ensure driveway cars never stay in flippedCars
      for (const idx of flippedCars) {
        const c = houseCarAssignments[activeIndices[idx]];
        if (!c || c.y < 70) {
          flippedCars.delete(idx);
        }
      }
      const isAfterQ8 = (activeQuestionRef.current !== undefined && activeQuestionRef.current >= 10) || isCompletedRef.current;

      // Reset triggers if we are no longer after Q8 (e.g. user hits Retake)
      if (!isAfterQ8) {
        if (isRioting || flippedCars.size > 0 || activeVehicles.some(v => v.isBurning)) {
            isRioting = false;
            setIsRiotActive(false);
            flippedCars.clear();
            for (let v of activeVehicles) {
              v.isBurning = false;
              v.speed = v.baseSpeed || 1.0;
            }
        }
        overloadTimer = 0;
        
        if (isHarmony || harmonyFlowerGrowth > 0) {
            isHarmony = false;
            setIsHarmonyActive(false);
            harmonyTimer = 0;
            harmonyFlowerGrowth = 0;
            for (let r of residents) {
                r.state = 'inside';
                r.x = r.homeX;
                r.y = 35;
            }
        }
      }
      
      // Overload Trigger: vehicles on the road catch fire under critical curbside parking overload
      if (gaugePercent > 150 && isAfterQ8) {

        overloadTimer += 1 / 60;
        if (overloadTimer >= 4.0 && !isRioting) {
          isRioting = true;
          setIsRiotActive(true);
          // Ignite a car strictly on the road
          if (roadCarRenderIndices.length > 0) {
            flippedCars.add(roadCarRenderIndices[0]);
          } else if (activeVehicles.length > 0) {
            activeVehicles[0].isBurning = true;
            activeVehicles[0].speed = 0;
          }
        }
        if (overloadTimer >= 7.0 && roadCarRenderIndices.length > 2) {
          flippedCars.add(roadCarRenderIndices[1]);
        }
        if (alarmCooldown <= 0 && soundEnabledRef.current) {
          playCriticalAlarm();
          alarmCooldown = 0.5;
        }
      } else if (gaugePercent < 130) {
        overloadTimer = Math.max(0, overloadTimer - 1 / 60);
        if (isRioting && gaugePercent < 100) {
          isRioting = false;
          setIsRiotActive(false);
          flippedCars.clear();
          for (let v of activeVehicles) {
            v.isBurning = false;
            v.speed = v.baseSpeed || 1.0;
          }
        }
      }

      const hasBurningCars = flippedCars.size > 0 || activeVehicles.some(v => v.isBurning) || isRioting;
      
      const numBurning = flippedCars.size + activeVehicles.filter(v => v.isBurning).length;

      // Harmony Trigger: Well-managed neighborhood
      
      const isGoodPlanning = isAfterQ8 && gaugePercent < 50 && !hasBurningCars && !isRioting && activeVehicles.length > 0;

      if (isGoodPlanning) {
        harmonyTimer += 1 / 60;
        if (harmonyTimer >= 4.0 && !isHarmony) {
          isHarmony = true;
          setIsHarmonyActive(true);
        }
      } else {
        harmonyTimer = Math.max(0, harmonyTimer - 1 / 60);
        if (harmonyTimer <= 0 && isHarmony) {
          isHarmony = false;
          setIsHarmonyActive(false);
        }
      }

      // Flag to track if we need to trigger audio
      let policeSpawnedThisFrame = false;
      while (emergencyVehicles.length < numBurning * 2) {
        const idx = Math.floor(emergencyVehicles.length / 2);
        const isPolice = emergencyVehicles.length % 2 === 0;
        if (isPolice) {
          if (emergencyVehicles.length === 0) policeSpawnedThisFrame = true;
          emergencyVehicles.push({ type: 'police', x: -800 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 15, d: 7, baseSpeed: 2.2, speed: 2.2, color: '#ffffff', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        } else {
          emergencyVehicles.push({ type: 'firetruck', x: -900 - idx * 450, y: 117, baseY: 117, targetY: 117, w: 28, d: 9, baseSpeed: 2.0, speed: 2.0, color: '#cc0000', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isEmergency: true });
        }
      }



      // Trigger audio precisely when the police asset is injected into the rendering pipeline (asset mounting event)
      if (policeSpawnedThisFrame && soundEnabledRef.current && !window.__riotAudioPlayed) {
         window.__riotAudioPlayed = true;
         
         if (!window.__riotAudio) {
           window.__riotAudio = new Audio(typeof window !== 'undefined' && window.__agentArtifactAudioUrl ? window.__agentArtifactAudioUrl : '/audio/riot_noise.mp3');
           window.__riotAudio.volume = 0.8;
           window.__riotAudio.loop = true;
         }
         
         window.__riotAudio.currentTime = 0;
         const playPromise = window.__riotAudio.play();
         if (playPromise !== undefined) {
           playPromise.catch(e => {
             console.warn('Riot audio playback blocked by browser autoplay policy. Pending user interaction.', e);
             window.__riotAudioPending = true;
           });
         }
      }
      
      // Stop and reset audio when riot ends completely
      if (numBurning === 0) {
        window.__riotAudioPlayed = false;
        if (window.__riotAudio) {
          window.__riotAudio.pause();
          window.__riotAudio.currentTime = 0;
        }
      }
      
      // Layer 1: Ground, Road, Sidewalks, Driveways
      ctx!.drawImage(bgGroundCanvas, 0, 0);

      // Bystanders on sidewalk: when cars start burning, bystanders gather on the sidewalk while protesters block the road
      const burningRoadLocations = activeVehicles.filter(v => v.isBurning).map(v => v.x).concat(Array.from(flippedCars).map(idx => houseCarAssignments[activeIndices[idx]]?.x || 160));
      const activePedCount = hasBurningCars
        ? Math.min(pedestrians.length, Math.max(14, Math.floor(6 + totalParkedCars * 0.55)))
        : Math.min(pedestrians.length, Math.floor(2 + totalParkedCars * 0.45));
      const activeMicroCount = hasBurningCars ? 0 : Math.min(microMobility.length, Math.floor(totalParkedCars * 0.35));

      // 1. Pedestrian Movement: Normal Walk vs (Protesters on Road Stopping Traffic & Bystanders on Sidewalk)
      const activeRoadProtesters: { x: number; y: number }[] = [];

      for (let i = 0; i < activePedCount; i++) {
        const p1 = pedestrians[i];
        if (hasBurningCars) {
          const isProtester = (p1.id % 2 === 1);
          if (isProtester) {
            // PROTESTERS GATHER ON THE ROADWAY TO STOP TRAFFIC
            // Distributed across the two traffic lanes: lane 1 (y: 108 to 113), lane 2 (y: 120 to 125)
            const targetRoadY = (p1.id % 4 < 2)
              ? (108 + (p1.id % 3) * 2.2)
              : (121 + (p1.id % 3) * 2.2);
            p1.y += (targetRoadY - p1.y) * 0.12;

            // Form a picket line / demonstration blockade in the road lanes ahead of/around the burning vehicle
            const focalX = burningRoadLocations[0] || 160;
            const roadOffset = (((p1.id * 11) % 41) - 26); // spreads -26 to +14 relative to focalX
            const targetX = Math.max(30, Math.min(blockLength - 30, focalX + roadOffset));

            const dx = targetX - p1.x;
            if (Math.abs(dx) > 1.2) {
              p1.x += Math.sign(dx) * 0.5;
            } else {
              // Rhythmic pacing / sign waving on the roadway
              p1.x += Math.sin(Date.now() * 0.005 + p1.id * 1.8) * 0.04;
            }

            if (p1.y > 88) {
              activeRoadProtesters.push({ x: p1.x, y: p1.y });
            }
          } else {
            // BYSTANDERS GATHER SAFELY ON THE SIDEWALK (Sidewalk is y = 70 to 78, center y = 74)
            // Bystanders stay on sidewalk watching the incident — strictly no voice bubbles
            const targetSidewalkY = 72.0 + ((p1.id / 2) % 4) * 1.0;
            p1.y += (targetSidewalkY - p1.y) * 0.12;

            const focalX = burningRoadLocations[0] || 160;
            const clusterOffset = (((p1.id * 13) % 49) - 24);
            const targetX = Math.max(14, Math.min(blockLength - 14, focalX + clusterOffset));

            const dx = targetX - p1.x;
            if (Math.abs(dx) > 1.2) {
              p1.x += Math.sign(dx) * 0.45;
            } else {
              p1.x += Math.sin(Date.now() * 0.003 + p1.id * 1.7) * 0.03;
            }
          }
        } else {
          // Normal pedestrian walk along sidewalk (strictly y = 72-76)
          if (p1.y < 71.5 || p1.y > 76.5) {
            p1.y += (73.5 - p1.y) * 0.1;
          }
          const nextX = p1.x + p1.speed;
          let collision = false;
          for (let j = 0; j < activePedCount; j++) {
            if (i === j) continue;
            const p2 = pedestrians[j];
            if (Math.abs(p1.y - p2.y) < 2) {
              if (nextX < p2.x + p2.w + 1 && nextX + p1.w + 1 > p2.x) {
                collision = true;
                break;
              }
            }
          }
          if (collision) p1.speed = -p1.speed;
          else p1.x = nextX;
        }

        if (p1.x > blockLength + 10) p1.x = -10;
        if (p1.x < -10) p1.x = blockLength + 10;
      }

      // Collect obstacles
      allRoadObstacles.length = 0;
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        allRoadObstacles.push({
          x: car.x,
          y: car.y,
          w: car.w,
          d: car.d,
          speed: 0,
          isStatic: true,
          type: car.type
        });
      }

      for (let i = 0; i < deliveryVansList.length; i++) {
        const van = deliveryVansList[i];
        updateVanState(van, totalToRender, activeRoadProtesters);
        allRoadObstacles.push(van);
      }

      for (let i = 0; i < activeVehicles.length; i++) allRoadObstacles.push(activeVehicles[i]);
      for (let i = 0; i < emergencyVehicles.length; i++) allRoadObstacles.push(emergencyVehicles[i]);
      for (let i = 0; i < activeMicroCount; i++) allRoadObstacles.push(microMobility[i]);

      const BASE_BUFFER = 3.5;
      const CAR_EXTRA_BUFFER = 4.0;
      const MICRO_EXTRA_BUFFER = 2.0;

      const staticObstacleCount = totalToRender + deliveryVansList.length;
      const roadObstacleCount = allRoadObstacles.length;

      // Road Obstacle Avoidance & Movement
      for (let i = staticObstacleCount; i < roadObstacleCount; i++) {
        const A = allRoadObstacles[i];
        if (A.speed === undefined || A.isStatic) continue;

        if (A.isEmergency && !isRioting && A.x < -100) {
          A.x = -800; // Park them
          continue;
        }

        let emergencyApproaching = false;
        if (!A.isEmergency) {
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const E = allRoadObstacles[j];
            if (E.isEmergency && E.x > -400 && E.x < blockLength) {
              emergencyApproaching = true;
              break;
            }
          }
        }

        let targetLane = A.baseY || 110;
        const isCar_A = carTypes.includes(A.type);
        const detectionBuffer_A = BASE_BUFFER + (isCar_A ? CAR_EXTRA_BUFFER : MICRO_EXTRA_BUFFER);

        let isPullingOver = false;
        if (emergencyApproaching) {
          targetLane = 100; // Pull over to the left
          isPullingOver = true;
        } else {
          let isBlockedInLane = false;
          for (let j = 0; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B || (B.speed || 0) > 0.2) continue;
            if (Math.abs(A.y - B.y) < 8 && B.x > A.x && B.x - (A.x + A.w) < 45) {
              isBlockedInLane = true;
              break;
            }
          }

          if (isBlockedInLane) {
            const altLane = (A.baseY || 110) < 115 ? 124 : 110;
            let altClear = true;
            for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
              const B = allRoadObstacles[j];
              if (A === B) continue;
              if (Math.abs(B.y - altLane) < 8 && Math.abs(B.x - A.x) < 28) {
                altClear = false;
                break;
              }
            }
            // Also check if altLane is blocked by protesters
            if (hasBurningCars) {
              for (const rp of activeRoadProtesters) {
                if (Math.abs(rp.y - altLane) < 8 && Math.abs(rp.x - A.x) < 32) {
                  altClear = false;
                  break;
                }
              }
            }
            if (altClear) targetLane = altLane;
          }
        }

        if (Math.abs(A.y - targetLane) > 0.5) {
          A.y += (targetLane > A.y ? 1 : -1) * 0.45;
        } else {
          A.y = targetLane;
        }

        A.speed = isPullingOver ? 0.3 : (A.baseSpeed || BASE_CAR_SPEED); // Slow down significantly when pulling over
        let targetX = A.x + A.speed;
        let blockingObstacle: RoadObstacle | null = null;

        for (let j = 0; j < roadObstacleCount; j++) {
          const B = allRoadObstacles[j];
          if (A === B) continue;
          const yOverlap = A.y < B.y + B.d && A.y + A.d > B.y;
          if (!yOverlap) continue;

          if (B.x > A.x) {
            if (targetX + A.w + detectionBuffer_A > B.x && A.x < B.x + B.w) {
              targetX = Math.min(targetX, B.x - A.w - detectionBuffer_A);
              A.speed = Math.min(A.speed, B.speed || 0);
              blockingObstacle = B;
            }
          }
        }

        // Protesters blocking road lanes: vehicles come to a complete halt
        if (hasBurningCars || isRioting) {
          for (let k = 0; k < activePedCount; k++) {
            const ped = pedestrians[k];
            if (ped.y > 88 && Math.abs(A.y - ped.y) < 8.5) {
              if (ped.x > A.x && ped.x - (A.x + A.w) < detectionBuffer_A + 6) {
                targetX = Math.min(targetX, ped.x - A.w - detectionBuffer_A);
                A.speed = 0;
                blockingObstacle = { x: ped.x, y: ped.y, w: ped.w, d: ped.d, type: 'protester' };
                break;
              }
            }
          }
        }

        A.x = targetX;

        // Honk logic
        if (isCar_A && A.stuckTimer !== undefined) {
          const isBlockedByVanOrRiot =
            blockingObstacle &&
            (blockingObstacle.type === 'deliveryVan' ||
              blockingObstacle.type === 'protester' ||
              blockingObstacle.isStuckBehindVan ||
              isRioting ||
              hasBurningCars);

          if (isBlockedByVanOrRiot && A.speed < 0.15) {
            A.isStuckBehindVan = true;
            A.stuckTimer += 1 / 60;
            if (A.stuckTimer >= 1.8) {
              if ((A.honkCooldown || 0) <= 0) {
                playHonk(A.type);
                A.honkBubbleTimer = 45;
                A.honkCooldown = 1.8 + Math.random();
              }
            }
          } else {
            A.isStuckBehindVan = false;
            A.stuckTimer = 0;
          }

          if ((A.honkCooldown || 0) > 0) A.honkCooldown! -= 1 / 60;
          if ((A.honkBubbleTimer || 0) > 0) A.honkBubbleTimer!--;
        }

        if (A.x > blockLength + 80) {
          if (A.isEmergency && !isRioting) {
            A.x = -800;
            continue;
          }
          let respawnX = -60;
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B) continue;
            if (Math.abs(A.y - B.y) < 8 && B.x < 0 && B.x > respawnX - A.w - 15) {
              respawnX = Math.min(respawnX, B.x - A.w - 15);
            }
          }
          A.x = respawnX;
          A.y = A.baseY || 110;
          A.targetY = A.baseY || 110;
          A.speed = A.baseSpeed || BASE_CAR_SPEED;
          if (A.stuckTimer !== undefined) {
            A.stuckTimer = 0;
            A.honkCooldown = 0;
            A.honkBubbleTimer = 0;
            A.isStuckBehindVan = false;
          }
        }
      }

      // Layer 2: Houses (drawn on background behind vehicles in front of them)
      ctx!.drawImage(bgHousesCanvas, 0, 0);

      

      // Handle Residents
      for (let i = 0; i < residents.length; i++) {
        const r = residents[i];
        
        if (isHarmony) {
          if (r.state === 'inside') {
             if (Math.random() < 0.05) {
                 r.state = 'walking_to_garden';
                 r.targetX = r.homeX - 10 + Math.random() * 20;
                 r.targetY = 75 + Math.random() * 6; // Sidewalk Y
             }
          } else if (r.state === 'walking_to_garden') {
             const dx = r.targetX - r.x;
             const dy = r.targetY - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.3;
                 r.y += (dy/dist) * 0.3;
             } else {
                 if (harmonyFlowerGrowth >= 0.3 && Math.random() < 0.5) {
                     r.state = 'visiting';
                     // Find a random neighbor to visit
                     r.friendIdx = Math.floor(Math.random() * residents.length);
                     const friend = residents[r.friendIdx];
                     r.targetX = friend.x - 5 + Math.random() * 10;
                     r.targetY = 75 + Math.random() * 6;
                 } else {
                     r.state = 'planting';
                     r.timer = 1.0 + Math.random() * 2.0;
                 }
             }
          } else if (r.state === 'planting') {
             r.timer -= 1/60;
             if (r.timer <= 0) {
                 if (harmonyFlowerGrowth >= 0.3 && Math.random() < 0.8) {
                     r.state = 'visiting';
                     r.friendIdx = Math.floor(Math.random() * residents.length);
                     const friend = residents[r.friendIdx];
                     r.targetX = friend.x - 5 + Math.random() * 10;
                     r.targetY = 75 + Math.random() * 6;
                 } else {
                     r.state = 'walking_to_garden';
                     r.targetX = r.homeX - 15 + Math.random() * 30;
                     r.targetY = 75 + Math.random() * 6;
                 }
             }
          } else if (r.state === 'visiting') {
             const dx = r.targetX - r.x;
             const dy = r.targetY - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.4;
                 r.y += (dy/dist) * 0.4;
             } else {
                 if (Math.random() < 0.02) {
                     // Go back to own sidewalk area
                     r.state = 'walking_to_garden';
                     r.targetX = r.homeX - 10 + Math.random() * 20;
                     r.targetY = 75 + Math.random() * 6;
                 }
             }
          }
        } else {
          // Go back inside
          if (r.state !== 'inside') {
             const dx = r.homeX - r.x;
             const dy = 35 - r.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist > 1.0) {
                 r.x += (dx/dist) * 0.6;
                 r.y += (dy/dist) * 0.6;
                 r.state = 'walking_to_garden'; // just using this state to mean 'moving'
             } else {
                 r.x = r.homeX;
                 r.y = 35;
                 r.state = 'inside';
             }
          }
        }
      }

      if (isHarmony) {
        harmonyFlowerGrowth = Math.min(1.0, harmonyFlowerGrowth + 0.005);
      } else {
        harmonyFlowerGrowth = Math.max(0.0, harmonyFlowerGrowth - 0.02);
      }
      
            // Draw growing flower beds behind vehicles but in front of houses

      // Draw Residents if outside
      ctx!.save();
      for (let i = 0; i < residents.length; i++) {
         const r = residents[i];
         if (r.state !== 'inside') {
             // If visiting and close to target, trigger talking animation
             const isTalking = r.state === 'visiting' && (Math.abs(r.targetX - r.x) < 2.0) && (Math.abs(r.targetY - r.y) < 2.0);
             const zBob = isTalking && (Date.now() % 600 < 300) ? 1.0 : 0; // Simple bobbing animation
             
             drawPedestrian(r.x, r.y, zBob, r.color, isTalking ? 'bystander' : 'normal');
             
             if (isTalking) {
                 drawSpeechBubble(r.x, r.y, zBob);
             }
         }
      }
      ctx!.restore();


      if (harmonyFlowerGrowth > 0) {
        for (let i = 0; i < flowerBeds.length; i++) {
          const f = flowerBeds[i];
          const individualGrowth = Math.max(0, Math.min(1, (harmonyFlowerGrowth * 1.5) - (i % 10) * 0.05));
          if (individualGrowth > 0) {
             const scaleAnim = Math.sin(individualGrowth * Math.PI / 2);
             const h = 10 * scaleAnim;
             // Stem 
             drawBlock(f.x, f.y, 0, 2.0, 2.0, h, '#1e633a', '#144528', '#144528');
             // Flower head (very large, 8x8 wide in simulation units)
             drawBlock(f.x - 3.0 * scaleAnim, f.y - 3.0 * scaleAnim, h, 8.0 * scaleAnim, 8.0 * scaleAnim, 4.0 * scaleAnim, f.color, f.color, f.color);
          }
        }
      }
      // Layer 3: Vehicles (Parked Cars, Vans, Emergency, Active Traffic)
      // Grouping all vehicle graphic asset layers together and sorting by depth (Y-axis) for proper collision visual overlap
      const renderQueue: any[] = [];
      
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        const carColor = i >= activeHouseholdCars ? '#ffffff' : car.color;
        const isFlipped = car.y >= 90 && flippedCars.has(i);
        renderQueue.push({ ...car, color: carColor, isFlipped, sortY: car.y });
      }
      for (let i = 0; i < deliveryVansList.length; i++) {
        const van = deliveryVansList[i];
        renderQueue.push({ ...van, color: van.color || '#FF5500', isFlipped: false, sortY: van.y });
      }
      for (let i = 0; i < emergencyVehicles.length; i++) {
        const v = emergencyVehicles[i];
        renderQueue.push({ ...v, color: v.color || '#ffffff', isFlipped: false, sortY: v.y });
      }
      for (let i = 0; i < activeVehicles.length; i++) {
        const v = activeVehicles[i];
        const isVBurning = Boolean(v.isBurning);
        renderQueue.push({ ...v, color: v.color || '#0081BC', isFlipped: isVBurning, sortY: v.y, honkBubbleTimer: v.honkBubbleTimer });
      }

      // Sort by Y-coordinate for proper isometric depth rendering (objects lower on screen drawn last)
      renderQueue.sort((a, b) => a.sortY - b.sortY);

      for (const item of renderQueue) {
        drawVehicle(item.x, item.y, 0, item.type, item.color, item.isFlipped);
        
        if (item.isFlipped) {
          spawnFireParticle(item.x + 3, item.y + 3, 4);
          spawnFireParticle(item.x + 8, item.y + 2, 4);
          if (Math.random() < 0.4) spawnFireParticle(item.x + 12, item.y + 3, 3);
        } else if (item.honkBubbleTimer && item.honkBubbleTimer > 0) {
          drawHonkBubble(item.x, item.y, 0);
        }
      }

      updateAndDrawParticles();

      // Layer 4: Pedestrians: Bystanders on Sidewalk & Protesters on Road
      for (let i = 0; i < activePedCount; i++) {
        const p = pedestrians[i];
        const isProtester = hasBurningCars && (p.id % 2 === 1);
        const isBystander = hasBurningCars && (p.id % 2 === 0);

        if (isProtester) {
          drawPedestrian(p.x, p.y, 0, p.color, 'protester');
        } else if (isBystander) {
          drawPedestrian(p.x, p.y, 0, p.color, 'bystander');
          // Bystanders do NOT need voice bubbles. 1 in 3 records with smartphone safely from sidewalk
          const isRecording = (p.id % 4 === 0 || p.id === 2);
          if (isRecording) {
            drawBystanderPhone(p.x, p.y, 0, p.id);
          }
        } else {
          drawPedestrian(p.x, p.y, 0, p.color, 'normal');
        }
      }

      for (let i = 0; i < deliveryVansList.length; i++) {
        const dr = deliveryVansList[i].driver;
        if (dr.active) {
          drawPedestrian(dr.x, dr.y, 0, '#009A44');
          if (dr.hasPackage) {
            drawBlock(dr.x + 0.5, dr.y - 1, 2.5, 2.2, 2.2, 1.8, '#d2b48c', '#b89768', '#9e7a4a');
          }
        }
      }

      // Layer 5: Trees
      ctx!.drawImage(bgTreesCanvas, 0, 0);

      // Layer 6: Bikes and Scooters
      for (let i = 0; i < activeMicroCount; i++) {
        const mm = microMobility[i];
        if (mm.type === 'bike') drawCyclist(mm.x, mm.y, 0, mm.color);
        else drawScooter(mm.x, mm.y, 0, mm.color);
      }

      
      // Harmony Confetti Layer
      if (isHarmony) {
         if (Math.random() < 0.2) {
             for (let i=0; i<5; i++) {
                 confetti.push({
                     x: Math.random() * 1200,
                     y: -20,
                     vx: (Math.random() - 0.5) * 2,
                     vy: Math.random() * 2 + 1,
                     color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                     size: Math.random() * 6 + 4,
                     angle: Math.random() * Math.PI * 2,
                     spin: (Math.random() - 0.5) * 0.2
                 });
             }
         }
      }
      for (let i = confetti.length - 1; i >= 0; i--) {
         const c = confetti[i];
         c.x += c.vx;
         c.y += c.vy;
         c.angle += c.spin;
         
         ctx!.save();
         ctx!.translate(c.x, c.y);
         ctx!.rotate(c.angle);
         ctx!.fillStyle = c.color;
         ctx!.fillRect(-c.size/2, -c.size/2, c.size, c.size * 0.6);
         ctx!.restore();
         
         if (c.y > 800) {
             confetti.splice(i, 1);
         }
      }

      animFrameId = requestAnimationFrame(animate);
    }

    toggleRoadFireRef.current = () => {
      const anyBurning = flippedCars.size > 0 || activeVehicles.some(v => v.isBurning);
      if (anyBurning) {
        flippedCars.clear();
        for (let v of activeVehicles) {
          v.isBurning = false;
          v.speed = v.baseSpeed || 1.0;
        }
        isRioting = false;
        setIsRiotActive(false);
      } else {
        const totalParked = Math.min(
          houseCarAssignments.length,
          Math.round((configRef.current.householdCarsPerHome + configRef.current.visitorPassesPerHome) * 6)
        );
        // Collect parked cars strictly ON THE ROAD (y >= 90). Driveway cars (y < 70) NEVER burn.
        const roadCars: number[] = [];
        for (let i = 0; i < totalParked; i++) {
          const car = houseCarAssignments[activeIndices[i]];
          if (car && car.y >= 90) roadCars.push(i);
        }
        if (roadCars.length > 0) {
          flippedCars.add(roadCars[0]);
        } else if (activeVehicles.length > 0) {
          activeVehicles[0].isBurning = true;
          activeVehicles[0].speed = 0;
        }
        isRioting = true;
        setIsRiotActive(true);
        if (soundEnabledRef.current) playCriticalAlarm();
      }
    };

    handleCanvasClickRef.current = (clickX: number, clickY: number) => {
      const totalParked = Math.min(
        houseCarAssignments.length,
        Math.round((configRef.current.householdCarsPerHome + configRef.current.visitorPassesPerHome) * 6)
      );

      // 1. Check if user clicked on any car ON THE ROAD (curbside stall)
      for (let i = 0; i < totalParked; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        if (car && car.y >= 90) { // STRICTLY ON THE ROAD
          const pos = project(car.x + 8, car.y + 3.5, 3);
          if (Math.hypot(clickX - pos.x, clickY - pos.y) < 32) {
            if (flippedCars.has(i)) {
              flippedCars.delete(i);
              if (flippedCars.size === 0 && !activeVehicles.some(v => v.isBurning)) {
                isRioting = false;
                setIsRiotActive(false);
              }
            } else {
              flippedCars.add(i);
              isRioting = true;
              setIsRiotActive(true);
              
              if (soundEnabledRef.current) playCriticalAlarm();
            }
            return;
          }
        }
      }

      // 2. Check if user clicked on moving road traffic vehicle
      for (let v of activeVehicles) {
        const pos = project(v.x + 8, v.y + 3.5, 3);
        if (Math.hypot(clickX - pos.x, clickY - pos.y) < 32) {
          v.isBurning = !v.isBurning;
          if (v.isBurning) {
            v.speed = 0;
            isRioting = true;
            setIsRiotActive(true);
            if (soundEnabledRef.current) playCriticalAlarm();
          } else {
            v.speed = v.baseSpeed || 1.0;
            if (flippedCars.size === 0 && !activeVehicles.some(veh => veh.isBurning)) {
              isRioting = false;
              setIsRiotActive(false);
            }
          }
          return;
        }
      }

      // 3. Driveway cars (y < 70) and elsewhere: play honk (driveway cars cannot burn!)
      playHonk('sedan');
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [playHonk, playCriticalAlarm]);

  const activeHouseholdCars = Math.round(config.householdCarsPerHome * 6);
  const activeVisitorCars = Math.round(config.visitorPassesPerHome * 6);
  const totalWeeklyDeliveries = Math.round(config.deliveriesPerHomePerWeek * 6);

  const getGaugeStatusColor = () => {
    if (curbsidePct >= 150) return 'text-[#E8552D] bg-[#E8552D]/10 border-[#E8552D]/40';
    if (curbsidePct >= 90) return 'text-[#FFC72C] bg-[#FFC72C]/10 border-[#FFC72C]/40';
    return 'text-[#009A44] bg-[#009A44]/10 border-[#009A44]/40';
  };

  return (
    <div
      ref={containerRef}
      id="simulation-view-container"
      className="relative w-full h-full min-h-0 flex items-center justify-center bg-[#193A5A] overflow-hidden select-none"
    >
      {/* 2.5D Isometric Main Stage */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-0.5 sm:p-1 overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          id="cityCanvas"
          width={1200}
          height={800}
          className="w-full h-full max-h-[100%] object-contain rounded-lg shadow-2xl block cursor-crosshair origin-center"
          style={{ transform: `scale(${zoomScale})` }}
          title="Live Edmonton Multimodal Neighborhood Simulation - Click road cars to toggle fire, click elsewhere to honk"
          role="img"
          aria-label="Live 2.5D Isometric Neighborhood Simulation showing residential parking, driveways, and road traffic based on the active policy settings."
          onClick={(e) => {
            getAudioContext();
            // Resume riot audio if it was blocked by autoplay policies
            if (window.__riotAudioPending && window.__riotAudio) {
              window.__riotAudio.play().catch(err => console.warn('Riot audio still blocked', err));
              window.__riotAudioPending = false;
            }
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;
            handleCanvasClickRef.current?.(clickX, clickY);
          }}
        >
          <p>Your browser does not support the canvas element needed to render the neighborhood simulation.</p>
        </canvas>

        
        {/* Good News Harmony Overlay */}
        {isHarmonyActive && !isRiotActive && (
          <div
            id="harmony-overlay"
            className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between overflow-hidden rounded-lg"
          >
            <div className="m-2 sm:m-4 flex items-center gap-2 sm:gap-3 bg-white/95 border-l-4 border-[#009A44] px-2.5 py-1 sm:px-4 sm:py-2 rounded shadow-2xl max-w-max">
              <span className="bg-[#009A44] text-white font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded">
                ⭐ EXCELLENCE
              </span>
              <span className="text-[#004B8D] text-[10px] sm:text-xs md:text-sm font-bold tracking-wider">
                CITY PLANNING COMMENDATION
              </span>
            </div>

            <div className="w-full bg-[#009A44]/95 border-t-2 sm:border-t-4 border-[#FFC72C] shadow-2xl flex flex-col justify-between box-border">
              <div className="bg-[#FFC72C] text-[#111] text-[9px] sm:text-xs font-black px-2.5 py-0.5 sm:px-4 sm:py-1 tracking-widest flex items-center gap-1.5 uppercase border-b border-white/20">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> AWARD: OPTIMAL CURB MANAGEMENT
              </div>
              <div className="px-2.5 py-1 sm:px-4 sm:py-1.5">
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-wide m-0 truncate">
                  NEIGHBORHOOD ACHIEVES PERFECT TRAFFIC HARMONY
                </h4>
                <p className="text-[#b3ffd1] text-[9px] sm:text-xs font-bold m-0 truncate">
                  SMART POLICIES KEEP STREETS CLEAR • BUSINESSES BOOMING • RESIDENTS HAPPY
                </p>
              </div>
              <div className="w-full h-5 sm:h-6 bg-white border-t border-[#004B8D] flex items-center overflow-hidden">
                <div className="bg-[#004B8D] text-white font-black text-[9px] px-2 h-full flex items-center whitespace-nowrap z-10">
                  REPORTER
                </div>
                <div className="text-[#004B8D] text-[9px] sm:text-[10px] font-bold px-2 whitespace-nowrap overflow-hidden flex-1 h-full flex items-center">
                  <span className="inline-block animate-marquee uppercase">
                    "It's beautiful out here. Delivery vans have space, visitors are finding spots easily, and the air is clear. A masterclass in urban planning!"
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Breaking News Riot Overlay (appears at critical overload or vehicle fire) */}
        {isRiotActive && (
          <div
            id="news-overlay"
            className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between overflow-hidden rounded-lg"
          >
            {/* Top Live Badge */}
            <div className="m-2 sm:m-4 flex items-center gap-2 sm:gap-3 bg-black/85 border-l-4 border-[#E8552D] px-2.5 py-1 sm:px-4 sm:py-2 rounded shadow-2xl max-w-max">
              <span className="bg-[#E8552D] text-white font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded animate-pulse">
                🔴 LIVE
              </span>
              <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-wider">
                EDMONTON NEWS • INCIDENT REPORT
              </span>
            </div>

            {/* Bottom Breaking News Bar */}
            <div className="w-full bg-[#11283f]/95 border-t-2 sm:border-t-4 border-[#E8552D] shadow-2xl flex flex-col justify-between box-border">
              <div className="bg-[#E8552D] text-white text-[9px] sm:text-xs font-black px-2.5 py-0.5 sm:px-4 sm:py-1 tracking-widest flex items-center gap-1.5 uppercase border-b border-[#FFC72C]">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> BREAKING: ROADWAY VEHICLE FIRE & DEMONSTRATION
              </div>
              <div className="px-2.5 py-1 sm:px-4 sm:py-1.5">
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-wide m-0 truncate">
                  CAR BURNING ON ROADWAY • PROTESTERS BLOCKING TRAFFIC
                </h4>
                <p className="text-[#FFC72C] text-[9px] sm:text-xs font-bold m-0 truncate">
                  PROTESTERS ASSEMBLED IN ROAD LANES • BYSTANDERS OBSERVING SAFELY FROM SIDEWALK
                </p>
              </div>
              <div className="w-full h-5 sm:h-6 bg-black border-t border-[#0081BC] flex items-center overflow-hidden">
                <div className="bg-[#FFC72C] text-[#111] font-black text-[9px] px-2 h-full flex items-center whitespace-nowrap z-10">
                  TICKER
                </div>
                <div className="whitespace-nowrap text-[10px] sm:text-xs font-bold text-white animate-marquee pl-4">
                  ⚠️ VEHICLE BURNING ON ROADWAY — PROTESTERS GATHER ON ROAD STOPPING TRAFFIC — BYSTANDERS SAFELY ON SIDEWALK — DRIVEWAYS UNAFFECTED — ⚠️
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Audio Event Alert (accessible indicator for non-auditory and muted users) */}
        {visualAudioAlert && (
          <div
            role="status"
            aria-live="polite"
            className="absolute top-2 left-1/2 -translate-x-1/2 z-35 bg-[#11283f]/95 border-2 border-[#FFC72C] text-white px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold pointer-events-none backdrop-blur-md"
          >
            <span className="text-sm">
              {visualAudioAlert.icon === 'siren' ? '🚨' : visualAudioAlert.icon === 'alarm' ? '⚠️' : '📢'}
            </span>
            <span className="tracking-wide text-[#FFC72C]">{visualAudioAlert.text}</span>
          </div>
        )}

        {/* Top Right HUD: Audio + Gauge + Manual Controls Toggle */}
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-20 flex flex-col items-stretch gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 p-0.5 sm:p-1.5 rounded-md sm:rounded-lg shadow-lg">
            {/* Audio Toggle */}
            <button
              type="button"
              id="audio-toggle-btn"
              onClick={() => {
                getAudioContext();
                feedback.toggleSound();
              }}
              title={soundEnabled ? 'Mute Simulation & City Traffic Noise' : 'Enable City Traffic Ambience (5%) & SFX (15%)'}
              className={`min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-md transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
                soundEnabled
                  ? 'bg-[#0081BC] text-white hover:bg-[#005087]'
                  : 'bg-black/40 text-gray-400 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Manual Controls Toggle */}
            <button
              type="button"
              id="manual-controls-toggle"
              onClick={() => {
                triggerFeedback('button');
                setShowControls((prev) => !prev);
              }}
              title="Toggle Manual Simulation Sliders"
              aria-expanded={showControls}
              aria-controls="manual-sliders-drawer"
              className={`min-h-[44px] min-w-[44px] px-2.5 sm:px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
                showControls
                  ? 'bg-[#0081BC] text-white'
                  : 'bg-black/40 text-gray-300 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Controls</span>
            </button>

            {/* Reshuffle */}
            <button
              type="button"
              id="reshuffle-sim-btn"
              onClick={() => {
                triggerFeedback('button');
                handleReshuffle();
              }}
              title="Randomize Parking Distribution"
              aria-label="Randomize Parking Distribution"
              className="min-h-[44px] min-w-[44px] p-2 rounded-md bg-black/40 text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Curbside Dial Gauge - with clear legible typography */}
          <div
            id="hud-gauge-widget"
            className={`bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 p-1 sm:p-2 rounded-md sm:rounded-lg shadow-lg flex flex-col items-center transition-all landscape:max-sm:scale-50 landscape:max-sm:origin-top-right landscape:max-sm:-mb-[35px] ${
              curbsidePct >= 150 ? 'animate-bounce border-[#E8552D]' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full text-[10px] sm:text-xs font-bold text-gray-200 mb-0.5 sm:mb-1 gap-1">
              <span className="hidden xs:inline">Curbside</span>
              <span className={`px-1.5 py-0.5 rounded border text-[10px] sm:text-xs font-bold ${getGaugeStatusColor()}`}>
                {curbsidePct}%
              </span>
            </div>
            <canvas ref={gaugeCanvasRef} width={120} height={60} className="w-full h-auto block" />
            <span className="text-[10px] sm:text-xs font-semibold text-gray-200 mt-0.5 whitespace-nowrap">
              {curbsideDemandCount}/{TOTAL_LEGAL_CURBSIDE_STALLS} Cars
            </span>
          </div>

          {/* Manual Sliders Overlay Drawer */}
          {showControls && (
            <div
              id="manual-sliders-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="manual-sliders-title"
              className="bg-[#11283f]/95 backdrop-blur-md border border-[#0081BC]/50 p-3 sm:p-3.5 rounded-xl shadow-2xl w-[calc(100vw-20px)] max-w-[280px] sm:w-72 max-h-[80vh] md:max-h-[85%] overflow-y-auto flex flex-col gap-2 text-xs text-white z-40"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <span id="manual-sliders-title" className="font-bold text-[#FFC72C] flex items-center gap-1.5 text-xs sm:text-sm">
                  <Sliders className="w-4 h-4" /> Manual Sliders
                </span>
                <button
                  type="button"
                  aria-label="Close manual sliders"
                  onClick={() => {
                    triggerFeedback('button');
                    setShowControls(false);
                  }}
                  className="text-gray-400 hover:text-white flex items-center justify-center min-w-[44px] min-h-[44px] font-bold text-base cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] rounded"
                >
                  ✕
                </button>
              </div>

              {/* Cars per household */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between">
                  <span className="text-gray-300">Cars/Home</span>
                  <span className="font-bold text-[#FFC72C]">
                    {config.householdCarsPerHome.toFixed(1)} ({activeHouseholdCars})
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Cars per household"
                  min="0"
                  max="5"
                  step="0.25"
                  value={config.householdCarsPerHome}
                  onChange={(e) =>
                    onConfigChange?.({ householdCarsPerHome: parseFloat(e.target.value) })
                  }
                  className="accent-[#0081BC] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Visitor parking passes */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between">
                  <span className="text-gray-300">Visitor Passes</span>
                  <span className="font-bold text-white">
                    {config.visitorPassesPerHome.toFixed(1)} ({activeVisitorCars})
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Visitor passes per home"
                  min="0"
                  max="5"
                  step="0.25"
                  value={config.visitorPassesPerHome}
                  onChange={(e) =>
                    onConfigChange?.({ visitorPassesPerHome: parseFloat(e.target.value) })
                  }
                  className="accent-[#0081BC] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Driveway Capacity */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between">
                  <span className="text-gray-300">Driveway Spots</span>
                  <span className="font-bold text-[#009A44]">
                    {config.drivewayCapacity <= 1 ? '1 Car' : '2 Cars (Tandem)'}
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Driveway capacity (spots)"
                  min="1"
                  max="2"
                  step="1"
                  value={Math.min(2, Math.max(1, config.drivewayCapacity))}
                  onChange={(e) =>
                    onConfigChange?.({ drivewayCapacity: parseInt(e.target.value, 10) })
                  }
                  className="accent-[#009A44] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Deliveries Per Home */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between">
                  <span className="text-gray-300">Weekly Deliveries</span>
                  <span className="font-bold text-[#FF5500]">
                    {config.deliveriesPerHomePerWeek.toFixed(1)} ({totalWeeklyDeliveries}/wk)
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Weekly deliveries per home"
                  min="1"
                  max="4"
                  step="0.25"
                  value={config.deliveriesPerHomePerWeek}
                  onChange={(e) =>
                    onConfigChange?.({ deliveriesPerHomePerWeek: parseFloat(e.target.value) })
                  }
                  className="accent-[#FF5500] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#0081BC]" />
                  {config.enforcementLevel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerFeedback('button');
                      toggleRoadFire();
                    }}
                    className={`px-2 py-1 min-h-[44px] rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
                      isRiotActive
                        ? 'bg-[#E8552D] text-white hover:bg-[#c2410c] animate-pulse'
                        : 'bg-gray-800 text-[#FFC72C] hover:bg-gray-700 hover:text-white border border-gray-600'
                    }`}
                    title={isRiotActive ? 'Extinguish Road Car Fire' : 'Ignite Road Car Fire (Protesters block road, bystanders on sidewalk)'}
                  >
                    <Flame className="w-3 h-3 text-[#FFC72C]" />
                    {isRiotActive ? 'Extinguish' : 'Road Fire'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerFeedback('button');
                      handleReshuffle();
                    }}
                    className="text-[#FFC72C] hover:underline font-semibold cursor-pointer active:scale-95 px-2 min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] rounded"
                  >
                    Reshuffle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls (Bottom Left) */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 flex flex-col gap-1 bg-black/60 backdrop-blur-sm p-1 rounded-lg border border-white/10">
          <button 
            type="button"
            onClick={() => setZoomScale(s => Math.min(4, s + 0.25))}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 active:bg-white/30 rounded font-bold text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            +
          </button>
          <button 
            type="button"
            onClick={() => setZoomScale(1.33)}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 active:bg-white/30 rounded font-bold text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            title="Reset Camera View (Default 1.33x)"
            aria-label="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 active:bg-white/30 rounded font-bold text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            -
          </button>
        </div>


      </div>
    </div>
  );
};
