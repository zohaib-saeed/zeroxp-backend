const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const dbName = 'SecondaryDB';
const collectionName = 'CleanedJobs';

router.get('/search', async (req, res) => {
  try {
   
    const db = mongoose.connection.useDb(dbName);

    const { keywords, location } = req.query;

    
    const keywordRegex = new RegExp(keywords, 'i');
    const locationRegex = new RegExp(location, 'i');

    
    const orConditions = [];

    
    if (keywords) {
      orConditions.push({
        $or: [
          { jobTitle: { $regex: keywordRegex } },
          { Company: { $regex: keywordRegex } },
          { Description: { $regex: keywordRegex } },
          { Tags: { $regex: keywordRegex } },
        ],
      });
    }

    if (location) {
      orConditions.push({
        $or: [
          { City: { $regex: locationRegex } },
          { State: { $regex: locationRegex } },
          { Country: { $regex: locationRegex } },
        ],
      });
    }

    const jobs = await db.collection(collectionName).find({
      $and: orConditions, 
    }).toArray();

    res.json(jobs);
  } catch (error) {
    console.error('Error searching for jobs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;