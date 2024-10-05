// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as crypto from 'crypto';
import { EmailService } from '../../utils/send.email';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, birthdate, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Sorry, this user already exists');
    }

    const user = this.userRepository.create({
      email,
      name,
      birthdate,
      password,
    });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.emailVerifyCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');
    user.emailVerifyExpiers = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepository.save(user);

    const message =
      'Welcome to Sayees! Please use the provided verification code to activate your account';

    try {
      await this.emailService.sendEmail({
        email: user.email,
        subject: 'Your Email Verification Code (valid for 10 min)',
        user: user.name,
        code: verificationCode,
        message,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Error sending verification code');
    }
    return user;
  }
}
