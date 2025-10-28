import express from "express";
const router = express.Router();

router.get("/revenue", (req, res) => res.send("Get revenue reports"));
router.get("/patient-stats", (req, res) => res.send("Get patient statistics"));
router.get("/consultation-metrics", (req, res) =>
  res.send("Get consultation metrics")
);
router.get("/export", (req, res) => res.send("Export reports to PDF/Excel"));

export default router;
