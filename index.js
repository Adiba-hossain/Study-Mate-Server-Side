const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

// middleware
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

app.get("/", (req, res) => {
  res.send("Study Mate Server Side is running!");
});

async function run() {
  try {
    await client.connect();

    // Define your main database
    const db = client.db("StudyMateDB"); // Database name (can be changed if you want)

    // Define collections (like tables)
    const partnersCollection = db.collection("partners");
    const requestsCollection = db.collection("requests");

    // =============================
    // 🔹 PARTNER ROUTES (CRUD)
    // =============================

    //  GET all partners
    app.get("/partners", async (req, res) => {
      const result = await partnersCollection.find().toArray();
      res.send(result);
    });

    //  GET a single partner by ID
    app.get("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const result = await partnersCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    //  POST (add) a new partner
    app.post("/partners", async (req, res) => {
      const partner = req.body; // Expect JSON from frontend
      const result = await partnersCollection.insertOne({
        ...partner,
        createdAt: new Date(), // Add timestamp
      });
      res.send(result);
    });

    //  PUT (update) an existing partner
    app.put("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { ...updatedData, updatedAt: new Date() } };
      const result = await partnersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //  DELETE a partner by ID
    app.delete("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const result = await partnersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    //  GET latest 6 partners
    app.get("/latest-partners", async (req, res) => {
      const result = await partnersCollection
        .find()
        .sort({ createdAt: -1 }) // Sort newest first
        .limit(6)
        .toArray();
      res.send(result);
    });

    //  GET top 3 partners by rating
    app.get("/top-partners", async (req, res) => {
      const result = await partnersCollection
        .find()
        .sort({ rating: -1 }) // Highest rated first
        .limit(3)
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart server is running on port: ${port}`);
});
