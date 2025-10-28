import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

// ✅ Add a base route for quick testing
app.get("/", (req, res) => {
  res.send("✅ Server is running on port " + PORT);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API is listening on port ${PORT}`);
});
