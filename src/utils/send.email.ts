// src/utils/sendEmail.ts
import * as Sib from 'sib-api-v3-sdk';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendEmailOptions {
  email: string;
  subject: string;
  user: string;
  code: string;
  message: string;
}

@Injectable()
export class EmailService {
  private client: Sib.ApiClient;
  private tranEmailApi: Sib.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    this.client = Sib.ApiClient.instance;
    const apiKey = this.client.authentications['api-key'];
    apiKey.apiKey = this.configService.get<string>('API_KEY');
    this.tranEmailApi = new Sib.TransactionalEmailsApi();
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await this.tranEmailApi.sendTransacEmail({
        sender: {
          email: this.configService.get<string>('SENDER_EMAIL'),
          name: this.configService.get<string>('SENDER_NAME'),
        },
        to: [{ email: options.email }],
        subject: options.subject,
        params: {
          user: options.user,
          code: options.code,
          message: options.message,
        },
        htmlContent: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Verification Code</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f4;
                  }
                  .container {
                      max-width: 600px;
                      margin: 20px auto;
                      padding: 20px;
                      background-color: #fff;
                      border-radius: 5px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  .logo {
                      text-align: center;
                      margin-bottom: 20px;
                  }
                  .logo img {
                      max-width: 150px;
                      height: auto;
                  }
                  .content {
                      text-align: center;
                  }
                  .verification-code {
                      font-size: 24px;
                      margin-bottom: 20px;
                  }
                  .note {
                      color: #888;
                      margin-bottom: 20px;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="logo">
                      <img src="https://s3-eu-west-1.amazonaws.com/moyasar.api.assets.prod/entities/logos/35f/d3a/77-/original/data?1714399627" alt="Logo">
                  </div>
                  <div class="content">
                      <h3>Dear {{params.user}},</h3>
                      <p>Your Your code is:</p>
                      <p class="verification-code"><strong>{{params.code}}</strong></p>
                      <p class="note">{{params.message}}.</p>
                      <p>Thank you.</p>
                      <p>The Sayees Team.</p>
                  </div>
              </div>
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error sending verification code');
    }
  }
}
