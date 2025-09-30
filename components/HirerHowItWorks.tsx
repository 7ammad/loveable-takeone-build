'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';

export function HirerHowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Post Your Casting Call",
      description: "Create detailed casting calls with requirements, deadlines, and project details."
    },
    {
      number: "02", 
      title: "Review Applications",
      description: "Browse through qualified talent applications and review portfolios and reels."
    },
    {
      number: "03",
      title: "Connect & Cast",
      description: "Contact selected talent directly and manage your casting process efficiently."
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
            How It Works for Casters
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Get started in three simple steps and find the perfect talent for your next project.
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
