import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from '@modules/auth/application/useCases/refreshToken.useCase';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { JwtTokenService } from '@modules/auth/infrastructure/services/jwtToken.service';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  // Mock del JwtTokenService
  const mockJwtTokenService = {
    verifyRefreshToken: jest.fn().mockResolvedValue({
      email: 'test@example.com',
      sub: 1,
    }),
    generateTokens: jest.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
      refreshExpiresIn: 28800,
      tokenType: 'Bearer',
    }),
  };

  // Mock del UserRepository
  const mockUserRepository = {
    find: jest.fn().mockResolvedValue({
      getValues: () => ({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '',
      }),
      getEmail: () => 'test@example.com',
      get2FA: () => false,
    }),
    update: jest.fn().mockResolvedValue(undefined),
  };

  // Mock del LogProvider
  const mockLogProvider = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'RefreshTokenUseCase',
          useFactory: (logger: LogProvider, jwtTokenService: JwtTokenService, userRepository: UserRepository) =>
            new RefreshTokenUseCase(logger, jwtTokenService, userRepository),
          inject: [LogProvider, JwtTokenService, UserRepository],
        },
        {
          provide: LogProvider,
          useValue: mockLogProvider,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get('RefreshTokenUseCase');
    jest.clearAllMocks();
  });

  it('debería refrescar los tokens correctamente', async () => {
    // Act
    const result = await useCase.execute('valid-refresh-token');

    // Assert
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
      refreshExpiresIn: 28800,
      tokenType: 'Bearer',
    });
    expect(mockJwtTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockJwtTokenService.generateTokens).toHaveBeenCalledWith({
      account: expect.objectContaining({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }),
      provider: 'internal',
    });
    expect(mockUserRepository.update).toHaveBeenCalledWith('test@example.com', {
      sessionToken: 'new-access-token',
    });
  });

  it('debería lanzar error si no se proporciona refresh token', async () => {
    // Act & Assert
    await expect(useCase.execute('')).rejects.toThrow('Token de refresco requerido');
  });
});
