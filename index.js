require('dotenv').config();
const dns = require("dns");
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Middleware para leer los datos del formulario (POST)
app.use(express.urlencoded({ extended: false }));

const urls = [];

app.post("/api/shorturl", function (req, res) {
  let parsed;
  try {
    parsed = new URL(req.body.url);
  } catch (e) {
    return res.json({ error: "invalid url" });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(parsed.hostname, function (err) {
    if (err) return res.json({ error: "invalid url" });

    urls.push(req.body.url);
    res.json({ original_url: req.body.url, short_url: urls.length });
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const url = urls[Number(req.params.short_url) - 1];

  if (!url) {
    return res.json({ error: "No short URL found for the given input" });
  }

  res.redirect(url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
