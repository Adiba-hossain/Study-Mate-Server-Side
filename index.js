const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rakfigq.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//Root Route
app.get("/", (req, res) => {
  res.send("StudyMate Server Side is running successfully!");
});

// Main Function
async function run() {
  try {
    // await client.connect();
    // console.log("Successfully connected to MongoDB Atlas!");

    // Main database
    const db = client.db("StudyMateDB");

    // Collections tables
    const partnersCollection = db.collection("partners");
    const requestsCollection = db.collection("requests");

    // ------------------Partner Routes (CRUD)------------------

    // GET all partners
    app.get("/partners", async (req, res) => {
      const result = await partnersCollection.find().toArray();
      res.send(result);
    });

    // GET a single partner by ID
    app.get("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const result = await partnersCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // POST (add) a new partner
    app.post("/partners", async (req, res) => {
      const partner = req.body;
      const result = await partnersCollection.insertOne({
        ...partner,
        createdAt: new Date(),
      });
      res.send(result);
    });

    // PUT (update) an existing partner
    app.put("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { ...updatedData, updatedAt: new Date() } };
      const result = await partnersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // DELETE a partner by ID
    app.delete("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const result = await partnersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // GET latest 6 partners
    app.get("/latest-partners", async (req, res) => {
      const result = await partnersCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // GET top 3 partners by rating
    app.get("/top-partners", async (req, res) => {
      const result = await partnersCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    // GET partners created by specific user (email)
    app.get("/my-partners", async (req, res) => {
      const email = req.query.email;
      const result = await partnersCollection.find({ email }).toArray();
      res.send(result);
    });

    // SEARCH partners by name, subject, or location

    // -----------------Request Routes----------------

    // POST (send) a study request
    app.post("/requests", async (req, res) => {
      const { partnerId, requesterEmail } = req.body;

      const partner = await partnersCollection.findOne({
        _id: new ObjectId(partnerId),
      });
      if (!partner) {
        return res.status(404).send({ message: "Partner not found" });
      }

      await partnersCollection.updateOne(
        { _id: new ObjectId(partnerId) },
        { $inc: { partnerCount: 1 } }
      );

      // Create new request document
      const newRequest = {
        partnerId,
        requesterEmail,
        partnerSnapshot: {
          name: partner.name,
          subject: partner.subject,
          experienceLevel: partner.experienceLevel,
          location: partner.location,
          studyMode: partner.studyMode,
          rating: partner.rating,
        },
        status: "pending",
        createdAt: new Date(),
      };

      const result = await requestsCollection.insertOne(newRequest);
      res.send(result);
    });

    // GET requests made by a specific user
    app.get("/my-requests", async (req, res) => {
      const email = req.query.email;
      const result = await requestsCollection
        .find({ requesterEmail: email })
        .toArray();
      res.send(result);
    });

    // PUT (update) a request status
    app.put("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { ...updatedStatus, updatedAt: new Date() } };
      const result = await requestsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // DELETE a request by ID
    app.delete("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await requestsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`StudyMate server is running on port: ${port}`);
});
