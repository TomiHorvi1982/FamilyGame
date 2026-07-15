import { useRef, useState, useEffect } from "react";
import { CATEGORIES, Category } from "../data/cards";
import { Compass, Play } from "lucide-react";

interface SpinningWheelProps {
  onSpinComplete: (category: Category) => void;
  isSpinning: boolean;
  setIsSpinning: (isSpinning: boolean) => void;
}

export default function SpinningWheel({
  onSpinComplete,
  isSpinning,
  setIsSpinning,
}: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngleRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play a dynamic tick sound using Web Audio API
  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio context might be blocked or not supported, ignore
    }
  };

  // Draw the wheel onto the canvas
  const drawWheel = (ctx: CanvasRenderingContext2D, size: number, angleOffset: number) => {
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    // Draw outer glow and border
    ctx.shadowColor = "rgba(100, 116, 139, 0.25)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1e293b"; // Slate-800
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    const numSlices = CATEGORIES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    CATEGORIES.forEach((category, i) => {
      const startAngle = i * sliceAngle + angleOffset;
      const endAngle = startAngle + sliceAngle;

      // Draw slice background
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Mapping color codes to hex for canvas drawing
      let fillStyle = "#6b7280"; // Gray fallback
      if (category.id === "zlate_vzpominky") fillStyle = "#f59e0b"; // Amber-500
      else if (category.id === "moje_super_ja") fillStyle = "#3b82f6"; // Blue-500
      else if (category.id === "co_by_bylo_kdyby") fillStyle = "#a855f7"; // Purple-500
      else if (category.id === "rodinna_vyzva") fillStyle = "#f43f5e"; // Rose-500
      else if (category.id === "tajne_sny") fillStyle = "#10b981"; // Emerald-500

      ctx.fillStyle = fillStyle;
      ctx.fill();

      // Divider lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Text labels
      ctx.save();
      ctx.translate(center, center);
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);
      
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Inter, sans-serif";

      // Truncate or fit text
      ctx.fillText(category.title, radius - 25, 5);
      ctx.restore();
    });

    // Draw central hub
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Small inner circle
    ctx.beginPath();
    ctx.arc(center, center, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
  };

  // Setup initial drawing and canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeAndDraw = () => {
      const size = 320; // Fixed size for absolute precision
      canvas.width = size;
      canvas.height = size;
      drawWheel(ctx, size, currentAngleRef.current);
    };

    resizeAndDraw();
  }, []);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Spin config
    const spinDuration = 3200; // ms
    const startTime = performance.now();
    
    // Choose a random winning angle
    const totalSectors = CATEGORIES.length;
    const sectorAngle = (Math.PI * 2) / totalSectors;
    
    // Add multiple full spins (5-8 spins) + random offset
    const currentAngle = currentAngleRef.current % (Math.PI * 2);
    const minSpins = 4;
    const extraSpins = minSpins * Math.PI * 2;
    const targetOffset = Math.random() * Math.PI * 2;
    const totalSpinRotation = extraSpins + targetOffset;

    let lastTickSector = -1;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Quadratic ease-out deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);

      const angle = currentAngle + easedProgress * totalSpinRotation;
      currentAngleRef.current = angle;

      drawWheel(ctx, 320, angle);

      // Audio tick calculation: which sector is currently passing the pointer (top: angle = -Math.PI / 2)
      // The pointer is at the very top (angle of -Math.PI/2 relative to standard 0)
      const relativePointerAngle = (1.5 * Math.PI - angle) % (Math.PI * 2);
      const positivePointerAngle = relativePointerAngle < 0 ? relativePointerAngle + Math.PI * 2 : relativePointerAngle;
      const currentSector = Math.floor(positivePointerAngle / sectorAngle) % totalSectors;

      if (currentSector !== lastTickSector) {
        playTickSound();
        lastTickSector = currentSector;
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin finished!
        setIsSpinning(false);

        // Calculate final winner
        // Pointer is at the top (which corresponds to an angle offset of -90deg or 270deg on canvas coordinates)
        // Draw Sector 0 goes from startAngle to endAngle.
        // Formula: pointer position is at angle -Math.PI/2 (top). We want to find which sector i covers this pointer position.
        const normalizedAngle = (3 * Math.PI / 2 - angle) % (Math.PI * 2);
        const finalWinnerAngle = normalizedAngle < 0 ? normalizedAngle + Math.PI * 2 : normalizedAngle;
        const winnerIndex = Math.floor(finalWinnerAngle / sectorAngle) % totalSectors;
        
        onSpinComplete(CATEGORIES[winnerIndex]);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Outer wrapper with pointing arrow */}
      <div className="relative p-6 bg-slate-100 rounded-full border border-slate-200/60 shadow-inner flex items-center justify-center">
        {/* Pointer Arrow at the Top */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-slate-800 drop-shadow-md" />
        </div>

        {/* Wheel Canvas */}
        <canvas
          ref={canvasRef}
          className="relative select-none max-w-full"
          style={{ width: "320px", height: "320px" }}
        />

        {/* Spin action overlay in center */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`absolute z-10 w-16 h-16 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-white shadow-lg text-slate-800 font-bold transition-transform cursor-pointer select-none active:scale-95 ${
            isSpinning
              ? "opacity-80 scale-95 cursor-not-allowed"
              : "hover:scale-105 hover:bg-slate-50"
          }`}
        >
          <Play className={`w-6 h-6 text-slate-800 fill-current ${isSpinning ? "animate-pulse" : ""}`} />
          <span className="text-[10px] uppercase font-bold tracking-wider -mt-1">TOČ!</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 font-medium text-center mt-3">
        Klikni na <span className="font-bold text-slate-600">TOČ!</span> uprostřed nebo zatoč ruletou.
      </p>
    </div>
  );
}
