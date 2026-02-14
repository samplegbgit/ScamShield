const express = require("express");
const cors = require("cors");

const scanRoutes = require("./routes/scan");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", scanRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("ScamShield Backend Running on http://localhost:" + PORT);
});
