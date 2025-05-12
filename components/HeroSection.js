import React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleIcon from '@mui/icons-material/People';

export default function HeroSection() {
  return (
    <>
    <Box
    sx={{
        position: 'relative',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'url("/images/hero-placeholder.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        mt: '-70px', // Offset padding added by sticky header
        
        '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
        zIndex: 1,
        },
    }}
    >

      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h1" sx={{
        fontSize: { xs: '2.2rem', md: '3.5rem' },
        fontWeight: 700,
        letterSpacing: '0.5px', // Previously 2px — reduced
        lineHeight: 1.3,
        mb: 2,
        }}>
        Push Your Limits <br />
        <span style={{ color: '#ff3c38' }}>With GYM <span style={{ color: '#ff9f1c' }}>KHANA</span></span>
        </Typography>

        <Typography variant="h6" sx={{
          fontWeight: 300,
          mb: 4,
          maxWidth: '500px',
          color: '#b0b0b0'
        }}>
          Build your strength, discipline, and confidence with elite trainers and cutting-edge facilities.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            href="/join-member"
            sx={{
              borderRadius: '30px',
              fontWeight: 'bold',
            }}
          >
            Join Now
          </Button>

          <Button
            variant="outlined"
            size="large"
            color="secondary"
            endIcon={<PeopleIcon />}
            href="/trainer"
            sx={{
              borderRadius: '30px',
              fontWeight: 'bold',
              color: '#fff',
              borderColor: '#ff9f1c',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: '#ff9f1c22',
              },
            }}
          >
            Meet Trainers
          </Button>
        </Stack>
      </Container>
    </Box>
    
    </>
  );
}
