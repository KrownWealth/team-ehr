import express from "express";
const router = express.Router();

router.get("/roles", (req, res) => res.send("Get system roles"));
router.get("/icd10", (req, res) => res.send("Get ICD-10 codes"));
router.get("/drug-library", (req, res) => res.send("Get drug library"));
router.get("/reference-ranges", (req, res) =>
  res.send("Get lab reference ranges")
);
router.get("/audit-logs", (req, res) => res.send("Get system audit logs"));

export default router;
