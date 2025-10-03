'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  ChevronLeft,
  ChevronRight,
  LocationOn,
  Business,
  CalendarToday,
} from '@mui/icons-material';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCall = castingCalls[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % castingCalls.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, castingCalls.length]);

  // Simple color extraction from image (placeholder logic)
  useEffect(() => {
    // In a real implementation, you'd extract the dominant color from the image
    // For now, we'll use a rotating set of colors
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
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      {/* Main Carousel Container */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          height: '400px',
          overflow: 'hidden',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid #333333',
          mb: 4,
        }}
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${currentCall.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.3)',
            }}
          />
        </AnimatePresence>

        {/* Content Overlay */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            px: 6,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCall.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              style={{ width: '100%', maxWidth: '600px' }}
            >
              <Box sx={{ width: '100%', maxWidth: '600px' }}>
                {/* Company Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Chip
                    label={currentCall.company}
                    sx={{
                      backgroundColor: dominantColor,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      px: 2,
                      py: 1,
                      mb: 2,
                    }}
                  />
                </motion.div>

                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.2rem', lg: '2.5rem' },
                      lineHeight: 1.1,
                      textShadow: '0 4px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {currentCall.projectTitle}
                  </Typography>
                </motion.div>

                {/* Role and Production Type */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: dominantColor,
                      fontWeight: '600',
                      mb: 3,
                      fontSize: { xs: '1.2rem', md: '1.4rem' },
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {currentCall.role} • {currentCall.productionType}
                  </Typography>
                </motion.div>

                {/* Casting Details Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    mb: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', minWidth: '60px' }}>
                        Age:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>
                        {currentCall.age}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', minWidth: '60px' }}>
                        Sex:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>
                        {currentCall.sex}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ color: 'white', fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>
                        {currentCall.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business sx={{ color: 'white', fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>
                        {currentCall.venue}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, gridColumn: { xs: '1', sm: '1 / -1' } }}>
                      <CalendarToday sx={{ color: 'white', fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>
                        {currentCall.timeWindow}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Navigation Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'space-between',
            px: 2,
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={handlePrev}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Play/Pause Control */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Box>
      </Box>

      {/* Thumbnail Navigation */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#333333',
            borderRadius: 4,
          },
        }}
      >
        {castingCalls.map((call, index) => (
          <Box
            key={call.id}
            onClick={() => handleThumbnailClick(index)}
            sx={{
              minWidth: 120,
              height: 80,
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              border: currentIndex === index ? `2px solid ${dominantColor}` : '2px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                border: `2px solid ${dominantColor}`,
              },
            }}
          >
            <Image
              src={call.image}
              alt={call.projectTitle}
              layout="fill"
              objectFit="cover"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

