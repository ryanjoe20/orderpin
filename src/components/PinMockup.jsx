import { useEffect, useRef, useState } from 'react';
import { PIN_SIZES } from '../utils/constants';

const PinMockup = ({ imageFile, sizeId, onTransformChange }) => {
    const canvasRef = useRef(null);
    const sizeConfig = PIN_SIZES[sizeId];
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Notify parent of transform changes if needed (e.g., for saving state)
        if (onTransformChange) {
            onTransformChange(transform);
        }
    }, [transform, onTransformChange]);

    useEffect(() => {
        // Reset transform when image changes
        setTransform({ scale: 1, x: 0, y: 0 });
    }, [imageFile]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !sizeConfig) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background placeholder if no image
        if (!imageFile) {
            drawPlaceholder(ctx, width, height, sizeConfig);
            return;
        }

        // Load and draw image
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        img.onload = () => {
            drawPin(ctx, img, width, height, sizeConfig, transform);
            URL.revokeObjectURL(img.src);
        };

    }, [imageFile, sizeId, sizeConfig, transform]);

    // --- Drawing Logic ---

    const drawPlaceholder = (ctx, w, h, config) => {
        const centerX = w / 2;
        const centerY = h / 2;
        const outerRadius = Math.min(w, h) / 2 - 10;
        const innerRadius = outerRadius * (config.innerDiameterCm / config.outerDiameterCm);

        // Draw Outer Circle (Cut Line)
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#f3f4f6'; // Light gray
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Inner Circle (Face)
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();

        // Text Instructions
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Area Pin', centerX, centerY - 10);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Drag & Zoom to Adjust', centerX, centerY + 10);
    };

    const drawPin = (ctx, img, w, h, config, t) => {
        const centerX = w / 2;
        const centerY = h / 2;
        const outerRadius = Math.min(w, h) / 2 - 10;
        const innerRadius = outerRadius * (config.innerDiameterCm / config.outerDiameterCm);

        // Clip Outer Circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.clip();

        // -- Image Transformation --
        // Calculate scaling to cover the outer radius initially
        const baseScale = Math.max((outerRadius * 2) / img.width, (outerRadius * 2) / img.height);
        const finalScale = baseScale * t.scale;
        const imgW = img.width * finalScale;
        const imgH = img.height * finalScale;

        // Center + user offset
        const dx = centerX - imgW / 2 + t.x;
        const dy = centerY - imgH / 2 + t.y;

        ctx.drawImage(img, dx, dy, imgW, imgH);
        ctx.restore();

        // -- Overlays --

        // Bleed Area (Darken slightly to show cut line area logic)
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2); // Outer
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true); // Substract Inner
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        ctx.restore();

        // Cut Line
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Face Guide
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Gloss Effect
        const gradient = ctx.createLinearGradient(centerX - outerRadius, centerY - outerRadius, centerX + outerRadius, centerY + outerRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    };

    // --- Interaction Handlers ---

    const handleWheel = (e) => {
        e.preventDefault();
        const scaleFactor = 0.1;
        const newScale = Math.max(0.5, Math.min(5, transform.scale - Math.sign(e.deltaY) * scaleFactor));
        setTransform(prev => ({ ...prev, scale: newScale }));
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastPos.x;
        const deltaY = e.clientY - lastPos.y;
        setTransform(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 select-none">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className={`max-w-full h-auto drop-shadow-xl cursor-move ${!imageFile ? 'cursor-default' : ''}`}
                onWheel={imageFile ? handleWheel : undefined}
                onMouseDown={imageFile ? handleMouseDown : undefined}
                onMouseMove={imageFile ? handleMouseMove : undefined}
                onMouseUp={imageFile ? handleMouseUp : undefined}
                onMouseLeave={imageFile ? handleMouseUp : undefined}
            />

            {imageFile && (
                <div className="w-full mt-4 px-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Zoom</span>
                        <span>{(transform.scale * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={transform.scale}
                        onChange={(e) => setTransform({ ...transform, scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="text-center text-xs text-gray-400 pt-1">
                        Scroll or Drag to adjust
                    </div>
                </div>
            )}

            {!imageFile && (
                <p className="mt-4 text-sm text-gray-500 font-medium">
                    Preview ({sizeConfig.label})
                </p>
            )}
        </div>
    );
};

export default PinMockup;
