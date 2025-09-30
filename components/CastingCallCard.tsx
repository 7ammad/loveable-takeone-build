'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface CastingCallCardProps {
  projectTitle: string;
  role: string;
  city: string;
  company?: string;
  deadline?: string;
}

export function CastingCallCard({ 
  projectTitle, 
  role, 
  city, 
  company,
  deadline 
}: CastingCallCardProps) {
  return (
    <Card
      sx={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #333333',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(255, 68, 170, 0.1)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          fontWeight="bold"
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {projectTitle}
        </Typography>
        
        <Typography 
          variant="body1" 
          color="primary.main"
          fontWeight="medium"
          sx={{ mb: 2 }}
        >
          {role}
        </Typography>

        {company && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {company}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn 
            sx={{ 
              fontSize: 16, 
              color: 'primary.main', 
              mr: 1 
            }} 
          />
          <Typography variant="body2" color="text.secondary">
            {city}
          </Typography>
        </Box>

        {deadline && (
          <Chip
            label={`Deadline: ${deadline}`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 68, 170, 0.1)',
              color: 'primary.main',
              border: '1px solid rgba(255, 68, 170, 0.3)',
            }}
          />
        )}
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          fullWidth
          sx={{
            borderColor: 'text.primary',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              backgroundColor: 'rgba(255, 68, 170, 0.1)',
            },
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}
