import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClassDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [schedule, setSchedule] = useState(null);
  const [members, setMembers] = useState([]);
  const [userEnrolled, setUserEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to fetch user names for each enrollment
  const fetchMembersWithNames = async (enrolled) => {
    return await Promise.all(
      enrolled.map(async (en) => {
        try {
          const userRes = await fetch(`/api/users?userId=${en.userId}`);
          if (!userRes.ok) throw new Error('Failed to fetch user data');
          const userData = await userRes.json();
          return { ...en, userName: userData.user.userName };
        } catch {
          return { ...en, userName: 'Unknown Member' };
        }
      })
    );
  };

  // Fetch class details and enrollments
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classRes, enrollRes] = await Promise.all([
          fetch(`/api/classes/${id}`),
          fetch(`/api/enrollments?classId=${id}`),
        ]);
        if (!classRes.ok) throw new Error('Failed to fetch class details');
        if (!enrollRes.ok) throw new Error('Failed to fetch enrollments');

        const classData = await classRes.json();
        const enrollData = await enrollRes.json();
        setSchedule(classData.class);

        const enrolled = enrollData.members || [];
        const membersWithNames = await fetchMembersWithNames(enrolled);
        setMembers(membersWithNames);

        if (userId) {
          setUserEnrolled(
            membersWithNames.some((en) => en.userId === userId)
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleEnroll = async () => {
    if (!userId) return router.push('/login');
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, classId: id }),
      });
      if (!res.ok) throw new Error('Failed to enroll');
      setUserEnrolled(true);

      const upd = await fetch(`/api/enrollments?classId=${id}`);
      const data = await upd.json();
      const membersWithNames = await fetchMembersWithNames(data.members || []);
      setMembers(membersWithNames);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnenroll = async () => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, classId: id }),
      });
      if (!res.ok) throw new Error('Failed to unenroll');
      setUserEnrolled(false);

      const upd = await fetch(`/api/enrollments?classId=${id}`);
      const data = await upd.json();
      const membersWithNames = await fetchMembersWithNames(data.members || []);
      setMembers(membersWithNames);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box m={4}>
        <Alert severity="info">No class details available.</Alert>
      </Box>
    );
  }

  const start = new Date(schedule.schedule);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  return (
    <>
      <Header />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          backgroundImage: 'url("/images/classes.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          pt: 4,
          mt: '-70px',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
        <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto', p: 3, color: 'text.primary', mt: '70px' }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main' }}>
            Class Details
          </Typography>

          <Paper sx={{ p: 3, mb: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Schedule
            </Typography>
            <Typography>
              {start.toLocaleDateString()} {' '}
              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
              {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography mt={1}>
              Max Capacity: {schedule.maxCapacity}
            </Typography>
          </Paper>

          {/* Enroll/Unenroll Button for members */}
          {session?.user?.role === 'member' && (
            <Box textAlign="center" mb={3}>
              {userEnrolled ? (
                <Button variant="outlined" color="error" onClick={handleUnenroll}>
                  Cancel Enrollment
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleEnroll}>
                  Enroll in Class
                </Button>
              )}
            </Box>
          )}

          <Typography variant="h6" gutterBottom>
            Enrolled Members ({members.length})
          </Typography>
          {members.length > 0 ? (
            <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
              <List>
                {members.map((m) => (
                  <ListItem key={m.enrollmentId || m.userId}>
                    <ListItemText primary={m.userName} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Typography color="text.secondary">No members enrolled yet.</Typography>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
}
