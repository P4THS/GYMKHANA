import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");
  
  try {
    if (req.method === "GET") {
      // Get user's enrolled classes
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Find all enrollments for this user
      const enrollments = await db.collection("class_enrollments")
        .find({ userId: new ObjectId(userId) })
        .toArray();
      
      const enrolledClasses = await Promise.all(enrollments.map(async (enrollment) => {
      const classDetails = await db.collection("classes").findOne({
        _id: new ObjectId(enrollment.classId)
      });
      
      // Get trainer info
      const trainer = classDetails ? await db.collection("trainers").findOne({
        _id: new ObjectId(classDetails.trainerId)
      }) : null;
      
      return {
        enrollmentId: enrollment._id.toString(),
        classId: enrollment.classId.toString(),
        userId: enrollment.userId.toString(),
        schedule: classDetails ? classDetails.schedule : null,
        maxCapacity: classDetails ? classDetails.maxCapacity : null,
        className: classDetails ? classDetails.className || "Unnamed Class" : "Unnamed Class",
        classType: classDetails ? classDetails.classType || "general" : "general",
        trainerName: trainer ? trainer.trainerName : "Unknown Trainer"
      };
    }));
      
      res.status(200).json({ enrollments: enrolledClasses });
    } else if (req.method === "POST") {
      // Enroll user in a class
      const { userId, classId } = req.body;
      
      if (!userId || !classId) {
        return res.status(400).json({ message: "User ID and Class ID are required" });
      }
      
      // Check if class exists and has capacity
      const classData = await db.collection("classes").findOne({
        _id: new ObjectId(classId)
      });
      
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Check current enrollment count
      const enrollmentCount = await db.collection("class_enrollments").countDocuments({
        classId: new ObjectId(classId)
      });
      
      if (enrollmentCount >= classData.maxCapacity) {
        return res.status(400).json({ message: "Class is at full capacity" });
      }
      
      // Check if user is already enrolled
      const existingEnrollment = await db.collection("class_enrollments").findOne({
        userId: new ObjectId(userId),
        classId: new ObjectId(classId)
      });
      
      if (existingEnrollment) {
        return res.status(400).json({ message: "You are already enrolled in this class" });
      }
      
      // Create new enrollment
      const enrollment = {
        userId: new ObjectId(userId),
        classId: new ObjectId(classId)
      };
      
      const result = await db.collection("class_enrollments").insertOne(enrollment);
      
      res.status(201).json({
        enrollment: {
          ...enrollment,
          _id: result.insertedId.toString(),
          userId: userId,
          classId: classId
        }
      });
    } else if (req.method === "DELETE") {
      // Unenroll user from a class
      const { userId, classId } = req.body;
      
      if (!userId || !classId) {
        return res.status(400).json({ message: "User ID and Class ID are required" });
      }
      
      const result = await db.collection("class_enrollments").deleteOne({
        userId: new ObjectId(userId),
        classId: new ObjectId(classId)
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      res.status(200).json({ message: "Successfully unenrolled from class" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await client.close();
  }
}