const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./routes/index");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();

const PORT = 3000;

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());

//Connect MongoDB
connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/expense_tracker", routes);

app.listen(PORT, () => {
  console.log("Server running on http://127.0.0.1:3000");
});
