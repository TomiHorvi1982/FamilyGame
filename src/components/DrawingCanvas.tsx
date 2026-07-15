import { useRef, useState, useEffect } from "react";
import { Trash2, RotateCcw, Paintbrush, Square } from "lucide-react";

interface DrawingCanvasProps {
  id?: string;
  onSave?: (dataUrl: string) => void;
  placeholderText?: string;
}

export default function DrawingCanvas({
  id = "drawing-canvas",
  placeholderText = "Zde můžeš kreslit nebo psát svůj tip...",
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#3b82f6"); // Default blue
  const [lineWidth, setLineWidth] = useState(5);
  const [history, setHistory] = useState<string[]>([]);
  const [isCanvasBlank, setIsCanvasBlank] = useState(true);

  // Brush colors palette
  const colors = [
    { name: "Modrá", value: "#3b82f6" },
    { name: "Červená", value: "#ef4444" },
    { name: "Zelená", value: "#10b981" },
    { name: "Žlutá", value: "#f59e0b" },
    { name: "Fialová", value: "#8b5cf6" },
    { name: "Černá", value: "#1f2937" },
  ];

  // Adjust canvas size when container resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Save current content
      const tempImage = new Image();
      const currentDataUrl = canvas.toDataURL();
      tempImage.src = currentDataUrl;

      // Update dimensions based on container
      canvas.width = container.clientWidth;
      canvas.height = Math.max(container.clientHeight, 220);

      // Re-draw saved content
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        tempImage.onload = () => {
          ctx.drawImage(tempImage, 0, 0);
        };
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    setIsDrawing(true);
    setIsCanvasBlank(false);

    // Save history point
    setHistory((prev) => [...prev, canvas.toDataURL()]);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsCanvasBlank(true);
    setHistory([]);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevHistory = [...history];
    const lastState = prevHistory.pop();
    setHistory(prevHistory);

    if (lastState) {
      const img = new Image();
      img.src = lastState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setIsCanvasBlank(false);
      };
    } else {
      clearCanvas();
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" id={id}>
      {/* Tool bar */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-slate-50 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-1.5">
          <Paintbrush className="w-4 h-4 text-slate-500 mr-1" />
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`w-6 h-6 rounded-full border transition-all ${
                  color === c.value
                    ? "ring-2 ring-offset-1 ring-slate-400 scale-110 border-transparent"
                    : "border-slate-300 hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Thickness picker */}
          <div className="flex items-center gap-1 mr-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase">Tloušťka:</span>
            <input
              type="range"
              min="2"
              max="15"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 accent-slate-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
            />
            <span className="text-xs font-mono text-slate-500 w-4 text-right">{lineWidth}</span>
          </div>

          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="p-1.5 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 rounded-md transition-colors"
            title="Zpět"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
            title="Smazat vše"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 bg-slate-50/50 min-h-[220px] cursor-crosshair">
        {isCanvasBlank && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none select-none">
            <Square className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-xs font-medium text-slate-400">{placeholderText}</p>
            <p className="text-[10px] text-slate-400 mt-1">Funguje skvěle i na tabletu či mobilu prstem!</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full h-full"
        />
      </div>
    </div>
  );
}
