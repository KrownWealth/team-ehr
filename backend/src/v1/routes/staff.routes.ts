import express from "express";
const router = express.Router();

router.post("/create", (req, res) => res.send("Add new staff"));
router.get("/", (req, res) => res.send("Get all staff"));
router.get("/:id", (req, res) =>
  res.send(`Get staff with ID: ${req.params.id}`)
);
router.patch("/:id", (req, res) =>
  res.send(`Update staff with ID: ${req.params.id}`)
);
router.patch("/:id/deactivate", (req, res) => res.send("Deactivate staff"));
router.delete("/:id", (req, res) =>
  res.send(`Delete staff with ID: ${req.params.id}`)
);

export default router;
