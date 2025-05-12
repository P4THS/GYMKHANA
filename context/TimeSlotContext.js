// context/TimeSlotContext.js
import { createContext, useContext, useState } from 'react';

const TimeSlotContext = createContext();

export function useTimeSlot() {
  return useContext(TimeSlotContext);
}

export function TimeSlotProvider({ children }) {
  // initialize 24 slots as null
  const [timeSlotUsage, setTimeSlotUsage] = useState(
    Array.from({ length: 24 }, () => null)
  );

  return (
    <TimeSlotContext.Provider value={{ timeSlotUsage, setTimeSlotUsage }}>
      {children}
    </TimeSlotContext.Provider>
  );
}
