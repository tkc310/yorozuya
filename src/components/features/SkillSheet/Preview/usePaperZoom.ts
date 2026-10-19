import { useEffect, useLayoutEffect, useRef, useState } from "react";

// A4 の幅（210mm）を CSS の px にした値。
export const PAPER_WIDTH_PX = (210 / 25.4) * 96;

// fit は枠の幅に収まるまで縮め、actual は等倍で出す。印刷では使わない。
export type ZoomMode = "fit" | "actual";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function zoomFor(width: number, mode: ZoomMode): number {
  return mode === "actual" ? 1 : Math.min(1, width / PAPER_WIDTH_PX);
}

// 画面では用紙を親の幅に合わせて縮める。
export function usePaperZoom(mode: ZoomMode = "fit") {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  // 最初の描画の前に幅を測る。後から縮めると、用紙の割り付けを測り直すことになる。
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (element && element.clientWidth > 0) {
      setWidth(element.clientWidth);
    }
  }, []);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, zoom: width === null ? 1 : zoomFor(width, mode) };
}
