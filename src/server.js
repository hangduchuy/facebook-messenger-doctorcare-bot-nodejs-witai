import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine";
import webRoutes from "./routes/web";

const cors = require("cors");
let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", "./views");
app.set("view engine", "ejs");

//config view Engine
viewEngine(app);

//config web routes
webRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("App is running at the port: " + port);
});
