'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Set up your talent profile with photos, reels, and experience details."
    },
    {
      number: "02", 
      title: "Browse Opportunities",
      description: "Explore verified casting calls from top production companies across Saudi Arabia."
    },
    {
      number: "03",
      title: "Apply & Connect",
      description: "Submit your application directly through our platform and connect with casting directors."
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
            How It Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Get started in three simple steps and begin your journey to your next big role.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {steps.map((step, index) => (
            <Box key={index}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {step.number}
                </Paper>
                
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  {step.title}
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </Typography>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      position: 'absolute',
                      top: 32,
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#333333',
                      transform: 'translateX(50%)',
                      zIndex: -1,
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
      </Box>
    </motion.div>
  );
}
