import nodemailer from "nodemailer";
import "dotenv/config";

const emailHelper = async (text) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAILFROM,
      pass: process.env.PASS,
    },
  });

  const contenido = `
  <h2>Información del Mensaje</h2>
  <p><strong>Nombre:</strong> ${text.nombre}</p>
  <p><strong>Email:</strong> ${text.email}</p>
  <p><strong>Mensaje:</strong> ${text.mensaje}</p>
  <p><strong>IP:</strong> ${text.ip}</p>
  <p><strong>País:</strong> ${text.country}</p>
  <p><strong>Fecha:</strong> ${text.fecha}</p>
`;

  let mailOptions = {
    from: process.env.EMAILFROM,
    to: process.env.EMAILTO,
    subject: "Nuevo Registro 29 781 854(Programacion 2 Seccion 3)",
    html: contenido,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default emailHelper;
