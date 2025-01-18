import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import ContactosController from "./controller/ContactosController.js";
import "dotenv/config";

const SECRET_KEY = process.env.KEY_SECRET;
const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

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

app.post("/formulario", async (req, res) => {
  const { nombre, email, mensaje, country, ip, recaptcha } = req.body;

  if (!recaptcha) {
    return res.status(400).send("Por favor, seleccione el reCAPTCHA.");
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: `secret=${SECRET_KEY}&response=${recaptcha}`,
    });

    const data = await response.json();

    if (data.success) {
      ContactosController.add(req, res);
      res.send("Formulario enviado correctamente");
    } else {
      res.status(400).send("reCAPTCHA inválido");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al validar reCAPTCHA");
  }
});

app.get("/api/contactos", (req, res) => {
  ContactosController.getAll(req, res);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
