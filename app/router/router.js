const router = require("express").Router();

const { VerifyAccessToken } = require("../http/middlewares/verifyAccessToken");
const { AdminRoutes } = require("./admin/admin.routes");
const { HomeRoutes } = require("./api");
const { DeveloperRoutes } = require("./developer.routes");
const { UserAuthRoutes } = require("./user/auth");
// const { blogApiPrisma } = require("./prisma-api/blog.api");


router.use("/user", UserAuthRoutes)
router.use("/admin",VerifyAccessToken, AdminRoutes)
router.use("/developer", DeveloperRoutes)
// router.use("/blogs", blogApiPrisma)

router.use("/", HomeRoutes)


module.exports = {
    AllRoutes : router
}