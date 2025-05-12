// components/Header.js
import React from 'react';
import { AppBar, Toolbar, Button, Typography, Stack } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  // while loading auth state, render nothing (or a placeholder)
  if (loading) return null;

  const isMember  = session?.user?.role === 'member';
  const isTrainer = session?.user?.role === 'trainer';

  // decide which links to show
  let links = [];

  if (!session) {
    links = [
      { label: 'Home', href: '/' },
      { label: 'Join as Trainer', href: '/join-trainer' },
      { label: 'Join as Member', href: '/join-member' },
      { label: 'Login', href: '/login' },
      { label: 'Our Trainers', href: '/trainer' }
    ];
  } else if (isMember) {
    links = [
      { label: 'Dashboard', href: '/dashboard-member' },
      { label: 'Lockers',   href: '/locker'   },
      { label: 'Classes',   href: '/classes'   },
      { label: 'Trainers',  href: '/trainer'  },
    ];
  } else if (isTrainer) {
    links = [
      { label: 'Dashboard',  href: '/dashboard'  }
    ];
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(6px)',
        px: { xs: 2, md: 6 },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '70px',
        }}
      >
        {/* Logo */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            color: '#ff9f1c',
            letterSpacing: '2px',
          }}
        >
          <FitnessCenterIcon sx={{ mr: 1, color: '#ff3c38' }} />
          GYM <span style={{ color: '#fff', marginLeft: '5px' }}>KHANA</span>
        </Typography>

        {/* Links */}
        <Stack direction="row" spacing={2}>
          {links.map(({ label, href }) => (
            <Button
              key={label}
              href={href}
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                '&:hover': { color: '#ff9f1c' },
              }}
            >
              {label}
            </Button>
          ))}

          {/* If logged in, show Logout */}
          {session && (
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                '&:hover': { color: '#ff9f1c' },
              }}
            >
              Logout
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
