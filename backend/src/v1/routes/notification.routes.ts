import express from "express";
const router = express.Router();

router.post("/send", (req, res) => res.send("Send notification"));
router.get("/:id", (req, res) => res.send(`Get notification ${req.params.id}`));
router.patch("/:id/read", (req, res) => res.send("Mark notification as read"));

export default router;
