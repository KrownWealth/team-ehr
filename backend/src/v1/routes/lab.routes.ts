import express from "express";
const router = express.Router();

router.post("/orders/create", (req, res) => res.send("Create lab test order"));
router.get("/orders", (req, res) => res.send("Get all lab orders"));
router.get("/orders/:id", (req, res) => res.send("Get lab order details"));
router.patch("/orders/:id/status", (req, res) =>
  res.send("Update lab order status")
);
router.post("/results/enter", (req, res) => res.send("Enter lab results"));
router.get("/results/:id", (req, res) => res.send("View lab results"));
router.get("/tests", (req, res) => res.send("Get lab test definitions"));

export default router;
