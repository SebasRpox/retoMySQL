const express = require("express");
const morgan = require("morgan");
const app = express();

const vehiculos = require("./routes/vehiculos");
const tipo_linea = require("./routes/tipo_linea");
const tipo_marca = require("./routes/tipo_marca");

require("dotenv").config();

app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api", vehiculos);
app.use("/api", tipo_linea);
app.use("/api", tipo_marca);

app.get('/', (req, res)=>{
    res.send("<h1>Bienvenido al API de Semillero S.A.S</h1>");
});
app.set("port", process.env.PORT || 8080)

app.listen(app.get("port"), ()=>{
    console.log(`Servidor en el puerto ${app.get("port")}`);
});