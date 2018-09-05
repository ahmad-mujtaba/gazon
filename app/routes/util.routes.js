const express = require("express"),
    util = require("../controllers/util.controller"),
    config = require("../../config/config");
  router = express.Router();

router.use(config.baseUrl+"/", util.logRequest);

module.exports = router;