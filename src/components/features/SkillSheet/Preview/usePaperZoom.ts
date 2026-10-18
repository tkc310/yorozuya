import { useEffect, useLayoutEffect, useRef, useState } from "react";

// A4 の幅（210mm）を CSS の px にした値。
export const PAPER_WIDTH_PX = (210 / 25.4) * 96;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function zoomFor(width: number): number {
  return Math.min(1, width / PAPER_WIDTH_PX);
}

// 画面では用紙を親の幅に収まるまで縮める。印刷では使わない。
export function usePaperZoom() {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  // 最初の描画の前に縮める。後から縮めると、用紙の割り付けを測り直すことになる。
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (element && element.clientWidth > 0) {
      setZoom(zoomFor(element.clientWidth));
    }
  }, []);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setZoom(zoomFor(entry.contentRect.width));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, zoom };
}
