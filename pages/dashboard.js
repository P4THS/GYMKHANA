import React from 'react';
import { AppBar, Toolbar, Button, Typography, Stack } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const r = useRouter();
  // while loading auth state, render nothing (or a placeholder)
  if (loading) return null;

  const isMember  = session?.user?.role === 'member';
  const isTrainer = session?.user?.role === 'trainer';

  if (!session) {
    r.push('/')
  } else if (isMember) {
    r.push('/dashboard-member')
  } else if (isTrainer) {
    r.push('/dashboard-trainer')
  }
}