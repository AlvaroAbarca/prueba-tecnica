import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from '@modules/auth/application/services/login.service';
import { InternalLoginUseCase } from '@modules/auth/application/useCases/internalLogin.useCase';
import { InvalidCredentialsException } from '@modules/auth/domain/exceptions/authExceptions';
import { AuthResponse } from '@modules/auth/domain/interfaces/authResponse.interface';

describe('LoginService', () => {
  let service: LoginService;
  let loginInternal: jest.Mocked<InternalLoginUseCase>;

  const mockLogProvider = {
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockLoginInternal = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoginService,
          useFactory: () => new LoginService(mockLogProvider, mockLoginInternal as any),
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    loginInternal = mockLoginInternal as any;

    jest.clearAllMocks();
  });

  const mockParams = {
    emailuser: 'test@example.com',
    password: 'password123',
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    refreshExpiresIn: 7200,
    tokenType: 'Bearer',
    user: {
      rut: '12345678-9',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      emailVerified: true,
      avatar: '',
      timeZoneCode: 'America/Santiago',
      languageCode: 'es',
      authProvider: 'internal',
      logout: false,
    },
  };

  it('debería autenticar con login interno', async () => {
    loginInternal.execute.mockResolvedValue(mockAuthResponse);

    const result = await service.execute(mockParams);

    expect(loginInternal.execute).toHaveBeenCalledWith({
      emailuser: mockParams.emailuser,
      password: mockParams.password,
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('debería loguear INI y END en una ejecución exitosa', async () => {
    loginInternal.execute.mockResolvedValue(mockAuthResponse);

    await service.execute(mockParams);

    expect(mockLogProvider.debug).toHaveBeenCalledWith(expect.stringContaining('INI | login.service.ts'), 'LoginService');
    expect(mockLogProvider.debug).toHaveBeenCalledWith(expect.stringContaining('END | login.service.ts'), 'LoginService');
  });

  it('debería relanzar InvalidCredentialsException', async () => {
    loginInternal.execute.mockRejectedValue(new InvalidCredentialsException('User and Password not found'));

    await expect(service.execute(mockParams)).rejects.toThrow(InvalidCredentialsException);
  });

  it('debería envolver errores inesperados en InvalidCredentialsException', async () => {
    loginInternal.execute.mockRejectedValue(new Error('Error interno'));

    await expect(service.execute(mockParams)).rejects.toThrow(InvalidCredentialsException);
    expect(mockLogProvider.error).toHaveBeenCalled();
  });
});
