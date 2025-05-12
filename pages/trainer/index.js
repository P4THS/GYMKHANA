import React from 'react';
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
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';

export default function TrainersPage({ trainers, error }) {
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

export async function getServerSideProps() {
  try {
    // Fetch all trainers
    const trainersRes = await fetch(`http://localhost:3000/api/trainers`);
    if (!trainersRes.ok) throw new Error('Failed to fetch trainers');
    const { trainers: rawTrainers } = await trainersRes.json();

    // For each trainer, fetch class data
    const trainers = await Promise.all(
      rawTrainers.map(async (t) => {
        const cRes = await fetch(
          `http://localhost:3000/api/classes?trainerId=${t._id}`
        );
        const { classes = [] } = cRes.ok ? await cRes.json() : { classes: [] };
        const types = Array.from(new Set(classes.map((c) => c.classType)))
          .map((type) => type.charAt(0).toUpperCase() + type.slice(1));

        return {
          _id: t._id,
          trainerName: t.trainerName,
          classCount: classes.length,
          classTypes: types,
        };
      })
    );

    return { props: { trainers } };
  } catch (err) {
    return { props: { trainers: [], error: err.message } };
  }
}
