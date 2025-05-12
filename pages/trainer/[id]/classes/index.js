import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TrainerClassesPage() {
  const router = useRouter();
  const { id } = router.query;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/classes?trainerId=${id}`);
        if (!res.ok) throw new Error('Failed to fetch classes');
        const { classes } = await res.json();
        setClasses(classes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [id]);

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
      <Box sx={{ position: 'relative', minHeight: '100vh', backgroundImage: 'url("/images/dashboard.png")', backgroundSize: 'cover', backgroundPosition: 'center', pt: 4, mt: '-70px' }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
        <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto', p: 3, color: 'text.primary', mt: '70px' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2, color: '#fff' }}>
            Back to Trainers
          </Button>
          <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 3 }}>
            Classes Offered
          </Typography>

          {classes.length > 0 ? (
            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((c) => {
                    const start = new Date(c.schedule);
                    const end = new Date(start);
                    end.setHours(start.getHours() + 1);
                    return (
                      <TableRow key={c._id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/trainer/classes/${c._id}`)}>
                        <TableCell>{c.className || 'Unnamed'}</TableCell>
                        <TableCell>{c.classType}</TableCell>
                        <TableCell>{start.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell>{c.maxCapacity}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">Details</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography align="center" color="text.secondary">No classes found for this trainer.</Typography>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
}
