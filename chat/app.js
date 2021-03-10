var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const Joi = require("joi");
const fs = require("fs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(express.json());

let mensajes;

try {
  const data = fs.readFileSync("mensajes.json", "utf8");
  mensajes =JSON.parse(data);
  console.log(data);
} catch (err) {
  console.error(err);
}

/* const mensajes = [
  {
    message: "New message",
    author: "Juan José Rodríguez",
    ts: 1599868276352,
  },
  {
    message: "Mensaje nuevo",
    author: "Juan Camilo Higuera",
    ts: 1599868276353,
  },
]; */

app.get("/chat/api/messages", (req, res) => {
  res.send(mensajes);
});

app.get("/chat/api/messages/:ts", (req, res) => {
  const mensaje = mensajes.find((c) => c.ts === parseInt(req.params.ts));
  if (!mensaje)
    return res.status(404).send("The message with the given ts was not found.");
  res.send(mensaje);
});

app.post("/chat/api/messages", (req, res) => {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().min(7).required(),
    ts: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).send(error);
  }

  const mensaje = {
    message: req.body.message,
    author: req.body.author,
    ts: req.body.ts,
  };

  mensajes.push(mensaje);
  fs.writeFileSync("mensajes.json", JSON.stringify(mensajes, null, 4));
  res.send(mensaje);
});

app.put("/chat/api/messages/:ts", (req, res) => {
  const mensaje = mensajes.find((c) => c.ts === parseInt(req.params.ts));
  if (!mensaje)
    return res.status(404).send("The message with the given ts was not found.");

  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().min(7).required(),
    ts: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).send(error);
  }

  mensaje.message = req.body.message;
  mensaje.author = req.body.author;
  mensaje.ts = req.body.ts;
  fs.writeFileSync("mensajes.json", JSON.stringify(mensajes, null, 4));
  res.send(mensaje);
});

app.delete("/chat/api/messages/:ts", (req, res) => {
  const mensaje = mensajes.find((c) => c.ts === parseInt(req.params.ts));
  if (!mensaje)
    return res.status(404).send("The message with the given ts was not found.");

  const index = mensajes.indexOf(mensaje);
  mensajes.splice(index, 1);
  fs.writeFileSync("mensajes.json", JSON.stringify(mensajes, null, 4));
  res.send(mensaje);
});

module.exports = app;
