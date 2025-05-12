import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Collapse,
  Alert,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TrainerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [trainerId, setTrainerId] = useState(null);
  const [trainer, setTrainer] = useState(null);
  const [classes, setClasses] = useState([]);
  const [remainingSeats, setRemainingSeats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [className, setClassName] = useState('');
  const [classType, setClassType] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');

  const classTypes = [
    { id: 'boxing', name: 'Boxing' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'gymnastics', name: 'Gymnastics' },
    { id: 'weightlifting', name: 'Weightlifting' },
    { id: 'hiit', name: 'HIIT Training' },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      const next = (i + 1) < 10 ? `0${i + 1}` : `${i + 1}`;
      slots.push({ value: `${hour}:00`, label: `${hour}:00 - ${next}:00` });
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') return router.push('/auth/signin');
    if (session?.user?.role !== 'trainer') return router.push('/');
    if (session?.user?.id) setTrainerId(session.user.id);
  }, [status, session, router]);

  useEffect(() => {
    if (!trainerId) return;
    const fetchData = async () => {
      try {
        const tRes = await fetch(`/api/trainers?trainerId=${trainerId}`);
        if (!tRes.ok) throw new Error('Failed to fetch trainer');
        const { trainer } = await tRes.json();
        const cRes = await fetch(`/api/classes?trainerId=${trainerId}`);
        if (!cRes.ok) throw new Error('Failed to fetch classes');
        const { classes } = await cRes.json();
        setTrainer(trainer);
        setClasses(classes);

        const seats = {};
        await Promise.all(classes.map(async (c) => {
          const res = await fetch(`/api/enrollments?classId=${c.id}`);
          if (!res.ok) return;
          const { enrollments } = await res.json();
          seats[c._id] = c.maxCapacity - enrollments.length;
        }));
        setRemainingSeats(seats);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trainerId]);

  const checkConflict = (time) => {
    const [h] = time.split(':').map(Number);
    return classes.some(c => new Date(c.schedule).getHours() === h);
  };

  const handleAdd = async () => {
    setFormError('');
    if (!className || !classType || !selectedTime) {
      setFormError('All fields are required');
      return;
    }
    setAdding(true);
    try {
      const [hour] = selectedTime.split(':').map(Number);
      const schedule = new Date();
      schedule.setHours(hour, 0, 0, 0);
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId, className, classType, schedule: schedule.toISOString(), maxCapacity: Number(maxCapacity) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add');
      }
      const { class: newC } = await res.json();
      setClasses(prev => [...prev, newC]);
      setRemainingSeats(prev => ({ ...prev, [newC._id]: newC.maxCapacity }));
      setClassName(''); setClassType(''); setSelectedTime(''); setMaxCapacity(10);
      setShowAddForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Confirm deletion?')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Delete failed');
      }
      setClasses(prev => prev.filter(c => c._id !== id));
      setRemainingSeats(prev => { const s = { ...prev }; delete s[id]; return s; });
    } catch (err) {
      setError(err.message);
    }
  };

  const viewDetails = (id) => router.push(`/trainer/classes/${id}`);

  if (loading) return <Typography align="center" mt={4}>Loading...</Typography>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <>
    <Header/>
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: 'url("/images/dashboard.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        pt: 4,
        mt: '-70px'
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
      <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto', p: 2, color: 'text.primary', mt:'70px'}}>
        <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main' }}>
          Welcome, {trainer.trainerName}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>Your Classes</Typography>
          <Button variant="contained" color={showAddForm ? 'secondary' : 'primary'} onClick={() => setShowAddForm(v => !v)}>
            {showAddForm ? 'Cancel' : '+ Add New Class'}
          </Button>
        </Box>
        <Collapse in={showAddForm} sx={{ mb: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.primary' }}>Add New Class</Typography>
              {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                <TextField label="Class Name" fullWidth value={className} onChange={e => setClassName(e.target.value)} InputLabelProps={{ style: { color: '#fff' } }} />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#fff' }}>Class Type</InputLabel>
                  <Select label="Class Type" value={classType} onChange={e => setClassType(e.target.value)}>
                    {classTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#fff' }}>Time Slot</InputLabel>
                  <Select label="Time Slot" value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
                    {timeSlots.map(slot => (
                      <MenuItem key={slot.value} value={slot.value} disabled={checkConflict(slot.value)}>
                        {slot.label}{checkConflict(slot.value) ? ' (Unavailable)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Max Capacity" type="number" fullWidth value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} InputLabelProps={{ style: { color: '#fff' } }} />
              </Box>
              <Box textAlign="right" mt={2}>
                <Button variant="contained" color="secondary" onClick={handleAdd} disabled={adding}>{adding ? 'Adding...' : 'Add Class'}</Button>
              </Box>
            </CardContent>
          </Card>
        </Collapse>
        {classes.length > 0 ? (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Seats (Remaining/Total)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map(c => {
                  const start = new Date(c.schedule);
                  const end = new Date(start); end.setHours(start.getHours() + 1);
                  return (
                    <TableRow key={c._id} hover onClick={() => viewDetails(c._id)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{c.className || 'Unnamed'}</TableCell>
                      <TableCell>{classTypes.find(t => t.id === c.classType)?.name || c.classType}</TableCell>
                      <TableCell>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{remainingSeats[c._id] ?? c.maxCapacity}/{c.maxCapacity}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleDelete(c._id, e)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography align="center" mt={4} color="text.secondary">No classes scheduled yet. Add your first class above.</Typography>
        )}
      </Box>
    </Box>
    <Footer/>
    </>
  );
}
