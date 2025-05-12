import { useState, useEffect } from 'react';

export default function TrainerDashboard({ classes }) {
  const [newSchedule, setNewSchedule] = useState({
    time: '',
    maxCapacity: 0,
  });

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    // POST request to create a new schedule
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSchedule),
    });

    const data = await response.json();
    if (data.success) {
      alert('Schedule created!');
    } else {
      alert('Error creating schedule');
    }
  };

  return (
    <div>
      <h1>Your Trainer Dashboard</h1>
      <h2>Your Classes</h2>
      <ul>
        {classes.map((schedule) => (
          <li key={schedule._id}>
            <a href={`/trainer/classes/${schedule._id}`}>
              {new Date(schedule.time).toLocaleString()} - {schedule.maxCapacity} members
            </a>
          </li>
        ))}
      </ul>

      <h3>Create New Schedule</h3>
      <form onSubmit={handleScheduleSubmit}>
        <label>
          Time:
          <input
            type="datetime-local"
            value={newSchedule.time}
            onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
          />
        </label>
        <br />
        <label>
          Max Capacity:
          <input
            type="number"
            value={newSchedule.maxCapacity}
            onChange={(e) => setNewSchedule({ ...newSchedule, maxCapacity: e.target.value })}
          />
        </label>
        <br />
        <button type="submit">Create Schedule</button>
      </form>
    </div>
  );
}

export async function getServerSideProps() {
  const response = await fetch('http://localhost:3000/api/classes'); // Adjust URL to fetch specific trainer's classes
  const data = await response.json();

  return {
    props: {
      classes: data.classes || [],
    },
  };
}
