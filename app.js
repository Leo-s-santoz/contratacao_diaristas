//imports
const express = require("express");
const path = require("path");
const PORT = 3036;
const router = require("./routes");
const { Server } = require("http");
const bodyParser = require("body-parser");
//imports

const app = express();

//config
//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//permite que rotas do routers sejam acessadas a partir do "/"
app.use("/", router);

//serve pastas para serem acessadas pela url
app.use(express.static(path.join(__dirname, "/pages")));
app.use(express.static(path.join(__dirname)));

//permite o uso de json
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
