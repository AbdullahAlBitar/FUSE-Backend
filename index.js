const express = require("express");
const helmet = require("helmet");
const cors = require('cors');

const userRoutes = require("./routes/userRoutes");
const gateRoutes = require("./routes/gateRoutes");
const authRouter = require("./routes/authRoutes");
const beneficiarieRouter = require("./routes/beneficiarieRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const accountRoutes = require("./routes/accountRoutes");
const cardRoutes = require("./routes/cardRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const keyRoutes = require("./routes/keyRoutes");
const billRoutes = require("./routes/billRoutes");

const { authenticateJWT } = require('./middleware/authMiddleware');
const { handleError } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(helmet());

app.use(express.static("public"));
app.use(express.json());

const router = express.Router();

router.get("/", async (req, res) => {
    res.json({ msg: "Hello World, I am alive!" });
});

router.use("/gate", gateRoutes);
router.use("/key", keyRoutes);
router.use("/auth", authRouter);

router.use(authenticateJWT);

router.use("/user", userRoutes);
router.use("/merchant", merchantRoutes);
router.use("/beneficiarie", beneficiarieRouter);
router.use("/account", accountRoutes);
router.use("/card", cardRoutes);
router.use("/transaction", transactionRoutes);
router.use("/bill", billRoutes);

app.use((err, req, res, next) => {
  handleError(err, res, req);
});

app.use('/FUSE', router);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

try {
  await prisma.$connect();
  console.log('Successfully connected to the database');

  PORT = process.env.PORT | 3030;
  app.listen(PORT, () => {
    console.log("Server listening on port ", PORT);
  });
} catch (error) {
  console.error('Unable to connect to the database:', error);
} finally {
  await prisma.$disconnect();
}

