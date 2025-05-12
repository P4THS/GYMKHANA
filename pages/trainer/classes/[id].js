import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MongoClient, ObjectId } from 'mongodb';

export default function ClassDetail({ schedule, initialMembers }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  if (router.isFallback) {
    return <Typography>Loading...</Typography>;
  }

  const [members, setMembers] = useState(initialMembers);
  const userEnrolledInitially = initialMembers.some((m) => m.userId === userId);
  const [userEnrolled, setUserEnrolled] = useState(userEnrolledInitially);

  const handleEnroll = async () => {
    if (!userId) return router.push('/login');
    await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, classId: schedule._id }),
    });
    setUserEnrolled(true);
    setMembers((prev) => [...prev, { userId, userName: session.user.name }]);
  };

  const handleUnenroll = async () => {
    await fetch('/api/enrollments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, classId: schedule._id }),
    });
    setUserEnrolled(false);
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  const start = new Date(schedule.schedule);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  return (
    <>
      <Header />
      <Box sx={{ position: 'relative', minHeight: '100vh', backgroundImage: 'url("/images/classes.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', pt: 4, mt: '-70px' }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
        <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto', p: 3, color: 'text.primary', mt: '70px' }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main' }}>Class Details</Typography>
          <Paper sx={{ p: 3, mb: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>Schedule</Typography>
            <Typography>{start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
            <Typography mt={1}>Max Capacity: {schedule.maxCapacity}</Typography>
          </Paper>

          {session?.user?.role === 'member' && (
            <Box textAlign="center" mb={3}>
              {userEnrolled ? (
                <Button variant="outlined" color="error" onClick={handleUnenroll}>Cancel Enrollment</Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleEnroll}>Enroll in Class</Button>
              )}
            </Box>
          )}

          <Typography variant="h6" gutterBottom>Enrolled Members ({members.length})</Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <List>
              {members.map((m) => (
                <ListItem key={m.userId}><ListItemText primary={m.userName} /></ListItem>
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
  if (!classDoc) {
    client.close();
    return { notFound: true };
  }

  const enrolls = await db.collection('class_enrollments').find({ classId: new ObjectId(params.id) }).toArray();
  const members = await Promise.all(enrolls.map(async (en) => {
    const user = await db.collection('users').findOne({ _id: new ObjectId(en.userId) });
    return { userId: en.userId.toString(), userName: user?.userName || 'Unknown' };
  }));

  client.close();

  return {
    props: {
      schedule: JSON.parse(JSON.stringify({ ...classDoc, _id: classDoc._id.toString() })),
      initialMembers: members,
    },
    revalidate: 60,
  };
}