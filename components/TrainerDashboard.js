// components/TrainerDashboard.js
import Link from "next/link";

export default function TrainerDashboard({ classes, trainerId }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome Trainer</h1>
      <h2 className="text-xl mb-2">Your Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id} className="mb-2">
            <Link href={`/trainer/classes/${cls._id}`}>
              <a className="text-blue-600 hover:underline">
                Class at {new Date(cls.schedule).toLocaleString()}
              </a>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/trainer/classes/create">
        <a className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded">Create New Class</a>
      </Link>
    </div>
  );
}

