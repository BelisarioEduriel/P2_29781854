import ContactosModel from '../models/ContactosModel.js';

class ContactosController {
  static async add(req, res) {
    const { email, nombre, mensaje } = req.body;
    const ip = req.ip;
    const fecha = new Date();

    if (!email || !nombre || !mensaje) {
      return res.status(400).send('Todos los campos son obligatorios.');
    }

    try {
      await ContactosModel.saveContact({ email, nombre, mensaje, ip, fecha });
      
    } catch (error) {
      res.status(500).send('Error al guardar los datos.');
    }
  }
}

export default ContactosController;