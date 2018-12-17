const express = require("express");
const { searchRecipe, encodeQuery } = require("./utils.js");

const app = express();
const router = require("express").Router();

router.get("/:recipe", function(req, res) {
  console.time("endpointDuration");

  const query = encodeQuery(req.params.recipe);

  searchRecipe(query, function(json) {
    res.send(json);

    console.timeEnd("endpointDuration");
  });
});

app.use("/api", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT);

console.log(`Listening on port ${PORT}`);
