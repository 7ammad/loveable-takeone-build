'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CastingCall {
  id: string;
  projectTitle: string;
  role: string;
  city: string;
  company: string;
  deadline: string;
  description: string;
  image: string;
  tags: string[];
}

interface StoryGalleryProps {
  castingCalls: CastingCall[];
}

export function StoryGallery({ castingCalls }: StoryGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const currentCall = castingCalls[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % castingCalls.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + castingCalls.length) % castingCalls.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleCardClick = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const progress = ((currentIndex + 1) / castingCalls.length) * 100;

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {castingCalls.length}
        </p>
      </div>

      {/* Main Gallery Container */}
      <div className="relative h-[500px] overflow-hidden rounded-lg bg-card border border-border">
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

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          ←
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          →
        </button>

        {/* Cards Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full"
          >
            <div
              className="h-full flex flex-col justify-between p-8 cursor-pointer"
              onClick={() => handleCardClick(currentCall.id)}
            >
              {/* Top Section - Company & Tags */}
              <div className="flex justify-between items-start z-10">
                <span className="px-4 py-2 rounded-md bg-primary text-white font-bold text-sm">
                  {currentCall.company}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {currentCall.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-md text-xs bg-white/20 text-white backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Center Section - Main Content */}
              <div className="flex-1 flex flex-col justify-center z-10">
                <h2
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {currentCall.projectTitle}
                </h2>

                <p className="text-2xl text-primary font-medium mb-6">
                  {currentCall.role}
                </p>

                <p className="text-white/90 mb-6 max-w-2xl leading-relaxed">
                  {currentCall.description}
                </p>

                <div className="flex gap-4">
                  <span className="text-white/80">📍 {currentCall.city}</span>
                  <span className="text-white/80">⏰ {currentCall.deadline}</span>
                </div>
              </div>

              {/* Bottom Section - Action Button */}
              <div className="flex justify-center z-10">
                <button className="w-14 h-14 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center text-2xl transition-colors">
                  ▶
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {castingCalls.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary w-8' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {expandedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-5"
            onClick={() => setExpandedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-lg p-10 max-w-3xl w-full max-h-[80vh] overflow-auto"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                {castingCalls.find((call) => call.id === expandedCard)?.projectTitle}
              </h2>
              <p className="text-2xl text-primary mb-6">
                {castingCalls.find((call) => call.id === expandedCard)?.role}
              </p>
              <p className="text-white mb-6 leading-relaxed">
                {castingCalls.find((call) => call.id === expandedCard)?.description}
              </p>
              <div className="flex gap-4 mb-6">
                <span className="text-white/80">
                  📍 {castingCalls.find((call) => call.id === expandedCard)?.city}
                </span>
                <span className="text-white/80">
                  ⏰ {castingCalls.find((call) => call.id === expandedCard)?.deadline}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {castingCalls
                  .find((call) => call.id === expandedCard)
                  ?.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-md bg-primary text-white text-sm"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
