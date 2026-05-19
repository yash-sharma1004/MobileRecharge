import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  console.log('Testing SMTP with:', process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection verified successfully!');

    console.log('Sending test email to:', process.env.SMTP_USER);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'SMTP Test',
      text: 'If you receive this, your SMTP configuration is working.',
    });
    console.log('Email sent:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('SMTP Error:', error);
  }
};

test();
