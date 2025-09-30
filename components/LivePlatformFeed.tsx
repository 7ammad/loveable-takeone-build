'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { SmartCarousel } from './SmartCarousel';

export function LivePlatformFeed() {
  const castingCalls = [
    {
      id: "1",
      projectTitle: "Desert Dreams",
      role: "Lead Actor",
      productionType: "Feature Film",
      city: "Riyadh, Saudi Arabia",
      company: "Vision Productions",
      deadline: "Dec 15, 2024",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      age: "25-35 years",
      sex: "Male",
      location: "Riyadh, Saudi Arabia",
      venue: "Vision Studios",
      timeWindow: "Dec 10-15, 2024",
      contactEmail: "casting@visionproductions.sa",
      contactPhone: "+966 50 123 4567",
      castingDirector: "Sarah Al-Mansour"
    },
    {
      id: "2",
      projectTitle: "Oasis Stories",
      role: "Supporting Actress",
      productionType: "TV Series",
      city: "Jeddah, Saudi Arabia",
      company: "MBC Studios",
      deadline: "Dec 20, 2024",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      age: "20-30 years",
      sex: "Female",
      location: "Jeddah, Saudi Arabia",
      venue: "MBC Studios",
      timeWindow: "Dec 15-20, 2024",
      contactEmail: "talent@mbc.net",
      contactPhone: "+966 11 234 5678",
      castingDirector: "Ahmed Al-Rashid"
    },
    {
      id: "3",
      projectTitle: "Saudi Tourism",
      role: "Voice Actor",
      productionType: "Commercial",
      city: "Dubai, UAE",
      company: "Creative Agency",
      deadline: "Dec 10, 2024",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      age: "30-45 years",
      sex: "Any",
      location: "Dubai, UAE",
      venue: "Creative Studios",
      timeWindow: "Dec 5-10, 2024",
      contactEmail: "voice@creativeagency.ae",
      contactPhone: "+971 4 123 4567",
      castingDirector: "Noura Hassan"
    },
    {
      id: "4",
      projectTitle: "Vision 2030",
      role: "Narrator",
      productionType: "Documentary",
      city: "Riyadh, Saudi Arabia",
      company: "National Media",
      deadline: "Jan 5, 2025",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      age: "35-50 years",
      sex: "Any",
      location: "Riyadh, Saudi Arabia",
      venue: "National Media Center",
      timeWindow: "Dec 20-30, 2024",
      contactEmail: "documentary@nationalmedia.sa",
      contactPhone: "+966 11 345 6789",
      castingDirector: "Khalid Al-Fahad"
    },
    {
      id: "5",
      projectTitle: "Digital Nomads",
      role: "Host",
      productionType: "Web Series",
      city: "Jeddah, Saudi Arabia",
      company: "Streaming Platform",
      deadline: "Dec 30, 2024",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      age: "22-35 years",
      sex: "Any",
      location: "Jeddah, Saudi Arabia",
      venue: "Streaming Studios",
      timeWindow: "Dec 25-30, 2024",
      contactEmail: "hosting@streamingplatform.sa",
      contactPhone: "+966 12 456 7890",
      castingDirector: "Laila Al-Zahra"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
            }}
          >
            Live Platform Feed
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Swipe through the latest casting calls from top production companies across Saudi Arabia
          </Typography>
        </Box>
        
            <SmartCarousel castingCalls={castingCalls} />
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            View All Casting Calls
          </Button>
        </Box>
      </Container>
      </Box>
    </motion.div>
  );
}
