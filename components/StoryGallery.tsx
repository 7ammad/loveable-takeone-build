'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
} from '@mui/material';
import { ChevronLeft, ChevronRight, PlayArrow } from '@mui/icons-material';
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'primary.main',
            },
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
          {currentIndex + 1} of {castingCalls.length}
        </Typography>
      </Box>

      {/* Main Gallery Container */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          height: '500px',
          overflow: 'hidden',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid #333333',
        }}
      >
        {/* Navigation Arrows */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
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
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* Cards Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ height: '100%' }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => handleCardClick(castingCalls[currentIndex].id)}
            >
              {/* Background Image */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${castingCalls[currentIndex].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.4)',
                  zIndex: 0,
                }}
              />

              {/* Overlay Content */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 4,
                }}
              >
                {/* Top Section - Company & Tags */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Chip
                    label={castingCalls[currentIndex].company}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {castingCalls[currentIndex].tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Center Section - Main Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {castingCalls[currentIndex].projectTitle}
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'medium',
                      mb: 3,
                    }}
                  >
                    {castingCalls[currentIndex].role}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 3,
                      maxWidth: '600px',
                      lineHeight: 1.6,
                    }}
                  >
                    {castingCalls[currentIndex].description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      📍 {castingCalls[currentIndex].city}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      ⏰ {castingCalls[currentIndex].deadline}
                    </Typography>
                  </Box>
                </Box>

                {/* Bottom Section - Action Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        width: 60,
                        height: 60,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 32 }} />
                    </IconButton>
                  </motion.div>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Thumbnail Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
        {castingCalls.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: index === currentIndex ? 'primary.dark' : 'rgba(255, 255, 255, 0.5)',
              },
            }}
          />
        ))}
      </Box>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {expandedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setExpandedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
                {castingCalls.find(call => call.id === expandedCard)?.projectTitle}
              </Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 3 }}>
                {castingCalls.find(call => call.id === expandedCard)?.role}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', mb: 3, lineHeight: 1.6 }}>
                {castingCalls.find(call => call.id === expandedCard)?.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  📍 {castingCalls.find(call => call.id === expandedCard)?.city}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  ⏰ {castingCalls.find(call => call.id === expandedCard)?.deadline}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {castingCalls.find(call => call.id === expandedCard)?.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }}
                  />
                ))}
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
