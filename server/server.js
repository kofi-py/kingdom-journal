const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/posts");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
