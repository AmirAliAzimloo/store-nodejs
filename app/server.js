const express = require("express");
const path = require("path");
const { default: mongoose } = require("mongoose");
const createError = require("http-errors");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require("cors")


const { AllRoutes } = require("./router/router");

require("dotenv").config()

module.exports = class Application {
  #app = express();
  #DB_URI;
  #PORT;
  constructor(PORT, DB_URI) {
    this.#PORT = PORT;
    this.#DB_URI = DB_URI;
    this.configApplication();
    this.initRedis();
    this.connectToMongoDB();
    this.createServer();
    this.createRoutes();
    this.errorHandling();
  }

  configApplication() {
    this.#app.use(cors())
    this.#app.use(morgan("dev"));
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
    this.#app.use(express.static(path.join(__dirname, "..", "public")));
    this.#app.use(
      "/api-doc",
      swaggerUI.serve,
      swaggerUI.setup(
        swaggerJsDoc({
          swaggerDefinition: {
            openapi: "3.0.0",
            info: {
              title: "Store Node.JS",
              version: "2.0.0",
              description:
                "Amazing Store with thw Node.JS",
              contact: {
                name: "Amir Ali Azimloo",
                url: "http://github.com/AmirAliAzimloo",
                email: "amiraliazimloo123@gmail.com",
              },
            },
            servers: [
              {
                url: "http://localhost:4000",
              },
              {
                url: "http://localhost:5000",
              },
            ],
            components : {
              securitySchemes : {
                BearerAuth : {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                  
                }
              }
            },
            security : [{BearerAuth : [] }]
          },
          apis: ["./app/router/**/*.js"],
        }),
        {explorer: true},
      )
    );
  }

  createServer() {
    const http = require("http");
    const server = http.createServer(this.#app)
    server.listen(this.#PORT, () => {
      console.log("run > http://localhost:" + this.#PORT);
    });
  }

  connectToMongoDB() {
    mongoose.connect(this.#DB_URI).then(() => {
        console.log("connected to DB.");
    }).catch(err => {
        console.log(err?.message ?? "Failed DB connection");
    })
      mongoose.connection.on("connected", () => {
        console.log("mongoose connected to DB");
      });
      mongoose.connection.on("disconnected", () => {
        console.log("mongoose connection is disconnected");
      });
      process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("disconnected");
        process.exit(0);
      });
  }

  initRedis(){
    require("./utils/initRedis")
  }

  createRoutes() {
    this.#app.use(AllRoutes);
  }

  errorHandling() {
    this.#app.use((req, res, next) => {
        next(createError.NotFound("آدرس مورد نظر یافت نشد"));
      });
      this.#app.use((error, req, res, next) => {
        const serverError = createError.InternalServerError();
        const statusCode = error.status || serverError.status;
        const message = error.message || serverError.message;
        return res.status(statusCode).json({
          statusCode,
          errors: {
            message,
          },
        });
      });
  }
};
