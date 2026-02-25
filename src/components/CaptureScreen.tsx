import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw } from "lucide-react";
import { Category } from "../types";

interface CaptureScreenProps {
  categories: Category[];
  onCapture: (imageSrc: string, manualCategory?: Category) => void;
}

export function CaptureScreen({ categories, onCapture }: CaptureScreenProps) {
  const webcamRef = useRef<Webcam>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const category = categories.find((c) => c.id === Number(selectedCategoryId));
      onCapture(imageSrc, category);
    }
  }, [webcamRef, selectedCategoryId, categories, onCapture]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      <div className="flex-1 relative overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          className="absolute inset-0 w-full h-full object-cover"
          disablePictureInPicture={false}
          forceScreenshotSourceSize={false}
          imageSmoothing={true}
          mirrored={false}
          screenshotQuality={0.92}
          onUserMedia={() => {}}
          onUserMediaError={() => {}}
        />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={toggleCamera}
            className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 bg-zinc-900 rounded-t-3xl -mt-6 z-20 flex flex-col gap-4 shadow-xl border-t border-zinc-800">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400 font-medium ml-1">
            Manual Category (Optional)
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">Auto-Detect</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={capture}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <Camera className="w-6 h-6" />
          Scan Object
        </button>
      </div>
    </div>
  );
}
