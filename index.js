const express = require("express");

const app = express();

const PORT = 8000;

const routes = require("./app/routes/routes");




app.listen(PORT, () => {
    routes(app);
});
