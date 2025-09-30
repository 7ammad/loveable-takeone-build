'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';

export function HirerHeroSection() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255, 68, 170, 0.1) 0%, transparent 50%, rgba(255, 68, 170, 0.05) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            Find Your Next
            <br />
            <Box component="span" color="primary.main">
              Perfect Cast
            </Box>
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Stop posting casting calls across multiple platforms. TakeOne brings you access to Saudi Arabia&apos;s most talented actors, models, and performers in one organized platform.
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
              }}
            >
              Post Your Casting Call
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderColor: 'text.primary',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              Browse Talent
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
