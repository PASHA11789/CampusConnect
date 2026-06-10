'use client'

import React, { Suspense, lazy, useRef, useEffect } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

export function SplineScene({ scene, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!containerRef.current) return;
      const canvas = containerRef.current.querySelector('canvas');
      if (!canvas) return;

      // Avoid feedback loop if targeted directly
      if (e.target === canvas) return;

      // Forward standard Mouse Event
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        bubbles: true,
        cancelable: true,
      });
      canvas.dispatchEvent(mouseEvent);

      // Forward Pointer Event for newer Spline runtimes
      if (window.PointerEvent) {
        const pointerEvent = new PointerEvent('pointermove', {
          clientX: e.clientX,
          clientY: e.clientY,
          screenX: e.screenX,
          screenY: e.screenY,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse',
        });
        canvas.dispatchEvent(pointerEvent);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <Suspense 
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader animate-spin border-4 border-[#00c2cb] border-t-transparent rounded-full w-8 h-8"></span>
          </div>
        }
      >
        <Spline
          scene={scene}
          className="w-full h-full"
        />
      </Suspense>
    </div>
  )
}
