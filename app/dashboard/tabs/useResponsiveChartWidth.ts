"use client";

import { useState, useEffect, useRef } from "react";

export function useResponsiveChartWidth(defaultWidth: number = 300) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(defaultWidth);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth);
      }
    };

    // Initial calculation
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { containerRef, chartWidth };
}
