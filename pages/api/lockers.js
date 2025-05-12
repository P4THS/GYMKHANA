import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await MongoClient.connect("mongodb+srv://talmaj2173:rXDInYAS0pKckoPH@c.q8asa.mongodb.net/?retryWrites=true&w=majority&appName=c");
  const db = client.db("gym_db");
  //console.log(db)
  try {
    if (req.method === "POST") {
      const { locker_num } = req.body;
      const newLocker = { vacant: false, locker_number: locker_num };
      const result = await db.collection("lockers").insertOne(newLocker);
      res.status(201).json({ locker: { ...newLocker, _id: result.insertedId } });
    } else if (req.method === "GET") {
      // Check if a specific lockerId is provided
      //console.log("YEs")
      const lockers = await db.collection("lockers").find().toArray();
      //console.log(lockers)
      //console.log("NMIger")
      if (req.query.lockerId) {
        const locker = await db.collection("lockers").findOne({
          _id: new ObjectId(req.query.lockerId)
        });
        
        if (!locker) {
          return res.status(404).json({ message: "Locker not found" });
        }
        
        // Convert ObjectId to string for JSON serialization
        return res.status(200).json({ 
          locker: {
            ...locker,
            _id: locker._id.toString()
          }
        });
      } else {
        // Return all lockers
        const lockers = await db.collection("lockers").find().toArray();
        //console.log(lockers)
        // Convert ObjectIds to strings
        const processedLockers = lockers.map(locker => ({
          ...locker,
          _id: locker._id.toString()
        }));
        res.status(200).json({ lockers: processedLockers });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await client.close();
  }
}