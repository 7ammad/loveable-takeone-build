'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import Link from 'next/link';

export function Footer() {
  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: 'background.default',
        borderTop: '1px solid #333333',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 6 }}>
          {/* Column 1: Logo & Description */}
          <Box>
            <Link href="/" passHref>
              <MuiLink
                component="div"
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  TakeOne
                </Typography>
              </MuiLink>
            </Link>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Connecting talent with casting opportunities across Saudi Arabia.
            </Typography>
            <Stack direction="row" spacing={2}>
              <MuiLink href="#" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                Twitter
              </MuiLink>
              <MuiLink href="#" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                Instagram
              </MuiLink>
              <MuiLink href="#" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                LinkedIn
              </MuiLink>
            </Stack>
          </Box>

          {/* Column 2: Newsletter */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
              }}
            >
              Stay Updated
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 3,
              }}
            >
              Join our newsletter for the latest casting calls and industry news.
            </Typography>
            <Stack spacing={2}>
              <TextField
                placeholder="Your email address"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#2a2a2a',
                    '& fieldset': {
                      borderColor: '#333333',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Box>

          {/* Column 3: Quick Links - Platform */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
              }}
            >
              Platform
            </Typography>
            <Stack spacing={1}>
              <Link href="/talent" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  For Talent
                </Typography>
              </Link>
              <Link href="/casters" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  For Casters
                </Typography>
              </Link>
              <Link href="/search" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  Search Casting Calls
                </Typography>
              </Link>
              <Link href="/how-it-works" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  How It Works
                </Typography>
              </Link>
            </Stack>
          </Box>

          {/* Column 4: Quick Links - Company */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
              }}
            >
              Company
            </Typography>
            <Stack spacing={1}>
              <Link href="/about" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  About Us
                </Typography>
              </Link>
              <Link href="/careers" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  Careers
                </Typography>
              </Link>
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  News & Blog
                </Typography>
              </Link>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
                <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                  Contact
                </Typography>
              </Link>
            </Stack>
          </Box>
        </Box>

        {/* Sub-footer */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid #333333',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
            }}
          >
            &copy; {new Date().getFullYear()} TakeOne. All rights reserved.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Link href="/privacy" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                Privacy Policy
              </Typography>
            </Link>
            <Link href="/terms" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                Terms of Service
              </Typography>
            </Link>
            <Link href="/cookies" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, cursor: 'pointer' }}>
                Cookie Policy
              </Typography>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
