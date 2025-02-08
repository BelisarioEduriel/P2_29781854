import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import ContactosController from "./controller/ContactosController.js";
import "dotenv/config";
import session from 'express-session';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // Importar rutas de autenticación
import adminRoutes from './routes/admin.js'; // Importar rutas de administración


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// SQLite setup
(async () => {
  try {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    app.locals.db = db;
  } catch (error) {
    console.error('Error setting up database:', error);
  }
})();

// Passport setup
passport.use(new GoogleStrategy({
  clientID: "aqui pones tu IDcliente de Google",
  clientSecret:"aqui el Client Secret de google",
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const db = app.locals.db;
  let user = await db.get('SELECT * FROM users WHERE username = ?', profile.id);
  if (!user) {
    const result = await db.run('INSERT INTO users (username) VALUES (?)', profile.id);
    user = { id: result.lastID, username: profile.id, role: 'user' };
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const db = app.locals.db;
  const user = await db.get('SELECT * FROM users WHERE id = ?', id);
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas de administración
app.use('/admin', adminRoutes);

app.get("/", (req, res) => {
  res.render("index", {
    nombrecompleto: "Wilmer Eduriel Belisario Sifontes",
    cedula: "29781854",
    seccion: "Seccion 3",
  });
});

app.post("/formulario", async (req, res) => {

      ContactosController.add(req, res);

});

app.get("/api/contactos", (req, res) => {
  ContactosController.getAll(req, res);
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta de perfil
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { user: req.user });
  } else {
    res.redirect('/auth/login');
  }
});

// Ruta para enviar correos
app.post('/formulario', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    let info = await emailHelper(to, subject, text);
    res.status(200).send(`Email Enviado: ${info.response}`);
  } catch (error) {
    res.status(500).send("Error sending email");
  }
});

// Rutas existentes
app.post('/contactos', (req, res) => {
  ContactosController.add(req, res);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});