import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInDto {
  @IsEmail()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(data: any) {
    this.username = data.username;
    this.password = data.password;
  }
}
