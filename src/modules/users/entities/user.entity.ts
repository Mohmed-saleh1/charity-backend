import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  birthdate: Date;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  emailVerifyCode?: string;

  @Column({ nullable: true })
  emailVerifyExpiers?: Date;
}
