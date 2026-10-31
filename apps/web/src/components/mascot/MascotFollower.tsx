"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface MascotFollowerProps {
  className?: string;
  size?: number;
}

export function MascotFollower({ className = "", size = 110 }: MascotFollowerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ rotateX: 0, rotateY: 0, rotateZ: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHopping, setIsHopping] = useState(false);

  // Target coordinates for smooth lerping
  const targetEye = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ rotateX: 0, rotateY: 0, rotateZ: 0 });
  const currentEye = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ rotateX: 0, rotateY: 0, rotateZ: 0 });

  // Handle cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const angle = Math.atan2(deltaY, deltaX);

      // Maximum eye travel radius (px)
      const maxEyeX = 7.5;
      const maxEyeY = 5.5;

      // Distance factor with soft falloff
      const eyeTravel = Math.min(distance * 0.025, 1);
      targetEye.current = {
        x: Math.cos(angle) * maxEyeX * eyeTravel,
        y: Math.sin(angle) * maxEyeY * eyeTravel,
      };

      // Head 3D tilt angles (degrees)
      const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;
      const normX = Math.max(-1, Math.min(1, deltaX / (winW * 0.5)));
      const normY = Math.max(-1, Math.min(1, deltaY / (winH * 0.5)));

      targetTilt.current = {
        rotateY: normX * 9,
        rotateX: -normY * 7,
        rotateZ: normX * 3.5,
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation frame loop for buttery smooth interpolation
  useEffect(() => {
    let animId: number;

    const animate = () => {
      // Lerp factor
      const factor = 0.12;

      currentEye.current.x += (targetEye.current.x - currentEye.current.x) * factor;
      currentEye.current.y += (targetEye.current.y - currentEye.current.y) * factor;

      currentTilt.current.rotateX += (targetTilt.current.rotateX - currentTilt.current.rotateX) * factor;
      currentTilt.current.rotateY += (targetTilt.current.rotateY - currentTilt.current.rotateY) * factor;
      currentTilt.current.rotateZ += (targetTilt.current.rotateZ - currentTilt.current.rotateZ) * factor;

      setEyeOffset({
        x: Math.round(currentEye.current.x * 100) / 100,
        y: Math.round(currentEye.current.y * 100) / 100,
      });

      setHeadTilt({
        rotateX: Math.round(currentTilt.current.rotateX * 100) / 100,
        rotateY: Math.round(currentTilt.current.rotateY * 100) / 100,
        rotateZ: Math.round(currentTilt.current.rotateZ * 100) / 100,
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Periodic natural blinking
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    };

    // Blink every 3.2 to 5.8 seconds randomly
    let timeoutId: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2600;
      timeoutId = setTimeout(() => {
        triggerBlink();
        scheduleNextBlink();
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Joyful little hop on click
  const handleMascotClick = useCallback(() => {
    if (isHopping) return;
    setIsHopping(true);
    setTimeout(() => {
      setIsHopping(false);
    }, 450);
  }, [isHopping]);

  return (
    <div
      ref={containerRef}
      onClick={handleMascotClick}
      className={`inline-block select-none cursor-pointer group ${className}`}
      style={{
        width: size,
        height: (size * 90) / 110,
        perspective: "600px",
      }}
      title="Click me!"
      aria-label="Interactive Mascot"
      role="button"
      tabIndex={0}
    >
      <div
        className="w-full h-full relative transition-transform will-change-transform"
        style={{
          transform: `perspective(600px) rotateX(${headTilt.rotateX}deg) rotateY(${headTilt.rotateY}deg) rotateZ(${headTilt.rotateZ}deg) ${
            isHopping ? "translateY(-14px) scale(1.08, 0.94)" : "translateY(0px) scale(1, 1)"
          }`,
          transition: isHopping ? "transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
        }}
      >
        <svg
          viewBox="0 0 120 100"
          className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Ground Shadow */}
          <ellipse
            cx="60"
            cy="93"
            rx="40"
            ry="4.5"
            fill="#000000"
            opacity="0.09"
            className="blur-[2px]"
          />

          {/* Character Body with Ears & Smooth Crown */}
          <path
            d="M 29 76 C 26 56 27 40 34 27 C 37 22 42 23 47 28 C 51 32 55 34 60 34 C 65 34 69 32 73 28 C 78 23 83 22 86 27 C 93 40 94 56 91 76 C 75 79 45 79 29 76 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="4.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Eyes with Follow & Blink */}
          <g
            style={{
              transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
              transition: "transform 0.05s linear",
            }}
          >
            {/* Left Eye */}
            <ellipse
              cx="52"
              cy="54"
              rx="3.75"
              ry={isBlinking ? "0.4" : "7.5"}
              fill="#000000"
              style={{
                transition: "ry 0.08s ease-in-out",
              }}
            />

            {/* Right Eye */}
            <ellipse
              cx="68"
              cy="54"
              rx="3.75"
              ry={isBlinking ? "0.4" : "7.5"}
              fill="#000000"
              style={{
                transition: "ry 0.08s ease-in-out",
              }}
            />
          </g>

          {/* Characteristic Bottom Saucer / Hat Brim */}
          <path
            d="M 18 80 C 13 80 13 86.5 18 87.5 C 30 89.8 45 91 60 91 C 75 91 90 89.8 102 87.5 C 107 86.5 107 80 102 80 C 90 77.5 75 76 60 76 C 45 76 30 77.5 18 80 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="4.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

