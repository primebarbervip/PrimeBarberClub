export function getEmailTicketTemplate(data: {
    clienteNombre: string;
    barberoNombre: string;
    servicioNombre: string;
    fecha: string;
    hora: string;
    total: string;
    shopName: string;
    shopAddress: string;
    shopLogo: string;
    googleMapsUrl: string;
    shopPhone: string;
}) {
    const {
        clienteNombre,
        barberoNombre,
        servicioNombre,
        fecha,
        hora,
        total,
        shopName,
        shopAddress,
        shopLogo,
        googleMapsUrl,
        shopPhone
    } = data;

    // Logo fallback
    const logoUrl = shopLogo && shopLogo.startsWith('http')
        ? shopLogo
        : `https://barber-shop-prime.vercel.app${shopLogo || '/abel.jpg'}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Ticket - ${shopName}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #0c0c0c; padding: 40px 0; }
        .container { width: 100%; max-width: 450px; margin: 0 auto; background-color: #1a1a1a; border-radius: 32px; overflow: hidden; border: 1px solid #333333; position: relative; }
        
        /* TICKET PUNCH EFFECT */
        .punch-line { height: 1px; border-top: 2px dashed #333333; margin: 30px 0; position: relative; }
        .punch-left, .punch-right { position: absolute; top: -15px; width: 30px; height: 30px; border-radius: 50%; background-color: #0c0c0c; border: 1px solid #333333; }
        .punch-left { left: -16px; }
        .punch-right { right: -16px; }

        .header { padding: 40px 30px 20px; text-align: center; }
        .logo { width: 80px; height: 80px; border-radius: 20px; object-cover; border: 1px solid #444444; margin-bottom: 15px; }
        .shop-name { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0; color: #ffffff; }
        .shop-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; background-color: #222222; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #888888; margin-top: 8px; }

        .content { padding: 10px 40px 40px; }
        .section-label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #555555; margin-bottom: 6px; }
        .value { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 24px; }
        .important-value { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin-bottom: 24px; }
        .status-badge { display: inline-block; padding: 6px 14px; border-radius: 8px; background-color: #f59e0b; color: #000000; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }

        .footer { padding: 30px; background-color: #111111; text-align: center; border-top: 1px solid #222222; }
        .btn-maps { display: inline-block; padding: 16px 32px; border-radius: 100px; background-color: #ffffff; color: #000000; font-size: 11px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 20px; box-shadow: 0 10px 20px rgba(255,255,255,0.1); }
        .address-text { font-size: 12px; color: #666666; line-height: 1.6; margin-top: 15px; max-width: 300px; margin-left: auto; margin-right: auto; }
        .phone-link { color: #ffffff; text-decoration: none; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrapper">
        <center>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" alt="Logo" class="logo">
                    <h1 class="shop-name">${shopName}</h1>
                    <div class="shop-badge">Ticket de Reserva</div>
                </div>

                <div class="punch-line">
                    <div class="punch-left"></div>
                    <div class="punch-right"></div>
                </div>

                <div class="content">
                    <div style="text-align: left;">
                        <div class="status-badge">Estado: Pendiente de Confirmación</div>
                        
                        <div class="section-label">Cliente</div>
                        <div class="value">${clienteNombre}</div>

                        <div class="section-label">Profesional</div>
                        <div class="value">${barberoNombre}</div>

                        <div class="section-label">Servicio</div>
                        <div class="value">${servicioNombre}</div>

                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                                <td width="60%">
                                    <div class="section-label">Fecha</div>
                                    <div class="value">${fecha}</div>
                                </td>
                                <td>
                                    <div class="section-label">Hora</div>
                                    <div class="important-value">${hora}</div>
                                </td>
                            </tr>
                        </table>

                        <div class="section-label">Total Incluyendo Anticipo</div>
                        <div class="important-value" style="color: #ffffff;">${total} BOB</div>

                        <div style="background-color: #222222; padding: 20px; border-radius: 16px; margin-top: 10px; border: 1px solid #333333;">
                            <p style="margin: 0; font-size: 12px; color: #f59e0b; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Aviso Importante</p>
                            <p style="margin: 10px 0 0; font-size: 13px; color: #cccccc; line-height: 1.5;">Nos comunicaremos contigo vía WhatsApp para confirmar el anticipo del 50%. Una vez verificado, tu turno quedará oficialmente confirmado.</p>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="section-label">Ubicación</div>
                    <div class="address-text">${shopAddress}</div>
                    <a href="${googleMapsUrl}" class="btn-maps">Ver en Google Maps</a>
                    
                    <div style="margin-top: 30px;">
                        <span style="font-size: 11px; color: #444444;">Si tienes dudas contáctanos al</span><br>
                        <a href="tel:${shopPhone}" class="phone-link">${shopPhone}</a>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 30px; color: #333333; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
                Barber Shop Prime &copy; 2026
            </div>
        </center>
    </div>
</body>
</html>
    `;
}
