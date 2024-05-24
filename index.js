const Application = require("./app/server");
require('dotenv').config() ;
new Application(process.env.APPLICATION_PORT, process.env.MONGODB_URL)