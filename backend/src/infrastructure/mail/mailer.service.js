import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class MailerService {
  constructor() {
    this.transporter = null;
    this.mode = 'idle'; // 'smtp' | 'ethereal' | 'local_file'
    this.mailsDir = path.resolve('uploads', 'mails');

    // Asegurar directorio local de correos
    if (!fs.existsSync(this.mailsDir)) {
      fs.mkdirSync(this.mailsDir, { recursive: true });
    }
  }

  async getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        this.mode = 'smtp';
        return this.transporter;
      } catch (err) {
        console.warn('[Mailer] Error configurando SMTP externo:', err.message);
      }
    }

    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.mode = 'ethereal';
      console.log(`[Mailer] Modo Ethereal activo: ${testAccount.user}`);
      return this.transporter;
    } catch {
      // Fallback robusto sin internet: transporte JSON/stream local
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.mode = 'local_file';
      console.log('[Mailer] Modo Local/Simulado activo (archivos guardados en uploads/mails/)');
      return this.transporter;
    }
  }

  async enviarProgramacionSemanal({ destinatario, operarioNombre, semana, asignaciones }) {
    const transporter = await this.getTransporter();

    const filasHtml = asignaciones.map((asig) => {
      const fechaVal = asig.fecha || asig.fechaAsignada;
      const fecha = new Date(fechaVal).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; text-transform: capitalize;">${fecha}</td>
          <td style="padding: 10px;">${asig.horaInicioEstimada} - ${asig.horaFinEstimada}</td>
          <td style="padding: 10px;">${asig.centroTrabajo?.nombre || 'Centro N/A'}</td>
          <td style="padding: 10px;">${asig.tipoActividad?.nombre || 'General'}</td>
          <td style="padding: 10px; font-size: 13px; color: #64748b;">${asig.instrucciones || asig.descripcion || 'Sin observaciones'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">ServiControl - Notificación de Programación Semanal</h1>
          <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Semana ${semana}</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #1e293b;">
            Estimado(a) <strong>${operarioNombre}</strong>,
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Se ha publicado la programación de sus centros de trabajo y actividades de mantenimiento locativo para la semana en curso. A continuación encontrará los detalles:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 10px;">Fecha</th>
                <th style="padding: 10px;">Horario</th>
                <th style="padding: 10px;">Centro de Trabajo (Conjunto)</th>
                <th style="padding: 10px;">Actividad</th>
                <th style="padding: 10px;">Instrucciones</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; font-size: 13px; color: #92400e;">
            <strong>Recordatorio de Operación:</strong>
            <ul style="margin: 6px 0 0; padding-left: 20px;">
              <li>Registre su hora de llegada y salida en la aplicación.</li>
              <li>Tome obligatoriamente las 3 evidencias fotográficas: <em>Antes</em>, <em>Durante</em> y <em>Después</em>.</li>
              <li>Si no tiene señal de internet en el conjunto, el sistema almacenará sus fotos localmente y se sincronizarán al recuperar conectividad.</li>
            </ul>
          </div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px;">
            Este es un correo institucional automático de ServiControl. Por favor no responda a este mensaje.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"ServiControl Operaciones" <operaciones@servicontrol.com>',
      to: destinatario,
      subject: `[ServiControl] Programación Semanal de Actividades - Semana ${semana}`,
      html,
    };

    let previewUrl = null;
    let messageId = null;

    if (this.mode === 'ethereal') {
      const info = await transporter.sendMail(mailOptions);
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
      messageId = info.messageId;
    } else {
      // Modo local o fallback offline
      const info = await transporter.sendMail(mailOptions);
      const mailId = crypto.randomBytes(8).toString('hex');
      const filename = `programacion-${semana}-${mailId}.html`;
      const filePath = path.join(this.mailsDir, filename);

      fs.writeFileSync(filePath, html, 'utf-8');
      messageId = info.messageId || mailId;
      previewUrl = `/uploads/mails/${filename}`;
    }

    return {
      messageId,
      destinatario,
      previewUrl,
      mode: this.mode,
    };
  }
}

export const mailerService = new MailerService();
