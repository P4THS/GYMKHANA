import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProfileDetailPage() {
  const navigation = useRouter();

  const { data: authData } = useSession();

  const memberIdentifier = authData?.user?.id;
  
  const [memberData, setMemberData] = useState(null);
  const [storageReservation, setStorageReservation] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!memberIdentifier || !authData) return;
    const currentUserId = authData.user?.id;
    const isAuthorized = 
      currentUserId === memberIdentifier || 
      authData.user?.role === 'trainer' || 
      authData.user?.role === 'admin';
    
    if (!isAuthorized) {
      setAccessDenied(true);
      setIsDataFetching(false);
      return;
    }
    
    const retrieveProfileData = async () => {
      try {
        setIsDataFetching(true);
        const memberResponse = await fetch(`/api/users?userId=${memberIdentifier}`);
        if (!memberResponse.ok) {
          throw new Error("Failed to retrieve member information");
        }
        const memberInfo = await memberResponse.json();
        
        const reservationResponse = await fetch(`/api/assignments?userId=${memberIdentifier}`);
        if (!reservationResponse.ok) {
          throw new Error("Failed to retrieve storage reservation information");
        }
        const reservationInfo = await reservationResponse.json();
        
        console.log("Member information:", memberInfo);
        console.log("Storage reservation information:", reservationInfo);
        
        setMemberData(memberInfo.user);
        setStorageReservation(reservationInfo.assignment);
      } catch (err) {
        setFetchError(err.message);
        console.error("Error retrieving profile data:", err);
      } finally {
        setIsDataFetching(false);
      }
    };
    
    retrieveProfileData();
  }, [memberIdentifier, authData]);

  const handleCancelReservation = async () => {
    try {
      const response = await fetch("/api/assignments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profileId,
          lockerId: storageReservation.lockerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to cancel storage reservation");
      }
      navigation.reload();
    } catch (err) {
      console.error("Error cancelling storage reservation:", err);
      alert("Failed to cancel storage reservation. Please try again.");
    }
  };

  if (isDataFetching) return <div>Loading profile data...</div>;
  if (accessDenied) return <div>Access denied. You don't have permission to view this profile.</div>;
  if (fetchError) return <div>Error: {fetchError}</div>;
  if (!memberData) return <div>Member profile not found</div>;

  return (
    <div>
      <h1>{memberData.userName}'s Profile</h1>
      
      {storageReservation ? (
        <div>
          <h2>Storage Unit Reservation</h2>
          <p>Unit Number: {storageReservation.locker.locker_number}</p>
          <button onClick={handleCancelReservation}>
            Cancel Reservation
          </button>
        </div>
      ) : (
        <div>
          <p>No storage unit currently reserved.</p>
          <Link href="/locker">
            <button>Reserve a Storage Unit</button>
          </Link>
        </div>
      )}
      
      <div style={{ marginTop: "20px" }}>
        <Link href="/">
          <button>Return to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
