import mongoose from "mongoose";
import express from "express";
const router = express.Router();

router.get("/total-count", async (req, res) => {
  try {
    const dbName = "SecondaryDB";
    const collectionName = "CleanedJobs";

    const db = mongoose.connection.useDb(dbName);

    const count = await db.collection(collectionName).countDocuments();
    res.json({ totalCount: count });
  } catch (error) {
    console.error("Error fetching total count:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching total count" });
  }
});

export default router;
