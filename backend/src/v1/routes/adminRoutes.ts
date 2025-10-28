import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get all workouts");
});

router.get("/:adminId", (req, res) => {
  res.send("Get an existing admin");
});

router.post("/", (req, res) => {
  res.send("Create a new admin");
});

router.patch("/:adminId", (req, res) => {
  res.send("Update an existing admin");
});

router.delete("/:workoutId", (req, res) => {
  res.send("Delete an existing admin");
});

module.exports = router;
