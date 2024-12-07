import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    nombre TEXT,
    mensaje TEXT,
    ip TEXT,
    fecha TEXT
  )`);
});

class ContactosModel {
  static saveContact(contact) {
    return new Promise((resolve, reject) => {
      const { email, nombre, mensaje, ip, fecha } = contact;
      const query = `INSERT INTO contactos (email, nombre, mensaje, ip, fecha)
                     VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [email, nombre, mensaje, ip, fecha], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      });
    });
  }

  static getAllContacts() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM contactos`;
      db.all(query, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}

export default ContactosModel;
