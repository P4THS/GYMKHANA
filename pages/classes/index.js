import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTimeSlot } from '@/context/TimeSlotContext';

export default function ClassesPage({ initialClasses, initialEnrollments }) {
  const { setTimeSlotUsage } = useTimeSlot();
  const router = useRouter();
  const { data: authData, status: authStatus } = useSession();
  const isPending = authStatus === "loading";
  const isUserLoggedIn = authStatus === "authenticated";
  const userId = authData?.user?.id;

  const [classes] = useState(initialClasses);
  const [enrolledClasses] = useState(initialEnrollments);

  const isUserEnrolled = (classId) =>
    enrolledClasses.some((enrollment) => enrollment.classId === classId);

  const handleEnroll = async (classId) => {
  if (!isUserLoggedIn) {
    alert("Please log in to enroll in classes");
    router.push("/login");
    return;
  }

  // figure out the hour of the class they want
  const cls = classes.find((c) => c._id === classId);
  const hour = new Date(cls.schedule).getHours();

  // if that hour is already occupied, bail out
  let canEnroll = true;
  setTimeSlotUsage((prev) => {
    if (prev[hour]) {
      canEnroll = false;
      return prev;
    }
    const next = [...prev];
    next[hour] = userId; 
    return next;
  });

  if (!canEnroll) {
    alert("You already have a class at that time slot!");
    return;
  }

  // go talk to your API
  try {
    const res = await fetch("/api/class-enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, classId }),
    });
    if (!res.ok) throw new Error("Failed to enroll");
    // optionally pull down the new enrollments list, or just reload
    router.reload()
    router.replace(router.asPath);
  } catch (err) {
    // rollback your optimistic context update
    setTimeSlotUsage((prev) => {
      const next = [...prev];
      next[hour] = null;
      return next;
    });
    console.error(err);
    alert("Enrollment failed. Please try again.");
  }
};

  const handleUnenroll = async (classId) => {
  try {
    const res = await fetch("/api/class-enrollments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, classId }),
    });
    if (!res.ok) throw new Error("Failed to unenroll");

    // clear our context slot
    const cls = classes.find((c) => c._id === classId);
    const hour = new Date(cls.schedule).getHours();
    setTimeSlotUsage((prev) => {
      const next = [...prev];
      next[hour] = null;
      return next;
    });

    // reload data
    router.reload()
    router.replace(router.asPath);
  } catch (err) {
    console.error(err);
    alert("Could not cancel enrollment. Try again.");
  }
};

  if (isPending)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );

  return (
    <>
      <Header />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: 'url("/images/dashboard.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          pt: 4,
          mt: "-70px",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)" }} />
        <Box
          sx={{ position: "relative", maxWidth: 800, mx: "auto", p: 2, color: "text.primary", mt: "70px" }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: "secondary.main" }}>
            Gym Classes
          </Typography>

          {!isUserLoggedIn && (
            <Alert severity="info" sx={{ mb: 4 }}>
              Please log in to enroll in classes.
            </Alert>
          )}

          <Paper elevation={4} sx={{ p: 3, bgcolor: "rgba(28,28,28,0.75)", color: "#fff" }}>
            <Typography variant="h6" gutterBottom>
              Available Classes
            </Typography>
            <List>
              {classes.length === 0 ? (
                <Typography>No classes available at this time.</Typography>
              ) : (
                classes.map((classItem) => {
                  const enrolled = isUserEnrolled(classItem._id);
                  const isFull = classItem.availableSpots <= 0;
                  return (
                    
                    <ListItem
                      key={classItem._id}
                      disableGutters
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        bgcolor: "rgba(0,0,0,0.5)",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Link href={"/trainer/classes/"+classItem._id}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#fff" }}>
                            {classItem.className}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="gray">
                              <strong>Instructor:</strong> {classItem.trainerName}
                            </Typography>
                            <Typography variant="body2" color="gray">
                              <strong>Time:</strong> {new Date(classItem.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            <Typography variant="body2" color="gray">
                              <strong>Available Spots:</strong> {`${classItem.availableSpots}/${classItem.maxCapacity}`}
                            </Typography>
                          </>
                        }
                      />
                      </Link>
                      {isFull ? (
                        <Button variant="contained" color="secondary" disabled>
                          Class Full
                        </Button>
                      ) : enrolled ? (
                        <Button variant="outlined" color="error" onClick={() => handleUnenroll(classItem._id)}>
                          Cancel Enrollment
                        </Button>
                      ) : (
                        <Button variant="contained" color="primary" onClick={() => handleEnroll(classItem._id)}>
                          Enroll
                        </Button>
                      )}
                    </ListItem>

                  );
                })
              )}
            </List>
          </Paper>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Link href={isUserLoggedIn ? "/dashboard-member" : "/"} passHref>
              <Button variant="contained" color="primary">
                {isUserLoggedIn ? "Back to Profile" : "Back to Home"}
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  let initialClasses = [];
  let initialEnrollments = [];
  try {
    const classesRes = await fetch(`http://localhost:3000/api/classes`);
    if (classesRes.ok) {
      const data = await classesRes.json();
      initialClasses = data.classes;
    }
    if (session?.user?.id) {
      const enrollRes = await fetch(
        `http://localhost:3000/api/class-enrollments?userId=${session.user.id}`
      );
      if (enrollRes.ok) {
        const data = await enrollRes.json();
        initialEnrollments = data.enrollments;
      }
    }
  } catch (error) {
    console.error('SSR fetch error:', error);
  }

  return {
    props: {
      initialClasses,
      initialEnrollments,
    },
  };
}
