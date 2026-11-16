import { useState, useEffect, useCallback } from "react";

export interface ProgressiveOptions {
  initialCount?: number;
  step?: number;
  interval?: number;
  resetKey?: unknown;
}

/**
 * Hook cho phép render tuần tự, tăng dần từng item (Progressive / Incremental Rendering)
 * Giúp chuyển đổi Tab ngay lập tức (<16ms, không lag, không đơ UI)
 * và tự động đổ đầy các item còn lại theo từng frame.
 */
export function useProgressiveItems<T>(
  items: T[] = [],
  options?: ProgressiveOptions
): {
  visibleItems: T[];
  isComplete: boolean;
  totalCount: number;
  renderedCount: number;
  renderAll: () => void;
} {
  const initialCount = options?.initialCount ?? 4;
  const step = options?.step ?? 6;
  const interval = options?.interval ?? 16;
  const resetKey = options?.resetKey;

  const totalCount = items?.length || 0;

  const [count, setCount] = useState<number>(() =>
    Math.min(totalCount, initialCount)
  );

  useEffect(() => {
    // Khi đổi Tab (resetKey) hoặc danh sách items thay đổi,
    // lập tức đặt lại count về batch đầu tiên để phản hồi tức thì
    const initialBatch = Math.min(items.length, initialCount);
    setCount(initialBatch);

    if (items.length <= initialCount) {
      return;
    }

    let current = initialBatch;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      current = Math.min(items.length, current + step);
      setCount(current);

      if (current < items.length) {
        timerId = setTimeout(tick, interval);
      }
    };

    // Chờ 1 frame đầu tiên hoàn tất rồi mới tăng dần
    timerId = setTimeout(tick, interval);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [items.length, resetKey, initialCount, step, interval]);

  const renderAll = useCallback(() => {
    setCount(totalCount);
  }, [totalCount]);

  return {
    visibleItems: items.slice(0, count),
    isComplete: count >= totalCount,
    totalCount,
    renderedCount: count,
    renderAll,
  };
}

export default useProgressiveItems;
