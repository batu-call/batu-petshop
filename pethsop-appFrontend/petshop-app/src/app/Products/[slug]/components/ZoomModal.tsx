"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type ZoomableImage = { url: string; publicId: string; _id: string };

interface ZoomModalProps {
  images: ZoomableImage[];
  visibleImages: ZoomableImage[];
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
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const thumbnailRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const el = thumbnailRef.current?.children[
      selectedImageIndex
    ] as HTMLElement;
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedImageIndex]);

  const handleClose = useCallback(() => setTimeout(onClose, 0), [onClose]);

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (images.length <= 1 || animating) return;
      setSlideDir(dir === "next" ? "left" : "right");
      setAnimating(true);
      setImgLoaded(false);
      setNaturalSize(null);
      setTimeout(() => {
        setSelectedImageIndex(
          dir === "next"
            ? selectedImageIndex < images.length - 1
              ? selectedImageIndex + 1
              : 0
            : selectedImageIndex > 0
              ? selectedImageIndex - 1
              : images.length - 1,
        );
        setSlideDir(null);
        setAnimating(false);
      }, 220);
    },
    [animating, images.length, selectedImageIndex, setSelectedImageIndex],
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

  const swipe = (
    sx: number | null,
    sy: number | null,
    ex: number,
    ey: number,
  ) => {
    if (images.length <= 1 || !sx || !sy) return;
    const dx = ex - sx,
      dy = ey - sy;
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

  const getImageBoxSize = () => {
    if (typeof window === "undefined") return { width: 680, height: 460 };
    const maxW = Math.min(window.innerWidth * 0.82, 820);
    const maxH = Math.min(window.innerHeight * 0.72, 580);
    if (!naturalSize) return { width: maxW, height: maxH };
    const ratio = naturalSize.w / naturalSize.h;
    let w = maxW,
      h = maxW / ratio;
    if (h > maxH) {
      h = maxH;
      w = maxH * ratio;
    }
    return { width: Math.round(w), height: Math.round(h) };
  };

  const boxSize = getImageBoxSize();
  const currentImageUrl = images[selectedImageIndex]?.url || images[0]?.url;

  return (
    <>
      <style>{`
        @keyframes zm-bd   { from{opacity:0} to{opacity:1} }
        @keyframes zm-card { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes zm-sh   { from{background-position:-200% 0} to{background-position:200% 0} }
        .zm-bd   { animation: zm-bd   0.25s ease forwards; }
        .zm-card { animation: zm-card 0.30s cubic-bezier(0.22,1,0.36,1) forwards; }
        .zm-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: zm-sh 1.4s infinite;
        }
        .zm-thumb-bar::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="fixed inset-0 z-50 zm-bd"
        style={{
          backgroundColor: "rgba(5,7,6,0.93)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 pointer-events-none">
        <div
          className="zm-card pointer-events-auto flex flex-col"
          style={{
            background: "linear-gradient(150deg, #191e1a 0%, #0e1210 100%)",
            borderRadius: 22,
            boxShadow:
              "0 48px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(151,203,169,0.14), inset 0 1px 0 rgba(255,255,255,0.055)",
            overflow: "hidden",
            width: Math.max(boxSize.width + 32, 320),
            transition: "width 0.3s ease, height 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}
          >
            <p
              className="text-[10px] font-semibold tracking-[0.18em] uppercase truncate max-w-[65%]"
              style={{ color: "rgba(151,203,169,0.55)" }}
            >
              {productName}
            </p>
            <div className="flex items-center gap-3">
              {images.length > 1 && (
                <span
                  className="text-[10px] tabular-nums"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  {selectedImageIndex + 1}
                  <span style={{ color: "rgba(255,255,255,0.1)" }}> / </span>
                  {images.length}
                </span>
              )}
              <button
                onClick={handleClose}
                className="flex items-center justify-center rounded-full transition-all duration-150 hover:scale-105 active:scale-90"
                style={{
                  width: 28,
                  height: 28,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <X
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                />
              </button>
            </div>
          </div>

          {/* Image Area */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ height: boxSize.height + 16 }}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={(e) =>
              swipe(
                touchStartX.current,
                touchStartY.current,
                e.changedTouches[0].clientX,
                e.changedTouches[0].clientY,
              )
            }
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(151,203,169,0.055) 0%, transparent 70%)",
              }}
            />
            {!imgLoaded && (
              <div
                className="absolute rounded-xl zm-shimmer"
                style={{ inset: "12px 40px" }}
              />
            )}

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                padding: "8px 40px",
                transition:
                  "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
                transform: slideDir
                  ? `translateX(${slideDir === "left" ? -50 : 50}px)`
                  : "translateX(0)",
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
                  style={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: "opacity 0.22s ease",
                    filter: "drop-shadow(0 10px 36px rgba(0,0,0,0.65))",
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setNaturalSize({
                      w: img.naturalWidth,
                      h: img.naturalHeight,
                    });
                    setImgLoaded(true);
                  }}
                />
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigate("prev")}
                  disabled={animating}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90 disabled:opacity-20"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <ChevronLeft
                    className="w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  />
                </button>
                <button
                  onClick={() => navigate("next")}
                  disabled={animating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90 disabled:opacity-20"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <ChevronRight
                    className="w-4 h-4"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div
              className="flex-shrink-0 px-3 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}
            >
              <div
                ref={thumbnailRef}
                className="zm-thumb-bar flex gap-2 overflow-x-auto justify-center"
              >
                {visibleImages.map((img, index) => (
                  <button
                    key={img._id || index}
                    onClick={() => goToIndex(index)}
                    className="relative flex-shrink-0 overflow-hidden transition-all duration-200 hover:opacity-80"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 9,
                      border:
                        selectedImageIndex === index
                          ? "2px solid #97cba9"
                          : "2px solid rgba(255,255,255,0.07)",
                      opacity: selectedImageIndex === index ? 1 : 0.42,
                      background: "#161a17",
                      transform:
                        selectedImageIndex === index
                          ? "scale(1.08)"
                          : "scale(1)",
                      outline: "none",
                      cursor: "pointer",
                      boxShadow:
                        selectedImageIndex === index
                          ? "0 0 0 3px rgba(151,203,169,0.15)"
                          : "none",
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={`${index + 1}`}
                      fill
                      sizes="50px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dot Indicators */}
        {images.length > 1 && images.length <= 10 && (
          <div className="flex gap-1.5 pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToIndex(i)}
                style={{
                  width: i === selectedImageIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background:
                    i === selectedImageIndex
                      ? "#97cba9"
                      : "rgba(255,255,255,0.18)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
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

export default ZoomModal;
