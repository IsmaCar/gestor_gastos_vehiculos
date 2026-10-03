import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~])/, {
    message: 'password must contain at least one special character',
  })
  password!: string;
}
