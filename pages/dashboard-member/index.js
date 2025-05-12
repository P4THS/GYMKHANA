import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from "@mui/material";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTimeSlot } from "@/context/TimeSlotContext";

export default function ProfileDetailPage() {
  const navigation = useRouter();
  const { data: authData, status } = useSession();
  const memberIdentifier = authData?.user?.id;
  const { setTimeSlotUsage } = useTimeSlot();

  const [memberData, setMemberData] = useState(null);
  const [storageReservation, setStorageReservation] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!memberIdentifier || status === "loading") return;
    const currentUserId = authData.user?.id;
    const isAuthorized = currentUserId === memberIdentifier;

    if (!isAuthorized) {
      setAccessDenied(true);
      setIsDataFetching(false);
      return;
    }

    const retrieveProfileData = async () => {
      try {
        setIsDataFetching(true);

        // Fetch member info
        const memberResponse = await fetch(`/api/users?userId=${memberIdentifier}`);
        if (!memberResponse.ok) throw new Error("Failed to retrieve member information");
        const memberInfo = await memberResponse.json();
        setMemberData(memberInfo.user);

        // Fetch storage reservation
        const reservationResponse = await fetch(`/api/assignments?userId=${memberIdentifier}`);
        if (!reservationResponse.ok) throw new Error("Failed to retrieve storage reservation information");
        const reservationInfo = await reservationResponse.json();
        setStorageReservation(reservationInfo.assignment);

        // Fetch class enrollments
        const classesResponse = await fetch(`/api/class-enrollments?userId=${memberIdentifier}`);
        if (!classesResponse.ok) throw new Error("Failed to retrieve class enrollment information");
        const classesInfo = await classesResponse.json();
        const enrolls = classesInfo.enrollments || [];
        setEnrolledClasses(enrolls);

        // Update global time slot usage context
        const usage = Array.from({ length: 24 }, () => null);
        enrolls.forEach(en => {
          const hour = new Date(en.schedule).getHours();
          usage[hour] = memberIdentifier;
        });
        setTimeSlotUsage(usage);
      } catch (err) {
        setFetchError(err.message);
        console.error("Error retrieving profile data:", err);
      } finally {
        setIsDataFetching(false);
      }
    };

    retrieveProfileData();
  }, [memberIdentifier, status, setTimeSlotUsage]);

  const handleCancelReservation = async () => {
    try {
      const response = await fetch("/api/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: memberIdentifier,
          lockerId: storageReservation.lockerId,
        }),
      });

      if (!response.ok) throw new Error("Failed to cancel storage reservation");
      navigation.reload();
    } catch (err) {
      console.error("Error cancelling storage reservation:", err);
      alert("Failed to cancel storage reservation. Please try again.");
    }
  };

  const handleUnenroll = async (classId) => {
    try {
      const response = await fetch("/api/class-enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: memberIdentifier,
          classId: classId,
        }),
      });

      if (!response.ok) throw new Error("Failed to unenroll from class");
      const cls = enrolledClasses.find(c => c.classId === classId);
      const hour = new Date(cls.schedule).getHours();

      // clear the slot
      setTimeSlotUsage(prev => {
        const next = [...prev];
        next[hour] = null;
        return next;
      });

      // then trigger your reload

      navigation.reload();
    } catch (err) {
      console.error("Error unenrolling from class:", err);
      alert("Failed to unenroll from class. Please try again.");
    }
  };

  if (isDataFetching || status === "loading")
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
  if (accessDenied) return <Alert severity="error" sx={{ mt: 4 }}>Access denied. You don't have permission to view this profile.</Alert>;
  if (fetchError) return <Alert severity="error" sx={{ mt: 4 }}>Error: {fetchError}</Alert>;
  if (!memberData) return <Typography align="center" mt={4}>Member profile not found</Typography>;


  return (
    <>
      <Header />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: 'url("/images/dashboard.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          pt: 4,
          mt: "-70px",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)" }} />
        <Box sx={{ position: "relative", maxWidth: 800, mx: "auto", p: 2, color: "text.primary", mt: "70px" }}>
          <Typography variant="h4" gutterBottom sx={{ color: "secondary.main" }}>
            {memberData.userName}'s Profile
          </Typography>

          <Paper elevation={4} sx={{ p: 3, mb: 4, bgcolor: "rgba(28,28,28,0.75)", color: "#fff" }}>
            <Typography variant="h6" gutterBottom>
              Storage Unit
            </Typography>
            {storageReservation ? (
              <Box>
                <Typography>Reserved unit #{storageReservation.locker.locker_number}</Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCancelReservation}
                  sx={{ mt: 2 }}
                >
                  Cancel Reservation
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography>No storage unit reserved.</Typography>
                <Link href="/locker" passHref>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Reserve a Storage Unit
                  </Button>
                </Link>
              </Box>
            )}
          </Paper>

          <Paper elevation={4} sx={{ p: 3, mb: 4, bgcolor: "rgba(28,28,28,0.75)", color: "#fff" }}>
            <Typography variant="h6" gutterBottom>
              Class Enrollments
            </Typography>
            {enrolledClasses.length > 0 ? (
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
                    <Link href={"/trainer/classes/"+enrollment.classId}>
                    <ListItemText
                        primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#fff" }}>
                            {enrollment.className}
                            </Typography>
                        }
                        secondary={
                            <>
                            <Typography variant="body2" color="gray">
                                <strong>Class Type:</strong> {enrollment.classType}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                <strong>Instructor:</strong> {enrollment.trainerName}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                <strong>Time:</strong> {formatDate(enrollment.schedule)}
                            </Typography>
                            </>
                        }
                        />
                        </Link>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleUnenroll(enrollment.classId)}
                    >
                      Unenroll
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box>
                <Typography>Not enrolled in any classes.</Typography>
                <Link href="/classes" passHref>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Browse Available Classes
                  </Button>
                </Link>
              </Box>
            )}
          </Paper>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            
            <Link href="/classes" passHref>
              <Button variant="contained" color="primary" sx={{ mx: 1 }}>
                Manage Classes
              </Button>
            </Link>
            <Link href="/locker" passHref>
              <Button variant="contained" color="primary" sx={{ mx: 1 }}>
                Manage Storage
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
