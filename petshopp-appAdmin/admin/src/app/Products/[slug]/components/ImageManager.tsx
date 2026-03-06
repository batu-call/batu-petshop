"use client";
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Trash2, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

type ProductImage = { url: string; publicId: string; _id: string };

interface AdminImageManagerProps {
  images: ProductImage[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  newPreviews: string[];
  newFiles: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveNew: (index: number) => void;
  onDeleteExisting: (publicId: string, imageId: string) => void;
  productName: string;
}

// ── ZoomModal ──────────────────────────────────────────────────────────────
interface ZoomModalProps {
  images: ProductImage[];
  visibleImages: ProductImage[];
  productName: string;
  selectedImageIndex: number;
  setSelectedImageIndex: (i: number) => void;
  onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({
  images,
  visibleImages,
  productName,
  selectedImageIndex,
  setSelectedImageIndex,
  onClose,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const thumbnailRef = useRef<HTMLDivElement>(null);
  const zoomTouchStartX = useRef<number | null>(null);
  const zoomTouchStartY = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const el = thumbnailRef.current?.children[selectedImageIndex] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedImageIndex]);

  const handleClose = useCallback(() => { setTimeout(onClose, 0); }, [onClose]);

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (animating) return;
      setSlideDir(dir === "next" ? "left" : "right");
      setAnimating(true);
      setImgLoaded(false);
      setNaturalSize(null);
      setTimeout(() => {
        setSelectedImageIndex(
          dir === "next"
            ? selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
            : selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
        );
        setSlideDir(null);
        setAnimating(false);
      }, 220);
    },
    [animating, images.length, selectedImageIndex, setSelectedImageIndex]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, navigate]);

  const swipe = (sx: number | null, sy: number | null, ex: number, ey: number) => {
    if (!sx || !sy) return;
    const dx = ex - sx, dy = ey - sy;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    navigate(dx < 0 ? "next" : "prev");
  };

  const goToIndex = (index: number) => {
    if (index === selectedImageIndex || animating) return;
    setSlideDir(index > selectedImageIndex ? "left" : "right");
    setAnimating(true);
    setImgLoaded(false);
    setNaturalSize(null);
    setTimeout(() => {
      setSelectedImageIndex(index);
      setSlideDir(null);
      setAnimating(false);
    }, 220);
  };

  const currentImageUrl = images[selectedImageIndex]?.url || images[0]?.url;

  const calcBoxSize = useCallback((ns: { w: number; h: number } | null) => {
    if (typeof window === "undefined") return { width: 680, height: 460 };
    const maxW = Math.min(window.innerWidth * 0.82, 820);
    const maxH = Math.min(window.innerHeight * 0.72, 580);
    if (!ns) return { width: maxW, height: maxH };
    const ratio = ns.w / ns.h;
    let w = maxW, h = maxW / ratio;
    if (h > maxH) { h = maxH; w = maxH * ratio; }
    return { width: Math.round(w), height: Math.round(h) };
  }, []);

  const [boxSize, setBoxSize] = useState(() => calcBoxSize(null));

  useEffect(() => { setBoxSize(calcBoxSize(naturalSize)); }, [naturalSize, calcBoxSize]);
  useEffect(() => {
    const onResize = () => setBoxSize(calcBoxSize(naturalSize));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [naturalSize, calcBoxSize]);

  // ZoomModal keeps its own dark overlay + glass card — no change needed here
  // since it uses inline styles for its dark card background
  return (
    <>
      <style>{`
        @keyframes zm-bd   { from{opacity:0} to{opacity:1} }
        @keyframes zm-card { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes zm-sh   { from{background-position:-200% 0} to{background-position:200% 0} }
        .zm-bd    { animation: zm-bd   0.25s ease forwards; }
        .zm-card  { animation: zm-card 0.30s cubic-bezier(0.22,1,0.36,1) forwards; }
        .zm-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: zm-sh 1.4s infinite;
        }
        .zm-thumb-bar::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="fixed inset-0 zm-bd"
        style={{ zIndex: 50, backgroundColor: "rgba(5,7,6,0.93)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
        onClick={handleClose}
      />

      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 p-4 pointer-events-none" style={{ zIndex: 50 }}>
        <div
          className="zm-card pointer-events-auto flex flex-col"
          style={{
            background: "linear-gradient(150deg, #191e1a 0%, #0e1210 100%)",
            borderRadius: 22,
            boxShadow: "0 48px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(151,203,169,0.14), inset 0 1px 0 rgba(255,255,255,0.055)",
            overflow: "hidden",
            width: Math.max(boxSize.width + 32, 320),
            transition: "width 0.3s ease, height 0.3s ease",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase truncate max-w-[65%]" style={{ color: "rgba(151,203,169,0.55)" }}>
              {productName}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.22)" }}>
                {selectedImageIndex + 1}<span style={{ color: "rgba(255,255,255,0.1)" }}> / </span>{images.length}
              </span>
              <button
                onClick={handleClose}
                className="flex items-center justify-center rounded-full transition-all duration-150 hover:scale-105 active:scale-90"
                style={{ width: 28, height: 28, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.55)" }} />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ height: boxSize.height + 16 }}
            onTouchStart={(e) => { zoomTouchStartX.current = e.touches[0].clientX; zoomTouchStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => swipe(zoomTouchStartX.current, zoomTouchStartY.current, e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(151,203,169,0.055) 0%, transparent 70%)" }} />
            {!imgLoaded && <div className="absolute rounded-xl zm-shimmer" style={{ inset: "12px 40px" }} />}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                padding: "8px 40px",
                transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
                transform: slideDir ? `translateX(${slideDir === "left" ? -50 : 50}px)` : "translateX(0)",
                opacity: animating ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={currentImageUrl}
                  alt={productName}
                  fill
                  sizes="(max-width: 635px) 88vw, 820px"
                  priority
                  className="object-contain"
                  style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.22s ease", filter: "drop-shadow(0 10px 36px rgba(0,0,0,0.65))" }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                    setImgLoaded(true);
                  }}
                />
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button onClick={() => navigate("prev")} disabled={animating} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90 disabled:opacity-20" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", backdropFilter: "blur(6px)" }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
                <button onClick={() => navigate("next")} disabled={animating} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90 disabled:opacity-20" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", backdropFilter: "blur(6px)" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex-shrink-0 px-3 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
              <div ref={thumbnailRef} className="zm-thumb-bar flex gap-2 overflow-x-auto justify-center">
                {visibleImages.map((img, index) => (
                  <button
                    key={img._id || index}
                    onClick={() => goToIndex(index)}
                    className="relative flex-shrink-0 overflow-hidden transition-all duration-200 hover:opacity-80"
                    style={{
                      width: 50, height: 50, borderRadius: 9,
                      border: selectedImageIndex === index ? "2px solid #97cba9" : "2px solid rgba(255,255,255,0.07)",
                      opacity: selectedImageIndex === index ? 1 : 0.42,
                      background: "#161a17",
                      transform: selectedImageIndex === index ? "scale(1.08)" : "scale(1)",
                      outline: "none", cursor: "pointer",
                      boxShadow: selectedImageIndex === index ? "0 0 0 3px rgba(151,203,169,0.15)" : "none",
                    }}
                  >
                    <Image src={img.url} alt={`${index + 1}`} fill sizes="50px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && images.length <= 10 && (
          <div className="flex gap-1.5 pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToIndex(i)}
                style={{
                  width: i === selectedImageIndex ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === selectedImageIndex ? "#97cba9" : "rgba(255,255,255,0.18)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "width 0.25s ease, background 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// ── ImageManager ──────────────────────────────────────────────────────────
const ImageManager: React.FC<AdminImageManagerProps> = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  newPreviews,
  newFiles,
  onFileChange,
  onRemoveNew,
  onDeleteExisting,
  productName,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(selectedImageIndex);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const slidingRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const totalImages = images.length + newFiles.length;
  const visibleImages = useMemo(() => images.slice(0, 6), [images]);

  useEffect(() => {
    if (selectedImageIndex === displayIndex) return;
    if (slidingRef.current) return;
    const dir = selectedImageIndex > displayIndex ? "left" : "right";
    slidingRef.current = true;
    setPrevIndex(displayIndex);
    setSlideDir(dir);
    setIsSliding(true);
    const t = setTimeout(() => {
      setDisplayIndex(selectedImageIndex);
      setPrevIndex(null);
      setSlideDir(null);
      setIsSliding(false);
      slidingRef.current = false;
    }, 260);
    return () => clearTimeout(t);
  }, [selectedImageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateGallery = useCallback(
    (dir: "prev" | "next") => {
      if (slidingRef.current) return;
      const next =
        dir === "next"
          ? selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
          : selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1;
      setSelectedImageIndex(next);
    },
    [images.length, selectedImageIndex, setSelectedImageIndex]
  );

  const swipeLogic = (sx: number | null, sy: number | null, ex: number, ey: number) => {
    if (!sx || !sy) return;
    const dx = ex - sx, dy = ey - sy;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    navigateGallery(dx < 0 ? "next" : "prev");
  };

  const currentImageUrl = images[displayIndex]?.url || images[0]?.url;

  return (
    <>
      <style>{`
        @keyframes gi-enter-left  { from{opacity:0;transform:translateX(40px) scale(0.98)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes gi-enter-right { from{opacity:0;transform:translateX(-40px) scale(0.98)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes gi-exit-left   { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(-40px) scale(0.98)} }
        @keyframes gi-exit-right  { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(40px) scale(0.98)} }
        .gi-enter-left  { animation:gi-enter-left  0.26s cubic-bezier(0.22,1,0.36,1) both }
        .gi-enter-right { animation:gi-enter-right 0.26s cubic-bezier(0.22,1,0.36,1) both }
        .gi-exit-left   { animation:gi-exit-left   0.22s ease both }
        .gi-exit-right  { animation:gi-exit-right  0.22s ease both }
      `}</style>

      <div className="w-full md:w-1/2 p-4">
        {images && images.length > 0 ? (
          <div
            className="relative w-full h-87 sm:h-100 md:h-112 lg:min-h-auto rounded-xl overflow-hidden mb-4 cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => swipeLogic(touchStartX.current, touchStartY.current, e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          >
            {/* Blurred background */}
            <Image src={currentImageUrl} alt="" fill aria-hidden sizes="(max-width: 768px) 100vw, 50vw" className="object-cover scale-110 blur-2xl opacity-60" />

            {prevIndex !== null && isSliding && (
              <div key={`exit-${prevIndex}`} className={`absolute inset-0 z-10 ${slideDir === "left" ? "gi-exit-left" : "gi-exit-right"}`}>
                <Image src={images[prevIndex]?.url} alt={productName} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
            )}

            <div key={`enter-${displayIndex}`} className={`absolute inset-0 z-20 ${isSliding ? (slideDir === "left" ? "gi-enter-left" : "gi-enter-right") : ""}`}>
              <Image src={currentImageUrl} alt={productName} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-300 ease-in-out hover:scale-105" />
            </div>

            {/* Zoom button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
              className="absolute top-3 right-3 z-[21] bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all hover:scale-110 active:scale-95"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const currentImage = images[selectedImageIndex];
                if (currentImage) onDeleteExisting(currentImage.publicId, currentImage._id);
              }}
              className="absolute top-3 left-3 z-[21] bg-secondary dark:bg-accent hover:bg-white dark:hover:bg-white text-color dark:text-foreground rounded-full p-2 shadow-lg transition-all hover:scale-110 cursor-pointer"
              title="Delete this image"
            >
              <Trash2 size={16} />
            </button>

            {/* Prev/Next */}
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); navigateGallery("prev"); }} className="absolute left-2 top-1/2 -translate-y-1/2 z-[21] bg-black/30 hover:bg-black/55 text-white rounded-full p-1 transition-all hover:scale-110 active:scale-95">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigateGallery("next"); }} className="absolute right-2 top-1/2 -translate-y-1/2 z-[21] bg-black/30 hover:bg-black/55 text-white rounded-full p-1 transition-all hover:scale-110 active:scale-95">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[21] bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-87 sm:h-100 md:h-112 lg:min-h-auto bg-gray-100 dark:bg-accent flex items-center justify-center rounded-xl border border-gray-200 dark:border-border mb-4">
            <p className="text-gray-400 dark:text-muted-foreground text-lg">No Image Available</p>
          </div>
        )}

        {/* Thumbnail gallery */}
        {visibleImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {visibleImages.map((img, index) => (
              <div
                key={img._id || index}
                onClick={() => !slidingRef.current && setSelectedImageIndex(index)}
                className={`relative h-20 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 group ${
                  selectedImageIndex === index
                    ? "ring-4 ring-secondary dark:ring-primary scale-105 shadow-xl"
                    : "ring-2 ring-gray-300 dark:ring-border opacity-70 hover:opacity-100 hover:scale-105"
                }`}
              >
                <Image src={img.url} alt={`${productName} thumbnail ${index + 1}`} fill sizes="25vw" className="object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteExisting(img.publicId, img._id); }}
                  className="absolute top-1 right-1 bg-secondary dark:bg-accent hover:bg-white dark:hover:bg-white text-color dark:text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New image previews */}
        {newPreviews.length > 0 && (
          <div className="mb-4">
            <h3 className="text-color dark:text-foreground font-semibold mb-2 text-sm">New Images to Upload:</h3>
            <div className="grid grid-cols-4 gap-2">
              {newPreviews.map((preview, index) => (
                <div key={index} className="relative h-20 border-2 border-dashed border-secondary dark:border-primary/50 rounded-lg overflow-hidden group">
                  <Image src={preview} alt={`New image ${index + 1}`} fill sizes="25vw" className="object-cover" />
                  <button
                    onClick={() => onRemoveNew(index)}
                    className="absolute top-1 right-1 bg-secondary dark:bg-accent text-color dark:text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload button */}
        <Button
          asChild
          disabled={totalImages >= 6}
          className="w-full bg-secondary dark:bg-primary/80 hover:bg-white dark:hover:opacity-90 text-color dark:text-primary-foreground font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <label className={totalImages >= 6 ? "cursor-not-allowed" : "cursor-pointer"}>
            {totalImages >= 6 ? "Maximum Images Reached" : `Add Images (${totalImages}/6)`}
            <input type="file" hidden multiple accept="image/*" onChange={onFileChange} disabled={totalImages >= 6} />
          </label>
        </Button>
      </div>

      {/* Zoom Modal */}
      {isZoomed && images.length > 0 && (
        <ZoomModal
          images={images}
          visibleImages={visibleImages}
          productName={productName}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          onClose={() => setIsZoomed(false)}
        />
      )}
    </>
  );
};

export default ImageManager;