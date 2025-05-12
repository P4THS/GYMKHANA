// components/AvailabilityManager.js
export default function AvailabilityManager({ availability }) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Your Availability</h1>
        <ul>
          {availability.map((slot) => (
            <li key={slot._id}>
              {new Date(slot.time).toLocaleString()}
            </li>
          ))}
        </ul>
        {/* Add ability to create/edit availability if needed */}
      </div>
    );
  }
  