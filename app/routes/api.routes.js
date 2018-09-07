const express = require("express"),
  api = require("../controllers/api.controller"),
  config = require("../../config/config");
router = express.Router();


router.options(config.baseUrl+"/*", api.enableCors);

router.post(config.baseUrl + "/login", api.login);

router.get(config.baseUrl + "/get_usage", api.getUsage);

router.post(config.baseUrl + "/get_history", api.getHistory);

module.exports = router;