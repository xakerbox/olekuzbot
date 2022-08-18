const express = require("express");
const app = express();

let currentRate = 1;

app.get("/put-rates", (req, res) => {
  if (req.query.STORJ) {
    currentRate = req.query.STORJ;
    console.log('Set upped:', currentRate);
  }

  console.log('Request:', currentRate);
  res.status(200).json({ price: +currentRate, status: "Updated" });
});

app.listen(2345, () => console.log("Server started on port 2345..."));
