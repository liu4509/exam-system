import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.163.com',
      port: 465,
      auth: {
        user: '17585114509@163.com',
        pass: 'NNfvFLA7aL4hbfUy',
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '考试系统',
        address: '17585114509@163.com',
      },
      to,
      subject,
      html,
    });
  }
}
