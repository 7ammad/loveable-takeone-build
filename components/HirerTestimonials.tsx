'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';

export function HirerTestimonials() {
  const testimonials = [
    {
      name: "Mohammed Al-Sheikh",
      role: "Casting Director, MBC",
      quote: "TakeOne has transformed how we find talent. The quality of actors and the streamlined application process has saved us countless hours.",
      image: "🎬"
    },
    {
      name: "Sarah Al-Mansouri", 
      role: "Producer, Telfaz11",
      quote: "We've cast 5 major projects through TakeOne. The verification process ensures we only see serious, professional talent.",
      image: "🎭"
    },
    {
      name: "Ahmed Al-Rashid",
      role: "Director, Independent Films",
      quote: "As an independent filmmaker, TakeOne gives me access to the same talent pool as major studios. It's been a game-changer.",
      image: "🎥"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <Box sx={{ py: 8, backgroundColor: 'rgba(26, 26, 26, 0.5)' }}>
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
            What Our Casters Say
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Join leading production companies and casting directors who trust TakeOne for their talent needs.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {testimonials.map((testimonial, index) => (
            <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid #333333',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 32px rgba(255, 68, 170, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" sx={{ fontSize: '3rem' }}>
                      {testimonial.image}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.primary',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      mb: 3,
                      fontSize: '1.1rem',
                    }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {testimonial.role}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
      </Box>
    </motion.div>
  );
}
