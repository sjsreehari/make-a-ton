"use client";

import React, { useState, useEffect } from "react";
import { MascotFollower } from "./MascotFollower";
import { Users, Star } from "lucide-react";

interface TypewriterHeroProps {
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  subtitle?: string;
  stats?: {
    usersText: string;
    ratingText: string;
  };
}

const DEFAULT_WORDS = [
  "Task Prioritizer",
  "Time Strategist",
  "Billing Engine",
  "Revenue Pilot",
];

export function TypewriterHero({
  words = DEFAULT_WORDS,
  typingSpeed = 95,
  deletingSpeed = 45,
  pauseDuration = 2200,
  subtitle = "Toki reaches out and coordinates your meetings, architects your daily schedule, and prioritizes your most urgent tasks and deadlines.",
  stats,
}: TypewriterHeroProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fullWord = words[currentWordIndex % words.length];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (currentText.length > 0) {
        const deleteTimer = setTimeout(() => {
          setCurrentText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(deleteTimer);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      if (currentText.length < fullWord.length) {
        const typeTimer = setTimeout(() => {
          setCurrentText(fullWord.slice(0, currentText.length + 1));
        }, typingSpeed + (Math.random() * 20 - 10)); // subtle human jitter
        return () => clearTimeout(typeTimer);
      } else {
        setIsPaused(true);
      }
    }
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
      {/* Interactive Cursor-Tracking Mascot */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <MascotFollower size={96} />
      </div>

      {/* Main Title with Typewriter Effect */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold tracking-tight text-[#111827] leading-[1.08] mb-6">
        <span className="block font-normal text-[#111827]">Meet Your</span>
        <span className="inline-flex items-baseline font-bold text-[#111827]">
          {currentText}
          {/* Coral / Red Blinking Cursor Bar */}
          <span
            className="inline-block w-[3.5px] sm:w-[4.5px] h-[0.88em] bg-[#f43f5e] ml-1.5 align-baseline rounded-[1px] animate-pulse"
            aria-hidden="true"
          />
        </span>
      </h1>

      {/* Subtitle / Description */}
      <p className="text-sm sm:text-base text-[#64748b] max-w-xl mx-auto leading-relaxed mb-8">
        {subtitle}
      </p>

      {/* Social Proof Strip: Users & Rating */}
      {stats && (
        <div className="flex items-center justify-center gap-7 sm:gap-10 text-xs sm:text-sm font-medium text-[#475569] mb-10">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[#334155]" strokeWidth={2.2} />
            <span>{stats.usersText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="size-4 text-[#334155] fill-[#334155]" strokeWidth={2} />
            <span>{stats.ratingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}

