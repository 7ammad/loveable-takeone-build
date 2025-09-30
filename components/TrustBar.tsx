'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';

export function TrustBar() {
  const logos = ['MBC', 'Telfaz11', 'Gulf Casting'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <Box
        sx={{
          py: 4,
          backgroundColor: 'rgba(26, 26, 26, 0.5)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 'semibold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Trusted by Saudi Arabia&apos;s Leading Studios
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            animation: 'scroll 30s linear infinite',
            '&:hover': {
              animationPlayState: 'paused',
            },
            '@keyframes scroll': {
              '0%': {
                transform: 'translateX(0)',
              },
              '100%': {
                transform: 'translateX(-50%)',
              },
            },
          }}
        >
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <Box
              key={index}
              sx={{
                flexShrink: 0,
                mx: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '200px',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                {logo}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
      </Box>
    </motion.div>
  );
}
