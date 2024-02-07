import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  Company: String,
  Description: String,
  Tags: String,
  City: String,
  Country: String,
  State: String,
  applyLink: String,
  jobTitle: String,
  jobType: String,
  logoLink: String,
  datePosted: String,
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
