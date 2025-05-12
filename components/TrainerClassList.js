// components/TrainerClassList.js
import Link from "next/link";

export default function TrainerClassList({ classes }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Trainer Classes</h1>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id}>
            <Link href={`/trainer/classes/${cls._id}`}>
              <a>{new Date(cls.schedule).toLocaleString()}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

