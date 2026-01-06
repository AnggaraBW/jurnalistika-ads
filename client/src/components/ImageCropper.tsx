import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageCropperProps {
  isOpen: boolean;
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
}

const ASPECT_RATIOS = [
  { label: "Banner (16:9)", ratio: 16 / 9 },
  { label: "Square (1:1)", ratio: 1 },
  { label: "Portrait (3:4)", ratio: 3 / 4 },
  { label: "Sidebar (1:2.5)", ratio: 1 / 2.5 },
];

export default function ImageCropper({
  isOpen,
  imageUrl,
  onCropComplete,
  onClose,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [selectedRatio, setSelectedRatio] = useState(0);
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string>("");

  useEffect(() => {
    if (isOpen && imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        if (imgRef.current) {
          imgRef.current.src = imageUrl;
          const maxWidth = 500;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          if (imgRef.current) {
            imgRef.current.width = width;
            imgRef.current.height = height;
          }

          // Initialize crop area with selected ratio
          const ratio = ASPECT_RATIOS[selectedRatio].ratio;
          const cropWidth = Math.min(width * 0.8, width);
          const cropHeight = cropWidth / ratio;
          setCropArea({
            x: (width - cropWidth) / 2,
            y: (height - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight,
          });
        }
      };
    }
  }, [isOpen, imageUrl, selectedRatio]);

  useEffect(() => {
    if (!isOpen || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;

    const img = imgRef.current;
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area to show full image
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw crop box border
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = "#4f46e5";
    const corners = [
      [cropArea.x, cropArea.y],
      [cropArea.x + cropArea.width, cropArea.y],
      [cropArea.x, cropArea.y + cropArea.height],
      [cropArea.x + cropArea.width, cropArea.y + cropArea.height],
    ];
    corners.forEach((corner) => {
      ctx.fillRect(
        corner[0] - handleSize / 2,
        corner[1] - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  }, [cropArea, isOpen]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handleSize = 15;
    const tolerance = 20;

    // Check if clicking on handles
    if (
      Math.abs(x - cropArea.x) < tolerance &&
      Math.abs(y - cropArea.y) < tolerance
    ) {
      setDragType("top-left");
      setIsDragging(true);
    } else if (
      Math.abs(x - (cropArea.x + cropArea.width)) < tolerance &&
      Math.abs(y - cropArea.y) < tolerance
    ) {
      setDragType("top-right");
      setIsDragging(true);
    } else if (
      Math.abs(x - cropArea.x) < tolerance &&
      Math.abs(y - (cropArea.y + cropArea.height)) < tolerance
    ) {
      setDragType("bottom-left");
      setIsDragging(true);
    } else if (
      Math.abs(x - (cropArea.x + cropArea.width)) < tolerance &&
      Math.abs(y - (cropArea.y + cropArea.height)) < tolerance
    ) {
      setDragType("bottom-right");
      setIsDragging(true);
    } else if (
      x > cropArea.x &&
      x < cropArea.x + cropArea.width &&
      y > cropArea.y &&
      y < cropArea.y + cropArea.height
    ) {
      setDragType("move");
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ratio = ASPECT_RATIOS[selectedRatio].ratio;
    const minSize = 50;

    let newCrop = { ...cropArea };

    if (dragType === "move") {
      newCrop.x = x - cropArea.width / 2;
      newCrop.y = y - cropArea.height / 2;
    } else if (dragType === "top-left") {
      newCrop.width = cropArea.x + cropArea.width - x;
      newCrop.height = newCrop.width / ratio;
      newCrop.x = x;
      newCrop.y = cropArea.y + cropArea.height - newCrop.height;
    } else if (dragType === "top-right") {
      newCrop.width = x - cropArea.x;
      newCrop.height = newCrop.width / ratio;
      newCrop.y = cropArea.y + cropArea.height - newCrop.height;
    } else if (dragType === "bottom-left") {
      newCrop.width = cropArea.x + cropArea.width - x;
      newCrop.height = newCrop.width / ratio;
      newCrop.x = x;
    } else if (dragType === "bottom-right") {
      newCrop.width = x - cropArea.x;
      newCrop.height = newCrop.width / ratio;
    }

    // Constraints
    if (newCrop.width < minSize) newCrop.width = minSize;
    if (newCrop.height < minSize) newCrop.height = minSize;
    if (newCrop.x < 0) newCrop.x = 0;
    if (newCrop.y < 0) newCrop.y = 0;
    if (newCrop.x + newCrop.width > canvas.width) {
      newCrop.x = canvas.width - newCrop.width;
    }
    if (newCrop.y + newCrop.height > canvas.height) {
      newCrop.y = canvas.height - newCrop.height;
    }

    setCropArea(newCrop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType("");
  };

  const handleCrop = () => {
    if (!imgRef.current) return;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;
    const ctx = cropCanvas.getContext("2d");

    if (ctx && imgRef.current) {
      ctx.drawImage(
        imgRef.current,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      const croppedImage = cropCanvas.toDataURL("image/jpeg", 0.95);
      onCropComplete(croppedImage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Potong Gambar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs
            value={selectedRatio.toString()}
            onValueChange={(v) => setSelectedRatio(parseInt(v))}
          >
            <TabsList className="grid w-full grid-cols-4">
              {ASPECT_RATIOS.map((r, idx) => (
                <TabsTrigger
                  key={idx}
                  value={idx.toString()}
                  className="text-xs"
                >
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex justify-center bg-muted rounded-lg p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair border border-border"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
          </div>

          <div className="hidden">
            <img ref={imgRef} alt="crop preview" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleCrop}>Potong & Gunakan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
