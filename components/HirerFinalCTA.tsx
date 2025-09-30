'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';

export function HirerFinalCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <Box
        sx={{
          py: 8,
          backgroundColor: 'primary.main',
          background: 'linear-gradient(135deg, #FF44AA 0%, #E91E63 100%)',
        }}
      >
        <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
            }}
          >
            Ready to Find Your Perfect Cast?
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Join leading production companies and casting directors who are already using TakeOne to discover and connect with Saudi Arabia&apos;s most talented performers.
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Start Casting Today
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Learn More
            </Button>
          </Stack>
          
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mt: 3,
            }}
          >
            No setup fees • Free to post • Cancel anytime
          </Typography>
        </Box>
      </Container>
      </Box>
    </motion.div>
  );
}
