import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrainers() {
      try {
        setLoading(true);
        const res = await fetch('/api/trainers');
        if (!res.ok) throw new Error('Failed to fetch trainers');
        const { trainers } = await res.json();

        const enriched = await Promise.all(
          trainers.map(async (t) => {
            const cRes = await fetch(`/api/classes?trainerId=${t._id}`);
            const { classes } = cRes.ok ? await cRes.json() : { classes: [] };
            const types = Array.from(new Set(classes.map((c) => c.classType))).map(
              (type) => type.charAt(0).toUpperCase() + type.slice(1)
            );
            return { ...t, classCount: classes.length, classTypes: types };
          })
        );
        setTrainers(enriched);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">Error: {error}</Alert>;
  }

  return (
    <>
      <Header />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          backgroundImage: 'url("/images/dashboard.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          pt: 4,
          mt: '-70px',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
        <Box sx={{ position: 'relative', maxWidth: 1500, mx: 'auto', p: 3, color: 'text.primary', mt: '70px' }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 4 }}>
            Meet Our Trainers
          </Typography>
          <Grid container spacing={6}>
            {trainers.map((t) => (
              <Grid item xs={12} sm={6} key={t._id}>
                <Card sx={{ bgcolor: 'background.paper', boxShadow: 4, borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: 300 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 56, height: 56 }}>
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {t.trainerName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Classes: {t.classCount}</Typography>
                    </Box>
                    {t.classTypes.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          Offers:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {t.classTypes.map((type) => (
                            <Chip
                              key={type}
                              label={type}
                              size="small"
                              sx={{ bgcolor: 'secondary.light', color: 'text.primary' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    <Box sx={{ mt: 'auto' }}>
                      <Link href={`/trainer/${t._id}/classes`} passHref>
                        <Button variant="contained" fullWidth size="large">
                          View Classes
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
