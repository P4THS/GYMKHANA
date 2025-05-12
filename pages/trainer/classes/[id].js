import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTimeSlot } from '@/context/TimeSlotContext';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MongoClient, ObjectId } from 'mongodb';

export default function ClassDetail({ schedule, initialMembers }) {
  const { timeSlotUsage, setTimeSlotUsage } = useTimeSlot();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // show fallback loading
  if (router.isFallback || status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // local enrollment state
  const [members, setMembers] = useState(initialMembers);
  const [userEnrolled, setUserEnrolled] = useState(false);

  // determine if current user is enrolled
  useEffect(() => {
    if (userId) {
      const enrolled = members.some((m) => m.userId === userId);
      setUserEnrolled(enrolled);
    }
  }, [members, userId]);

  // compute schedule times
  const start = new Date(schedule.schedule);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  const handleEnroll = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    if (userEnrolled) {
      alert('You are already enrolled in this class.');
      return;
    }

    const hour = start.getHours();
    if (timeSlotUsage[hour]) {
      alert('You already have a class at that time slot!');
      return;
    }

    // optimistic update
    setTimeSlotUsage((prev) => {
      const next = [...prev];
      next[hour] = userId;
      return next;
    });

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, classId: schedule._id }),
      });
      if (!res.ok) throw new Error();

      setUserEnrolled(true);
      setMembers((prev) => [...prev, { userId, userName: session.user.name }]);
    } catch (err) {
      // rollback
      setTimeSlotUsage((prev) => {
        const next = [...prev];
        next[start.getHours()] = null;
        return next;
      });
      console.error(err);
      alert('Enrollment failed.');
    }
  };

  const handleUnenroll = async () => {
    if (!userEnrolled) {
      alert('You are not enrolled in this class.');
      return;
    }
    const hour = start.getHours();
    try {
      const res = await fetch('/api/enrollments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, classId: schedule._id }),
      });
      if (!res.ok) throw new Error();

      setTimeSlotUsage((prev) => {
        const next = [...prev];
        next[hour] = null;
        return next;
      });
      setUserEnrolled(false);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      console.error(err);
      alert('Could not unenroll.');
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ position: 'relative', minHeight: '100vh', backgroundImage: 'url("/images/classes.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', pt: 4, mt: '-70px' }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
        <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto', p: 3, color: 'text.primary', mt: '70px' }}>

          {/* Title & Instructor */}
          <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main' }}>
            {schedule.className}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Instructor: {schedule.trainerName}
          </Typography>

          {/* Schedule and capacity */}
          <Paper sx={{ p: 3, mb: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6">Schedule</Typography>
            <Typography>
              {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
              {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography>Max Capacity: {schedule.maxCapacity}</Typography>
          </Paper>

          {/* Enrollment controls */}
          {session?.user?.role === 'member' && (
            <Box textAlign="center" mb={2}>
              {userEnrolled ? (
                <Alert severity="success" sx={{ mb: 1 }}>
                  You are enrolled in this class.
                </Alert>
              ) : null}
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

          {/* Member list */}
          <Typography variant="h6" gutterBottom>Enrolled Members ({members.length})</Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <List>
              {members.map((m) => (
                <ListItem key={m.userId}>
                  <ListItemText primary={m.userName} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");
  const classes = await db.collection('classes').find({}, { projection: { _id: 1 } }).toArray();
  client.close();
  const paths = classes.map((c) => ({ params: { id: c._id.toString() } }));
  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");
  const classDoc = await db.collection('classes').findOne({ _id: new ObjectId(params.id) });
  if (!classDoc) { client.close(); return { notFound: true }; }
  const enrolls = await db.collection('class_enrollments').find({ classId: new ObjectId(params.id) }).toArray();
  const members = await Promise.all(enrolls.map(async (en) => {
    const user = await db.collection('users').findOne({ _id: new ObjectId(en.userId) });
    return { userId: en.userId.toString(), userName: user?.userName || 'Unknown' };
  }));
  client.close();
  const schedule = JSON.parse(JSON.stringify({
    _id: classDoc._id.toString(),
    className: classDoc.className,
    trainerName: classDoc.trainerName,
    schedule: classDoc.schedule,
    maxCapacity: classDoc.maxCapacity,
  }));
  return { props: { schedule, initialMembers: members }, revalidate: 10 };
}
