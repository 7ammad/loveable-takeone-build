'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Al-Rashid",
      role: "Actress",
      quote: "TakeOne helped me land my first major role in a Saudi TV series. The platform made it so easy to find opportunities I never would have known about.",
      image: "👩‍🎭"
    },
    {
      name: "Ahmed Al-Mansouri", 
      role: "Voice Actor",
      quote: "I've been using TakeOne for 6 months and already booked 3 commercial gigs. The real-time notifications are a game-changer.",
      image: "👨‍🎤"
    },
    {
      name: "Fatima Al-Zahra",
      role: "Model & Actress",
      quote: "Finally, a platform that understands the Saudi entertainment industry. The verification process gives me confidence in every opportunity.",
      image: "👩‍💼"
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
            What Our Talent Says
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Join thousands of successful actors, models, and performers who trust TakeOne for their careers.
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
