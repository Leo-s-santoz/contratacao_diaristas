//imports
const express = require("express");
const path = require("path");
const PORT = 3036;
const router = require("./routers");
//imports

const app = express();

app.use("/", router);

app.use(express.static(path.join(__dirname, "/pages")));

app.use(express.static(path.join(__dirname)));

app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/login/index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
