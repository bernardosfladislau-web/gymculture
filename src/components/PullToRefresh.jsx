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

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY <= 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && window.scrollY <= 0) {
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
      } else {
        setPullDistance(0);
        pullDistRef.current = 0;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
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