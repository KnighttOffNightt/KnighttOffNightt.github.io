const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "change-this-admin-token";
const DB_PATH = path.join(__dirname, "comments.json");

app.use(express.json({ limit: "200kb" }));
app.use(express.static(__dirname));

function readComments() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

function writeComments(comments) {
  fs.writeFileSync(DB_PATH, JSON.stringify(comments, null, 2), "utf8");
}

function normalizeText(value, maxLen) {
  return String(value || "").trim().slice(0, maxLen);
}

app.get("/api/comments", (req, res) => {
  const comments = readComments()
    .sort((a, b) => b.time - a.time)
    .slice(0, 200);
  res.json({ comments });
});

app.post("/api/comments", (req, res) => {
  const name = normalizeText(req.body.name, 20);
  const text = normalizeText(req.body.text, 300);
  if (!text) {
    return res.status(400).json({ error: "评论内容不能为空" });
  }

  const comments = readComments();
  const item = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name,
    text,
    time: Date.now()
  };
  comments.push(item);
  writeComments(comments);
  res.status(201).json({ ok: true, comment: item });
});

app.delete("/api/comments/:id", (req, res) => {
  const token = (req.headers["x-admin-token"] || "").toString();
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "管理员鉴权失败" });
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "无效评论 ID" });
  }

  const comments = readComments();
  const next = comments.filter((item) => item.id !== id);
  if (next.length === comments.length) {
    return res.status(404).json({ error: "评论不存在" });
  }
  writeComments(next);
  res.json({ ok: true });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, now: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
