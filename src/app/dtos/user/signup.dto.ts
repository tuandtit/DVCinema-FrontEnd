import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  retypePassword: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;
  constructor(
    username: string,
    password: string,
    retypePassword: string,
    displayName: string
    // avatar: File | null
  ) {
    this.username = username;
    this.password = password;
    this.retypePassword = retypePassword;
    this.displayName = displayName;
    // this.avatar = avatar;
  }

  toFormData(): FormData {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('retypePassword', this.retypePassword);
    formData.append('displayName', this.displayName); // Convert boolean thành string
    // if (this.avatar) {
    //     formData.append('avatar', this.avatar);
    // }
    return formData;
  }
}
