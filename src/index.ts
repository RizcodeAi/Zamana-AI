import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "zamana-ai", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Zamana AI running on port ${PORT}`);
});

export default app;
