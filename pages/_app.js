import React from 'react';
import Head from 'next/head';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { TimeSlotProvider } from '@/context/TimeSlotContext';

const intenseDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff3c38', // Bold red accent
    },
    secondary: {
      main: '#ff9f1c', // Orange accent for secondary UI
    },
    background: {
      default: '#0e0e0e', // Near black background
      paper: '#1c1c1c',   // Dark but separated card background
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: `'Poppins', 'Segoe UI', 'Roboto', 'sans-serif'`,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h6: {
      fontWeight: 300,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 20px',
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 0 8px rgba(255, 60, 56, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1c1c1c',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
  },
});

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <title>GYM KHANA</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      </Head>
      <ThemeProvider theme={intenseDarkTheme}>
        <SessionProvider session={session}>
          <TimeSlotProvider>
        <CssBaseline />
        <Component {...pageProps} />
        </TimeSlotProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
