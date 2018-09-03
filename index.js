const express = require("express");

const app = express();

const PORT = 8000;

const router = require("./app/routes/routes");

try {
    app.use("/", router);
    app.listen(PORT);
} catch(e) {
    console.error(e);
}

