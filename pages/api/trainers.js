import { MongoClient, ObjectId } from "mongodb";
import { hash } from "bcryptjs";

export default async function handler(req, res) {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");

  if (req.method === "POST") {
    const { trainerName, trainerPassword } = req.body;

    // check across both collections
    const [existsTrainer, existsUser] = await Promise.all([
      db.collection("trainers").findOne({ trainerName }),
      db.collection("users").findOne({ userName: trainerName })
    ]);
    if (existsTrainer || existsUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashed = await hash(trainerPassword, 12);
    const newTrainer = { trainerName, trainerPassword: hashed };
    const result = await db.collection("trainers").insertOne(newTrainer);
    return res.status(201).json({ id: result.insertedId.toString(), trainerName });
  }

  // GET single trainer or list all
  if (req.method === "GET") {
    const { trainerId } = req.query;
    if (trainerId) {
      const trainer = await db.collection("trainers").findOne({ _id: new ObjectId(trainerId) });
      if (!trainer) return res.status(404).json({ message: "Trainer not found" });
      return res.status(200).json({ trainer });
    }

    const trainers = await db.collection("trainers").find().toArray();
    return res.status(200).json({ trainers });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}