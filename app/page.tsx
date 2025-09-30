'use client';

import Link from 'next/link';
import { Button, Container, Typography, Box } from '@mui/material';

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" sx={{ mb: 4, color: 'text.primary' }}>
        Welcome to TakeOne
      </Typography>
      <Typography variant="h5" sx={{ mb: 6, color: 'text.secondary' }}>
        Saudi Arabia&apos;s Casting Marketplace
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Link href="/talent" passHref>
          <Button variant="contained" size="large">
            I&apos;m Talent
          </Button>
        </Link>
        <Link href="/casters" passHref>
          <Button variant="outlined" size="large">
            I&apos;m a Caster
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
