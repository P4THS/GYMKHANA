import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  Divider,
} from "@mui/material";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClassesPage() {
  const router = useRouter();
  const { data: authData, status: authStatus } = useSession();
  const [classes, setClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPending = authStatus === "loading";
  const isUserLoggedIn = authStatus === "authenticated";
  const userId = authData?.user?.id;

  const getClassTypeLabel = (classType) => {
    return classType?.toLowerCase() || "general";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isPending) return;

      try {
        setIsLoading(true);

        const classesResponse = await fetch("/api/classes");
        if (!classesResponse.ok) {
          throw new Error("Failed to fetch classes");
        }
        const classesData = await classesResponse.json();
        setClasses(classesData.classes || []);

        if (isUserLoggedIn && userId) {
          const enrollmentsResponse = await fetch(`/api/class-enrollments?userId=${userId}`);
          if (!enrollmentsResponse.ok) {
            throw new Error("Failed to fetch enrollments");
          }
          const enrollmentsData = await enrollmentsResponse.json();
          setEnrolledClasses(enrollmentsData.enrollments || []);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, authStatus, isUserLoggedIn, isPending]);

  const isUserEnrolled = (classId) => {
    return enrolledClasses.some((enrollment) => enrollment.classId === classId);
  };

  const handleEnroll = async (classId) => {
    if (!isUserLoggedIn) {
      alert("Please log in to enroll in classes");
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/class-enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          classId: classId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to enroll in class");
      }

      router.reload();
    } catch (err) {
      console.error("Error enrolling in class:", err);
      alert(err.message || "Failed to enroll in class. Please try again.");
    }
  };

  const handleUnenroll = async (classId) => {
    try {
      const response = await fetch("/api/class-enrollments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          classId: classId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unenroll from class");
      }

      router.reload();
    } catch (err) {
      console.error("Error unenrolling from class:", err);
      alert("Failed to unenroll from class. Please try again.");
    }
  };

  if (isPending || isLoading)
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

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Error: {error}
      </Alert>
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
        <Box sx={{ position: "relative", maxWidth: 800, mx: "auto", p: 2, color: "text.primary", mt: "70px" }}>
          <Typography variant="h4" gutterBottom sx={{ color: "secondary.main" }}>
            Gym Classes
          </Typography>

          {!isUserLoggedIn && (
            <Alert severity="info" sx={{ mb: 4 }}>
              Please log in to enroll in classes.
            </Alert>
          )}

          {/* {isUserLoggedIn && enrolledClasses.length > 0 && (
            <Paper elevation={4} sx={{ p: 3, mb: 4, bgcolor: "rgba(28,28,28,0.75)", color: "#fff" }}>
              <Typography variant="h6" gutterBottom>
                Your Enrolled Classes
              </Typography>
              <List>
                {enrolledClasses.map((enrollment) => (
                  <ListItem
                    key={enrollment.enrollmentId}
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
                    <ListItemText
                      primary={enrollment.className}
                      secondary={`Instructor: ${enrollment.trainerName} | ${formatDate(enrollment.schedule)}`}
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleUnenroll(enrollment.classId)}
                    >
                      Cancel Enrollment
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )} */}

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
                      <ListItemText
                        primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#fff" }}>
                            {classItem.className}
                            </Typography>
                        }
                        secondary={
                            <>
                            <Typography variant="body2" color="gray">
                                <strong>Class Type:</strong> {classItem.classType}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                <strong>Instructor:</strong> {classItem.trainerName}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                <strong>Time:</strong> {formatDate(classItem.schedule)}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                <strong>Available Spots:</strong> {`${classItem.availableSpots}/${classItem.maxCapacity}`}
                            </Typography>
                            </>
                        }
                        />
                      {isFull ? (
                        <Button variant="contained" color="secondary" disabled>
                          Class Full
                        </Button>
                      ) : enrolled ? (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleUnenroll(classItem._id)}
                        >
                          Cancel Enrollment
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleEnroll(classItem._id)}
                        >
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