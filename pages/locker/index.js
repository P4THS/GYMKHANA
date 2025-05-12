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
  Container,
  styled,
} from "@mui/material";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Styled components for consistent UI
const LockerCard = styled(Paper)(({ theme, vacant }) => ({
  width: '100%',
  height: 180,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: vacant 
    ? 'rgba(0, 128, 0, 0.15)'
    : 'rgba(220, 0, 0, 0.15)',
  borderRadius: theme.spacing(1),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const LockerHeader = styled(Box)({
  width: '100%',
  textAlign: 'center',
  paddingBottom: 8,
  borderBottom: '1px solid rgba(255,255,255,0.1)',
});

const LockerBody = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

const LockerFooter = styled(Box)({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  marginTop: 8,
});

const LockerGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 16,
  width: '100%',
});

export default function StorageManagementPage() {
  const navigator = useRouter();
  const { data: authData, status: authStatus } = useSession();
  const [storageUnits, setStorageUnits] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [memberReservation, setMemberReservation] = useState(null);

  const isPending = authStatus === "loading";
  const isUserLoggedIn = authStatus === "authenticated";
  const memberIdentifier = authData?.user?.id;

  useEffect(() => {
    const retrieveStorageData = async () => {
      if (isPending) return;

      try {
        setIsDataFetching(true);

        const unitsResponse = await fetch("/api/lockers");
        if (!unitsResponse.ok) {
          throw new Error("Failed to fetch storage units");
        }

        const unitsData = await unitsResponse.json();
        setStorageUnits(unitsData.lockers || []);

        if (isUserLoggedIn && memberIdentifier) {
          const reservationResponse = await fetch(`/api/assignments?userId=${memberIdentifier}`);
          if (!reservationResponse.ok) {
            throw new Error("Failed to fetch reservation data");
          }

          const reservationData = await reservationResponse.json();
          setMemberReservation(reservationData.assignment);
        }
      } catch (err) {
        setFetchError(err.message);
        console.error("Error retrieving data:", err);
      } finally {
        setIsDataFetching(false);
      }
    };

    retrieveStorageData();
  }, [memberIdentifier, authStatus, isUserLoggedIn, isPending]);

  const handleReserveUnit = async (unitId) => {
    if (!isUserLoggedIn) {
      alert("Please log in to reserve a storage unit");
      navigator.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: memberIdentifier,
          lockerId: unitId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reserve storage unit");
      }
      navigator.reload();
    } catch (err) {
      console.error("Error reserving storage unit:", err);
      alert(err.message || "Failed to reserve storage unit. Please try again.");
    }
  };

  const handleCancelReservation = async () => {
    try {
      const response = await fetch("/api/assignments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: memberIdentifier,
          lockerId: memberReservation.lockerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel reservation");
      }

      navigator.reload();
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      alert("Failed to cancel reservation. Please try again.");
    }
  };

  if (isPending || isDataFetching)
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

  if (fetchError)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Error: {fetchError}
      </Alert>
    );

  return (
    <>
      <Header />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: 'url("/images/hero-placeholder.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          pt: 4,
          mt: "-70px",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)" }} />
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: "relative", 
            color: "#fff", 
            mt: "70px",
            pb: 8
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: "secondary.main", 
              textAlign: "center",
              mb: 4,
              fontWeight: 600
            }}
          >
            Gym Storage Units
          </Typography>

          {isUserLoggedIn && memberReservation && (
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                mb: 4, 
                bgcolor: "rgba(28,28,28,0.9)", 
                color: "#fff",
                borderRadius: 2,
                borderLeft: '4px solid #f50057'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Your Reserved Unit
              </Typography>
              <Typography sx={{ mb: 2 }}>
                You currently have unit #{memberReservation.locker.locker_number} reserved.
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleCancelReservation}
                sx={{ 
                  borderRadius: 1.5,
                  px: 3,
                  py: 1
                }}
              >
                Cancel Reservation
              </Button>
            </Paper>
          )}

          <Paper 
            elevation={4} 
            sx={{ 
              p: 4, 
              bgcolor: "rgba(28,28,28,0.9)", 
              color: "#fff",
              borderRadius: 2
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: "center", 
                mb: 4,
                fontWeight: 600,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 3,
                  backgroundColor: 'secondary.main'
                }
              }}
            >
              Available Storage Units
            </Typography>
            
            {storageUnits.length === 0 ? (
              <Typography align="center">No storage units available.</Typography>
            ) : (
              <LockerGrid>
                {storageUnits.map((unit) => (
                  <LockerCard 
                    key={unit._id} 
                    elevation={3} 
                    vacant={unit.vacant}
                  >
                    <LockerHeader>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Unit #{unit.locker_number}
                      </Typography>
                    </LockerHeader>
                    
                    <LockerBody>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          color: unit.vacant ? '#4caf50' : '#f44336'
                        }}
                      >
                        {unit.vacant ? "Available" : "Reserved"}
                      </Typography>
                    </LockerBody>
                    
                    <LockerFooter>
                      {unit.vacant && isUserLoggedIn && !memberReservation && (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleReserveUnit(unit._id)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          Reserve
                        </Button>
                      )}
                      {(!unit.vacant || !isUserLoggedIn || memberReservation) && (
                        <Box sx={{ height: 36 }} />
                      )}
                    </LockerFooter>
                  </LockerCard>
                ))}
              </LockerGrid>
            )}
          </Paper>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Link href={isUserLoggedIn ? "/dashboard-member" : "/"} passHref>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ 
                  borderRadius: 1.5,
                  px: 4,
                  py: 1.2
                }}
              >
                {isUserLoggedIn ? "Back to Profile" : "Back to Home"}
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}