const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');

const app = express();

app.use(morgan('URL :url Method :method StatusCode :status'))
app.use(bodyParser.json());
// for parsing multipart/form-data
var multer = require("multer");
var upload = multer();

app.use(upload.array());
app.use(express.static("public"));
const cors = require("cors");
app.use(bodyParser.json({})); //this line is required to tell your app to parse the body as json
app.use(bodyParser.urlencoded({ extended: false }));
// init env file
dotenv.config();

app.use(
  cors({
    origin: [
      "https://backend.huxhtech.com",
      "http://www.deal.huxhtech.com",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

const huxhRoutes = require("./routes/huxhRoutes");
// route middlewares for admin
app.use("/api/v1/huxh-deal", huxhRoutes);

app.get("/", (req, res) => {
  res.send("<h2>Huxh-Tech-Deal Backend Is Running</h2>");
});

app.listen(process.env.PORT || 3000, async () => {
  console.log("🚀 app running on port", process.env.PORT || 3000);
  // await init()
});
