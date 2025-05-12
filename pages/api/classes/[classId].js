// /api/classes/[classId].js
import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { classId } = req.query;

  // Validate classId
  if (!classId || !ObjectId.isValid(classId)) {
    return res.status(400).json({ message: "Invalid class ID" });
  }

  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");

  try {
    // Handle DELETE request
    if (req.method === "DELETE") {
      const result = await db.collection("classes").deleteOne({
        _id: new ObjectId(classId)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Class not found" });
      }

      return res.status(200).json({ message: "Class deleted successfully" });
    }

    // Handle GET request for a specific class
    if (req.method === "GET") {
      const classData = await db.collection("classes").findOne({
        _id: new ObjectId(classId)
      });

      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      return res.status(200).json({ class: classData });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error in /api/classes/[classId]:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  } finally {
    await client.close();
  }
}