// pages/api/enrollments.js
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = "mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c";

export default async function handler(req, res) {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db("gym_db");

  try {
    if (req.method === "GET") {
      const { userId, classId } = req.query;

      // 1) Get enrollments for a specific user
      if (userId) {
        const enrollments = await db
          .collection("class_enrollments")
          .find({ userId: new ObjectId(userId) })
          .toArray();

        const enrolledClasses = await Promise.all(
          enrollments.map(async (en) => {
            const classDoc = await db
              .collection("classes")
              .findOne({ _id: new ObjectId(en.classId) });
            const trainer = classDoc
              ? await db
                  .collection("trainers")
                  .findOne({ _id: new ObjectId(classDoc.trainerId) })
              : null;

            return {
              enrollmentId: en._id.toString(),
              classId: en.classId.toString(),
              schedule: classDoc?.schedule || null,
              maxCapacity: classDoc?.maxCapacity || null,
              className: classDoc?.className || "Unnamed Class",
              classType: classDoc?.classType || "general",
              trainerName: trainer?.trainerName || "Unknown Trainer",
            };
          })
        );

        return res.status(200).json({ enrollments: enrolledClasses });
      }

      // 2) Get all members enrolled in a specific class
      if (classId) {
        const enrollments = await db
          .collection("class_enrollments")
          .find({ classId: new ObjectId(classId) })
          .toArray();

        // Just return userIds (or you could lookup more user info if you have a users collection)
        const members = enrollments.map((en) => ({
          enrollmentId: en._id.toString(),
          userId: en.userId.toString(),
        }));

        return res.status(200).json({ members });
      }

      return res
        .status(400)
        .json({ message: "Please provide either userId or classId in query" });
    }

    // POST: Enroll user in class (unchanged)
    if (req.method === "POST") {
      const { userId, classId } = req.body;
      if (!userId || !classId)
        return res
          .status(400)
          .json({ message: "User ID and Class ID are required" });

      const classData = await db
        .collection("classes")
        .findOne({ _id: new ObjectId(classId) });
      if (!classData)
        return res.status(404).json({ message: "Class not found" });

      const count = await db
        .collection("class_enrollments")
        .countDocuments({ classId: new ObjectId(classId) });
      if (count >= classData.maxCapacity)
        return res
          .status(400)
          .json({ message: "Class is at full capacity" });

      const existing = await db
        .collection("class_enrollments")
        .findOne({
          userId: new ObjectId(userId),
          classId: new ObjectId(classId),
        });
      if (existing)
        return res
          .status(400)
          .json({ message: "You are already enrolled in this class" });

      const result = await db.collection("class_enrollments").insertOne({
        userId: new ObjectId(userId),
        classId: new ObjectId(classId),
      });

      return res.status(201).json({
        enrollment: {
          _id: result.insertedId.toString(),
          userId,
          classId,
        },
      });
    }

    // DELETE: Unenroll user (unchanged)
    if (req.method === "DELETE") {
      const { userId, classId } = req.body;
      if (!userId || !classId)
        return res
          .status(400)
          .json({ message: "User ID and Class ID are required" });

      const result = await db
        .collection("class_enrollments")
        .deleteOne({
          userId: new ObjectId(userId),
          classId: new ObjectId(classId),
        });

      if (result.deletedCount === 0)
        return res.status(404).json({ message: "Enrollment not found" });

      return res
        .status(200)
        .json({ message: "Successfully unenrolled from class" });
    }

    // Fallback
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    await client.close();
  }
}
