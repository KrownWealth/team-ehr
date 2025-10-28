import express from "express";
const router = express.Router();

router.post("/create", (req, res) => res.send("Add prescription"));
router.get("/patient/:id", (req, res) => res.send("Get patient prescriptions"));
router.get("/:id", (req, res) => res.send(`Get prescription ${req.params.id}`));
router.patch("/:id", (req, res) => res.send("Update prescription"));
router.post("/check-allergies", (req, res) => res.send("Run allergy check"));

export default router;
