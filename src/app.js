const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use("/", healthRoutes);
app.use("/webhooks", webhookRoutes);

module.exports = app;
