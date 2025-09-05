import React, { useState, useRef, useEffect } from 'react';
import { ReactCrop, type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  aspect: number; // 1 for profile (square), 3 for banner (3:1 ratio)
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

const ImageCropper = ({ imageSrc, aspect, onClose, onCropComplete }: ImageCropperProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  function handleCrop() {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      alert('Could not crop image. Please try again.');
      return;
    }

    const canvas = previewCanvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      const croppedFile = new File([blob], 'cropped_image.jpeg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(croppedFile);
      onCropComplete(croppedFile, previewUrl);
      onClose();
    }, 'image/jpeg');
  }

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) return;
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height
    );
  }, [completedCrop]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[110] p-4">
      <div className="max-w-xl w-full bg-zinc-800 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white">Crop your image</h3>
        <div className="flex justify-center">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[60vh]"
            >
                <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="Crop preview" />
            </ReactCrop>
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-full text-white bg-zinc-600 hover:bg-zinc-500">Cancel</button>
            <button onClick={handleCrop} className="px-4 py-2 rounded-full font-semibold text-zinc-900 bg-white hover:bg-zinc-200">Apply</button>
        </div>
      </div>
      <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropper;

