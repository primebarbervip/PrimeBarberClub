import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function enviarCodigoVerificacion(email: string, nombre: string, codigo: string) {
  const mailOptions = {
    from: `"Prime Barber VIP ✂️" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${codigo} es tu código de acceso`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; background-color: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #18181b; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">PRIME BARBER</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #18181b;">¡Hola, ${nombre}!</h2>
          <p style="color: #4b5563;">Usa el siguiente código para verificar tu cuenta:</p>
          <div style="margin: 30px 0; text-align: center;">
            <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; display: inline-block; border: 1px dashed #d4d4d8;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${codigo}</span>
            </div>
          </div>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

export async function enviarTicketReserva(email: string, shopName: string, html: string) {
  const mailOptions = {
    from: `"${shopName} ✂️" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Tu Ticket de Reserva - ${shopName}`,
    html: html,
  };

  return await transporter.sendMail(mailOptions);
}