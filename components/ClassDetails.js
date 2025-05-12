
// components/ClassDetails.js
export default function ClassDetails({ classData, members }) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Class Details</h1>
        <p><strong>Time:</strong> {new Date(classData.schedule).toLocaleString()}</p>
        <p><strong>Max Capacity:</strong> {classData.maxCapacity}</p>
        <p><strong>Enrolled Members:</strong></p>
        <ul className="list-disc ml-5">
          {members.map((m) => (
            <li key={m._id}>{m.userId}</li>
          ))}
        </ul>
      </div>
    );
  }
  