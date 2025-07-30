import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  findOne: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockUser = {
  id: '1',
  username: 'testuser',
  password: 'hashedpassword',
  tasks: [],
};

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useFactory: mockUsersRepository,
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('SignUp', () => {
    it('should create a new user', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'testuser',
        password: 'testpassword',
      };
      usersRepository.createUser.mockResolvedValue(mockUser);

      const result = await service.SignUp(authCredentialsDto);

      expect(usersRepository.createUser).toHaveBeenCalledWith(authCredentialsDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('SignIn', () => {
    it('should return access token for valid credentials', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'testuser',
        password: 'testpassword',
      };
      const accessToken = 'test-access-token';

      usersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(accessToken);

      const result = await service.SignIn(authCredentialsDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: authCredentialsDto.username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        authCredentialsDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: authCredentialsDto.username,
      });
      expect(result).toEqual({ accessToken });
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'invaliduser',
        password: 'testpassword',
      };

      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.SignIn(authCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.SignIn(authCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
