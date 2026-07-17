import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDistRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const containerRef = useRef(null);
  const touchTargetRef = useRef(null);
  const wheelTimeoutRef = useRef(null);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const getScrollTop = (el) => {
    let node = el;
    while (node && node !== document.body) {
      if (node.scrollTop > 0) return node.scrollTop;
      node = node.parentElement;
    }
    return window.scrollY;
  };

  const triggerRefresh = async () => {
    refreshingRef.current = true;
    setIsRefreshing(true);
    setPullDistance(40);
    try {
      await onRefreshRef.current?.();
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
      setPullDistance(0);
      pullDistRef.current = 0;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (getScrollTop(e.target) <= 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
        touchTargetRef.current = e.target;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && getScrollTop(touchTargetRef.current) <= 0) {
        e.preventDefault();
        const dist = Math.min(diff * 0.4, 80);
        pullDistRef.current = dist;
        setPullDistance(dist);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullDistRef.current > 50) {
        await triggerRefresh();
      } else {
        setPullDistance(0);
        pullDistRef.current = 0;
      }
    };

    const handleWheel = (e) => {
      if (refreshingRef.current) return;
      if (e.deltaY < 0 && getScrollTop(e.target) <= 0) {
        e.preventDefault();
        const dist = Math.min(pullDistRef.current + Math.abs(e.deltaY) * 0.2, 80);
        pullDistRef.current = dist;
        setPullDistance(dist);

        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(async () => {
          if (pullDistRef.current > 50) {
            await triggerRefresh();
          } else {
            setPullDistance(0);
            pullDistRef.current = 0;
          }
        }, 200);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.3, 1)',
      }}
    >
      {(pullDistance > 0 || isRefreshing) && (
        <div className="flex justify-center items-end pb-2 overflow-hidden" style={{ height: pullDistance || 40 }}>
          <Loader2
            size={20}
            className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 50, 1) }}
          />
        </div>
      )}
      {children}
    </div>
  );
}