const express = require("express"),
  api = require("../controllers/api.controller"),
  router = express.Router();


router.post("/login", api.login);

router.get("/internet_usage", api.getUsage);

module.exports = router;
