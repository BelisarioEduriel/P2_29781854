import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import ContactosController from "./controller/ContactosController.js";
import "dotenv/config"

const claveSecreta = process.env.KEYRECAPTCHA;
const urlVerificar = `https://www.google.com/recaptcha/api/siteverify?secret=${claveSecreta}&response=`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {
    nombrecompleto: "Wilmer Eduriel Belisario Sifontes",
    cedula: "29781854",
    seccion: "Seccion 3",
  });
});

app.post("/formulario", (req, res) => {
  const token = req.body['g-recaptcha-response'];
  fetch(urlVerificar + token)
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              ContactosController.add(req, res);
              console.log('Formulario válido');
          }
      })
      .catch(error => {
          console.error(error);
          res.status(500).send('Error al verificar reCAPTCHA');
      });

});
app.get("/api/contactos", (req, res) => {
  ContactosController.getAll(req, res);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
