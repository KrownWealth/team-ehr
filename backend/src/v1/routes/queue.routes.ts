import express from "express";
const router = express.Router();

router.post("/add", (req, res) => res.send("Add patient to queue"));
router.get("/", (req, res) => res.send("Get all queue records"));
router.patch("/:id/status", (req, res) => res.send("Update queue status"));
router.delete("/:id", (req, res) => res.send("Remove patient from queue"));

export default router;
