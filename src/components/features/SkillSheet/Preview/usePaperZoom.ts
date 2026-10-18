import { useEffect, useRef, useState } from "react";

// A4 の幅（210mm）を CSS の px にした値。
export const PAPER_WIDTH_PX = (210 / 25.4) * 96;

// 画面では用紙を親の幅に収まるまで縮める。印刷では使わない。
export function usePaperZoom() {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setZoom(Math.min(1, entry.contentRect.width / PAPER_WIDTH_PX));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, zoom };
}
