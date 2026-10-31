// src/lib/mailer.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendRelieverEmail(
  to: string, 
  relieverName: string, 
  tadName: string, 
  date: Date, 
  link: string
) {
  const mailOptions = {
    from: `"HRIS BKP" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Tugas Tenaga Pengganti - Menggantikan ${tadName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Halo, ${relieverName}!</h2>
        <p>Anda ditugaskan sebagai <strong>Tenaga Pengganti</strong> untuk menggantikan <strong>${tadName}</strong> pada tanggal <strong>${date.toLocaleDateString('id-ID')}</strong>.</p>
        <p>Silakan lakukan absensi (Clock In) melalui link di bawah ini pada hari H:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">
          Klik untuk Absen
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Link ini bersifat rahasia. Jangan bagikan kepada siapa pun.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}