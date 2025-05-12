import { MongoClient, ObjectId } from "mongodb";
import { hash } from "bcryptjs";

const MONGODB_URI = "mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c";
const DB_NAME = "gym_db";

export default async function handler(req, res) {
  let client;

  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);

    if (req.method === "POST") {
      const { userName, userPassword } = req.body;

      // Check if username is already taken by user or trainer
      const [existsUser, existsTrainer] = await Promise.all([
        db.collection("users").findOne({ userName }),
        db.collection("trainers").findOne({ trainerName: userName })
      ]);

      if (existsUser || existsTrainer) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await hash(userPassword, 12);
      const newUser = { userName, userPassword: hashedPassword };

      const result = await db.collection("users").insertOne(newUser);
      return res.status(201).json({
        id: result.insertedId.toString(),
        userName
      });
    }

    if (req.method === "GET") {
      const { userId } = req.query;

      if (userId) {
        const user = await db.collection("users").findOne({
          _id: new ObjectId(userId)
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
          user: {
            ...user,
            _id: user._id.toString()
          }
        });
      }

      const users = await db.collection("users").find().toArray();
      const processedUsers = users.map(user => ({
        ...user,
        _id: user._id.toString()
      }));
      return res.status(200).json({ users: processedUsers });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
