'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface CastingCall {
  id: string;
  projectTitle: string;
  role: string;
  productionType: string;
  city: string;
  company: string;
  deadline: string;
  image: string;
  age: string;
  sex: string;
  location: string;
  venue: string;
  timeWindow: string;
  contactEmail: string;
  contactPhone: string;
  castingDirector: string;
}

interface SmartCarouselProps {
  castingCalls: CastingCall[];
}

export function SmartCarousel({ castingCalls }: SmartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dominantColor, setDominantColor] = useState('#FF44AA');

  const currentCall = castingCalls[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % castingCalls.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, castingCalls.length]);

  // Simple color rotation
  useEffect(() => {
    const colors = ['#FF44AA', '#4A90E2', '#E24A90', '#90E24A', '#E2904A'];
    setDominantColor(colors[currentIndex % colors.length]);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % castingCalls.length);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + castingCalls.length) % castingCalls.length);
    setIsPlaying(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Main Carousel Container */}
      <div
        className="relative h-[400px] overflow-hidden rounded-lg bg-card border border-border mb-8"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Background Image with Blur */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentCall.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentCall.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.3)',
            }}
          />
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCall.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              {/* Company Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span
                  className="inline-block px-4 py-2 rounded-md font-bold text-white text-sm mb-4"
                  style={{ backgroundColor: dominantColor }}
                >
                  {currentCall.company}
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
              >
                {currentCall.projectTitle}
              </motion.h2>

              {/* Role and Production Type */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl md:text-2xl font-semibold mb-6"
                style={{ color: dominantColor, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                {currentCall.role} • {currentCall.productionType}
              </motion.p>

              {/* Casting Details Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/80 font-medium min-w-[60px]">Age:</span>
                  <span className="text-white font-semibold">{currentCall.age}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/80 font-medium min-w-[60px]">Sex:</span>
                  <span className="text-white font-semibold">{currentCall.sex}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white">📍</span>
                  <span className="text-white font-semibold">{currentCall.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white">🏢</span>
                  <span className="text-white font-semibold">{currentCall.venue}</span>
                </div>
                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <span className="text-white">📅</span>
                  <span className="text-white font-semibold">{currentCall.timeWindow}</span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            →
          </button>
        </div>

        {/* Play/Pause Control */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {castingCalls.map((call, index) => (
          <button
            key={call.id}
            onClick={() => handleThumbnailClick(index)}
            className="relative min-w-[120px] h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:scale-105"
            style={{
              borderColor: currentIndex === index ? dominantColor : 'transparent',
            }}
          >
            <Image
              src={call.image}
              alt={call.projectTitle}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
