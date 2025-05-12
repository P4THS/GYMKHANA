// /api/classes.js
import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");

  try {
    if (req.method === "GET") {
      const { trainerId } = req.query;
      const filter = trainerId ? { trainerId: new ObjectId(trainerId) } : {};

      const classes = await db.collection("classes").find(filter).toArray();

      const enhancedClasses = await Promise.all(
        classes.map(async (classItem) => {
          const trainer = await db.collection("trainers").findOne({
            _id: new ObjectId(classItem.trainerId),
          });

          const enrollmentCount = await db
            .collection("class_enrollments")
            .countDocuments({ classId: new ObjectId(classItem._id) });

          return {
            ...classItem,
            _id: classItem._id.toString(),
            trainerId: classItem.trainerId.toString(),
            trainerName: trainer ? trainer.trainerName : "Unknown Trainer",
            currentEnrollment: enrollmentCount,
            availableSpots: classItem.maxCapacity - enrollmentCount,
            className: classItem.className || "Unnamed Class",
            classType: classItem.classType || "general",
          };
        })
      );

      return res.status(200).json({ classes: enhancedClasses });
    }

    if (req.method === "POST") {
      const { trainerId, schedule, maxCapacity, className, classType } = req.body;

      // Field validation
      if (!trainerId || !schedule || !maxCapacity || !className || !classType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const classDate = new Date(schedule);
      const hour = classDate.getHours();

      // Check for scheduling conflicts (same hour)
      const existingClass = await db.collection("classes").findOne({
        trainerId: new ObjectId(trainerId),
        schedule: {
          $gte: new Date(new Date(schedule).setHours(hour, 0, 0, 0)),
          $lt: new Date(new Date(schedule).setHours(hour + 1, 0, 0, 0)),
        },
      });

      if (existingClass) {
        return res.status(409).json({ message: "You already have a class scheduled at this time" });
      }

      const newClass = {
        trainerId: new ObjectId(trainerId),
        schedule: new Date(schedule),
        maxCapacity: Number(maxCapacity),
        className: className || "Unnamed Class",
        classType: classType || "general",
      };

      const result = await db.collection("classes").insertOne(newClass);

      return res.status(201).json({
        class: {
          ...newClass,
          _id: result.insertedId.toString(),
          trainerId: trainerId,
        },
      });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error in /api/classes:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  } finally {
    await client.close();
  }
}
