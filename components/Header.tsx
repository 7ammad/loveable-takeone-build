'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: isScrolled ? 'rgba(26, 26, 26, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold"
            sx={{
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            TakeOne
          </Typography>
        </Link>

        {/* Spacer to push navigation to center */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, mr: 4 }}>
          <Link href="/talent" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Talent
            </Typography>
          </Link>
          <Link href="/casters" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Casters
            </Typography>
          </Link>
          <Link href="/news" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              News
            </Typography>
          </Link>
          <Link href="/resources" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Resources
            </Typography>
          </Link>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link href="/signin" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Sign In
            </Typography>
          </Link>
          <Button 
            variant="contained" 
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Join
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
