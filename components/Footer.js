import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0e0e0e',
        color: '#fff',
        pt: 6,
        pb: 2,
        px: { xs: 3, md: 10 },
      }}
    >
      <Grid container spacing={4} justifyContent="space-between">
        {/* Logo and Description */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '2px',
              mb: 1,
              fontFamily: 'Poppins, sans-serif',
              color: '#ff9f1c',
            }}
          >
            GYM KHANA
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Where strength meets dedication. Your transformation starts here.
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Quick Links
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link href="/" underline="hover" color="inherit">Home</Link>
            <Link href="/join-member" underline="hover" color="inherit">Join as Member</Link>
            <Link href="/join-trainer" underline="hover" color="inherit">Join as Trainer</Link>
          </Box>
        </Grid>

        {/* Social Icons */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Connect With Us
          </Typography>
          <Box>
            <IconButton href="#" sx={{ color: '#ff9f1c' }}>
              <InstagramIcon />
            </IconButton>
            <IconButton href="#" sx={{ color: '#ff9f1c' }}>
              <FacebookIcon />
            </IconButton>
            <IconButton href="#" sx={{ color: '#ff9f1c' }}>
              <XIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: '#333' }} />

      <Typography variant="body2" align="center" sx={{ color: '#666' }}>
        © {new Date().getFullYear()} GYM KHANA. All rights reserved.
      </Typography>
    </Box>
  );
}
