import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { EmailService } from '../../utils/send.email';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
})
export class AuthModule {}
