"use client";
import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import Image from "next/image";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import ZoomModal, { ZoomableImage } from "./ZoomModal";

type ProductImage = ZoomableImage;

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  discountPercent: number;
  stock?: number | string;
}

type ImageMeta = {
  fit: "object-cover" | "object-contain";
  blur: boolean;
};

const shouldShowBlur = (nw: number, nh: number, cw: number, ch: number) => {
  const ir = nw / nh;
  const cr = cw / ch;
  const horizontalGap = ir < cr ? cr / ir > 1.15 : false;
  const verticalGap = ir > cr ? ir / cr > 1.15 : false;
  return horizontalGap || verticalGap;
};

const getObjectFit = (
  nw: number,
  nh: number,
  cw: number,
  ch: number,
): "object-cover" | "object-contain" =>
  Math.abs(nw / nh - cw / ch) > 0.4 ? "object-contain" : "object-cover";

const SLIDE_DURATION = 380;

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  selectedImageIndex,
  setSelectedImageIndex,
  discountPercent,
  stock,
}) => {
  const stockNumber = typeof stock === "string" ? Number(stock) : stock;
  const showStockWarning = stockNumber && stockNumber > 0 && stockNumber < 6;

  const [isZoomed, setIsZoomed] = useState(false);
  const [imageMetaMap, setImageMetaMap] = useState<Record<string, ImageMeta>>({});
  const [imageReadyMap, setImageReadyMap] = useState<Record<string, boolean>>({});

  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(selectedImageIndex);
  const [nextIdx, setNextIdx] = useState<number | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const slidingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleImages = useMemo(() => images.slice(0, 6), [images]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRevealed) {
          setIsVisible(true);
          setHasRevealed(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasRevealed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preloadAll = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      if (!cw || !ch) return;
      images.forEach(({ url }) => {
        if (imageMetaMap[url]) return;
        const img = new window.Image();
        img.onload = () => {
          setImageMetaMap((prev) => ({
            ...prev,
            [url]: {
              fit: getObjectFit(img.naturalWidth, img.naturalHeight, cw, ch),
              blur: shouldShowBlur(img.naturalWidth, img.naturalHeight, cw, ch),
            },
          }));
        };
        img.src = url;
      });
    };
    preloadAll();
    const observer = new ResizeObserver(preloadAll);
    observer.observe(container);
    return () => observer.disconnect();
  }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedImageIndex === currentIdx) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const dir = selectedImageIndex > currentIdx ? "left" : "right";
    slidingRef.current = true;
    setNextIdx(selectedImageIndex);
    setSlideDir(dir);
    setIsSliding(true);

    timerRef.current = setTimeout(() => {
      setCurrentIdx(selectedImageIndex);
      setNextIdx(null);
      setSlideDir(null);
      setIsSliding(false);
      slidingRef.current = false;
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selectedImageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy * 1.5 && dx > 10) e.preventDefault();
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  const navigateGallery = useCallback(
    (dir: "prev" | "next") => {
      if (images.length <= 1 || slidingRef.current) return;
      const next =
        dir === "next"
          ? selectedImageIndex < images.length - 1
            ? selectedImageIndex + 1
            : 0
          : selectedImageIndex > 0
            ? selectedImageIndex - 1
            : images.length - 1;
      setSelectedImageIndex(next);
    },
    [images.length, selectedImageIndex, setSelectedImageIndex],
  );

  const swipeLogic = (sx: number | null, sy: number | null, ex: number, ey: number) => {
    if (images.length <= 1 || !sx || !sy) return;
    const dx = ex - sx, dy = ey - sy;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    navigateGallery(dx < 0 ? "next" : "prev");
  };

  const handleImageLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageMetaMap[url]) {
      const img = e.currentTarget;
      const cw = containerRef.current?.offsetWidth;
      const ch = containerRef.current?.offsetHeight;
      if (cw && ch) {
        setImageMetaMap((prev) => ({
          ...prev,
          [url]: {
            fit: getObjectFit(img.naturalWidth, img.naturalHeight, cw, ch),
            blur: shouldShowBlur(img.naturalWidth, img.naturalHeight, cw, ch),
          },
        }));
      }
    }
    setImageReadyMap((prev) => ({ ...prev, [url]: true }));
  };

  const currentImageUrl = images[currentIdx]?.url || images[0]?.url;
  const nextImageUrl = nextIdx !== null ? images[nextIdx]?.url : null;
  const currentMeta = imageMetaMap[currentImageUrl];
  const currentFit = currentMeta?.fit ?? "object-cover";
  const showBlur = currentMeta?.blur ?? false;
  const currentImageReady = imageReadyMap[currentImageUrl] ?? false;

  const enterFrom = slideDir === "left" ? "translateX(100%)" : "translateX(-100%)";
  const exitTo = slideDir === "left" ? "translateX(-100%)" : "translateX(100%)";

  return (
    <>
      <style>{`
        @keyframes gallery-reveal-image {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes gallery-reveal-thumbs {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gallery-shimmer-sweep {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(250%) skewX(-12deg); }
        }
        @keyframes slide-enter {
          from { transform: var(--enter-from); }
          to   { transform: translateX(0%); }
        }
        @keyframes slide-exit {
          from { transform: translateX(0%); }
          to   { transform: var(--exit-to); }
        }
        .gallery-image-reveal  { animation: gallery-reveal-image 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        .gallery-thumbs-reveal { animation: gallery-reveal-thumbs 0.55s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .gallery-hidden        { opacity: 0; transform: translateY(28px) scale(0.97); }
        .gallery-shimmer-once::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(151,203,169,0.13) 50%, transparent 65%);
          animation: gallery-shimmer-sweep 0.9s cubic-bezier(0.4,0,0.2,1) 0.3s both;
          pointer-events: none;
          border-radius: inherit;
          z-index: 25;
        }
      `}</style>

      <div
        ref={wrapperRef}
        className="w-full md:w-1/2 flex flex-col-reverse md:flex-row md:min-h-[420px]"
      >
        {images.length > 1 && (
          <div className={`flex flex-row md:flex-col gap-3 p-2 justify-center items-center h-20 sm:h-30 md:h-auto overflow-x-auto md:overflow-y-auto ${isVisible ? "gallery-thumbs-reveal" : "gallery-hidden"}`}>
            {visibleImages.map((img, index) => (
              <div
                key={img._id || index}
                onClick={() => !slidingRef.current && setSelectedImageIndex(index)}
                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 bg-gray-100 flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 md:h-14 md:w-14 lg:h-20 lg:w-20 ${
                  selectedImageIndex === index
                    ? "ring-4 ring-[#97cba9] scale-105 shadow-xl"
                    : "ring-2 ring-[#c8e6d4] opacity-70 hover:opacity-100 hover:scale-105"
                }`}
                style={{ transitionDelay: isVisible ? `${index * 55}ms` : "0ms" }}
              >
                <Image
                  src={img.url}
                  alt={`${productName} ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 112px, 160px"
                  quality={95}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div
          ref={containerRef}
          className={`flex-1 relative min-h-[350px] ${isVisible ? "gallery-image-reveal gallery-shimmer-once" : "gallery-hidden"}`}
        >
          <div className="absolute top-4 left-0 z-30 flex flex-col gap-2">
            {discountPercent > 0 && (
              <div className="bg-secondary text-color text-[14px] sm:text-[10px] md:text-[9px] lg:text-[12px] xl:text-[14px] font-bold pl-2 pr-2.5 sm:pl-2.5 sm:pr-3 py-0.5 sm:py-1 rounded-r-full shadow-md tracking-wide">
                {discountPercent}% OFF
              </div>
            )}
            {showStockWarning && (
              <div className="bg-white/90 backdrop-blur-sm border-r border-t border-b border-red-200 text-red-400 text-[14px] sm:text-[10px] md:text-[9px] lg:text-[12px] xl:text-[14px] font-semibold pl-2 pr-2.5 sm:pl-2.5 sm:pr-3 py-0.5 sm:py-1 rounded-r-full shadow-sm tracking-wide">
                Only {stockNumber} left
              </div>
            )}
          </div>

          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-3 right-3 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all hover:scale-110 active:scale-95"
            aria-label="Zoom image"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div
            className="absolute inset-0 rounded-xl overflow-hidden cursor-zoom-in"
            style={{ touchAction: "pan-y" }}
            onClick={() => setIsZoomed(true)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={(e) =>
              swipeLogic(
                touchStartX.current,
                touchStartY.current,
                e.changedTouches[0].clientX,
                e.changedTouches[0].clientY,
              )
            }
          >
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${showBlur ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundColor: "#edf7f1" }}
            />
            {showBlur && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImageUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 pointer-events-none"
              />
            )}

            <div
              key={`current-${currentIdx}`}
              className="absolute inset-0 z-10"
              style={
                isSliding
                  ? {
                      animation: `slide-exit ${SLIDE_DURATION}ms cubic-bezier(0.4,0,0.2,1) forwards`,
                      ["--exit-to" as string]: exitTo,
                    }
                  : {}
              }
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: currentImageReady ? 1 : 0,
                  transition: "opacity 0.18s ease",
                }}
              >
                <Image
                  src={currentImageUrl}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                  priority
                  className={currentFit}
                  onLoad={(e) => handleImageLoad(currentImageUrl, e)}
                />
              </div>
            </div>

            {isSliding && nextImageUrl && nextIdx !== null && (
              <div
                key={`next-${nextIdx}`}
                className="absolute inset-0 z-20"
                style={{
                  animation: `slide-enter ${SLIDE_DURATION}ms cubic-bezier(0.4,0,0.2,1) forwards`,
                  ["--enter-from" as string]: enterFrom,
                }}
              >
                <Image
                  src={nextImageUrl}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                  className={imageMetaMap[nextImageUrl]?.fit ?? "object-cover"}
                />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateGallery("prev"); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/55 text-white rounded-full p-1 transition-all hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateGallery("next"); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/55 text-white rounded-full p-1 transition-all hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {isZoomed && (
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

export default ProductImageGallery;