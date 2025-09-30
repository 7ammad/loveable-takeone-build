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

export function HirerValuePropositions() {
  const propositions = [
    {
      title: "Access to Top Talent",
      description: "Connect with verified actors, models, and performers from across Saudi Arabia. Our platform ensures quality and authenticity.",
      icon: "🎭"
    },
    {
      title: "Streamlined Casting Process",
      description: "Post your casting calls, review applications, and manage auditions all in one place. Save time and reduce administrative overhead.",
      icon: "⚡"
    },
    {
      title: "Verified Professionals",
      description: "Every talent profile is verified and includes portfolios, reels, and experience details. Make informed casting decisions.",
      icon: "✅"
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
            Why Choose TakeOne for Casting?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            We&apos;re revolutionizing how production companies and casting directors find and connect with talent in Saudi Arabia.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {propositions.map((proposition, index) => (
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
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{ mb: 2, fontSize: '3rem' }}
                  >
                    {proposition.icon}
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {proposition.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {proposition.description}
                  </Typography>
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
