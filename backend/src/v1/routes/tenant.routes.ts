import express from "express";
const router = express.Router();

router.get("/", (req, res) => res.send("List all tenants (Super admin only)"));
router.get("/:id", (req, res) =>
  res.send(`Get tenant with ID: ${req.params.id}`)
);
router.delete("/:id", (req, res) => res.send(`Delete tenant ${req.params.id}`));

export default router;
