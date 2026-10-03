import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaClientKnownRequestError } from '../../generated/prisma/internal/prismaNamespace';
import { JwtService } from '@nestjs/jwt';

// Valid argon2id hash with no corresponding real password, used to keep
// login response times consistent whether or not the email exists, and
// prevent user enumeration via timing attacks.
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,p=1,t=3$4NqMdt9rSNhMiZuQGkQuNw$lCqXio3/PEZDquE0d5f6pCvEI2rVL6uciRXsOlUdbFk';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if(existing) throw new ConflictException('User already exists')


    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    try {
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },      
      });      
      const { password: _password, ...sanitizedUser } = user;
      return sanitizedUser;
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User already exists')
      }
      throw error
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always run argon2.verify, even when the user doesn't exist, so the
    // response time doesn't leak whether the email is registered.
    const hashToVerify = user?.password ?? DUMMY_HASH;
    const isPasswordValid = await argon2.verify(hashToVerify, password);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { access_token };
  }
}
