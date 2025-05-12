import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");
  //console.log(db)
  try {
    if (req.method === "POST") {
      const { userId, lockerId } = req.body;
      const existingAssignment = await db.collection("user_locker_assignments").findOne({
        userId: new ObjectId(userId)
      });
      
      if (existingAssignment) {
        return res.status(400).json({ message: "User already has a locker assigned" });
      }
      const locker = await db.collection("lockers").findOne({
        _id: new ObjectId(lockerId)
      });
      
      if (!locker || !locker.vacant) {
        return res.status(400).json({ message: "Locker is not available" });
      }
      
      const assignment = {
        userId: new ObjectId(userId),
        lockerId: new ObjectId(lockerId),
      };
      
      const result = await db.collection("user_locker_assignments").insertOne(assignment);
      await db.collection("lockers").updateOne(
        { _id: new ObjectId(lockerId) },
        { $set: { vacant: false } }
      );

      res.status(201).json({ assignment: { ...assignment, _id: result.insertedId } });
    } else if (req.method === "DELETE") {
      const { userId, lockerId } = req.body;
      const result = await db.collection("user_locker_assignments").deleteOne({
        userId: new ObjectId(userId),
        lockerId: new ObjectId(lockerId)
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      await db.collection("lockers").updateOne(
        { _id: new ObjectId(lockerId) },
        { $set: { vacant: true } }
      );
      
      res.status(200).json({ message: "Locker unassigned successfully" });
    } else if (req.method === "GET") {
      if (req.query.userId) {
        const assignment = await db.collection("user_locker_assignments").findOne({
          userId: new ObjectId(req.query.userId)
        });
        const niggaassignments = await db.collection("user_locker_assignments").find().toArray();
        const nigga= {
          userId: new ObjectId(req.query.userId)
        }
        console.log(nigga)
        niggaassignments.forEach(element => {
            console.log(element)
        });
        
        if (assignment) {
          const locker = await db.collection("lockers").findOne({
            _id: assignment.lockerId
          });
          
          return res.status(200).json({ 
            assignment: {
              _id: assignment._id.toString(),
              userId: assignment.userId.toString(),
              lockerId: assignment.lockerId.toString(),
              locker: {
                _id: locker._id.toString(),
                vacant: locker.vacant,
                locker_number: locker.locker_number
              }
            }
          });
        } else {
          return res.status(200).json({ assignment: null });
        }
      } else {
        const assignments = await db.collection("user_locker_assignments").find().toArray();
        const processedAssignments = assignments.map(assignment => ({
          ...assignment,
          _id: assignment._id.toString(),
          userId: assignment.userId.toString(),
          lockerId: assignment.lockerId.toString()
        }));
        res.status(200).json({ assignments: processedAssignments });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await client.close();
  }
}