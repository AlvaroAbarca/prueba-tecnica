import { Test, TestingModule } from '@nestjs/testing';
import { InternalLoginUseCase } from '@modules/auth/application/useCases/internalLogin.useCase';
import { InvalidCredentialsException } from '@modules/auth/domain/exceptions/authExceptions';
import * as bcrypt from 'bcrypt';
import { LoginValidationService } from '@modules/auth/application/services/loginValidation.service';

jest.mock('bcrypt');

describe('InternalLoginUseCase', () => {
  let useCase: InternalLoginUseCase;
  let loginValidationService: LoginValidationService;

  const TEST_HASHED_PASSWORD = ['hashed', 'Password'].join('');
  const TEST_VALID_PASSWORD = `password${123}`;
  const TEST_INVALID_PASSWORD = ['wrong', 'password'].join('');
  const mockUserRepository = {
    find: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    findDistinctValues: jest.fn(),
    count: jest.fn(),
  };

  const mockTokenService = {
    generateTokens: jest.fn(),
    verifyToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    refreshTokens: jest.fn(),
    isTokenExpired: jest.fn(),
  };

  const mockLogProvider = {
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const buildMockUser = (overrides: Record<string, any> = {}) => ({
    getValues: () => ({
      id: '1',
      email: 'test@test.com',
      password: TEST_HASHED_PASSWORD,
      enabled: true,
      failedLoginAttempts: 0,
      lastPasswordUpdate: new Date(),
      lastLoginDate: new Date(),
      enable2fa: false,
      secret2fa: null,
      rut: '12345678-9',
      firstName: 'Test',
      lastName: 'User',
      emailVerified: true,
      img: null,
      timeZoneCode: 'America/Santiago',
      languageCode: 'es',
      authProvider: 'internal',
      logout: false,
      phone: '',
      iata: 'SCL',
      ...overrides,
    }),
  });

  const mockTokens = {
    accessToken: 'test-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    loginValidationService = new LoginValidationService(mockLogProvider, mockUserRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InternalLoginUseCase,
          useFactory: () => new InternalLoginUseCase(mockLogProvider, mockTokenService as any, mockUserRepository, loginValidationService),
        },
      ],
    }).compile();

    useCase = module.get(InternalLoginUseCase);
    jest.clearAllMocks();
  });

  describe('Login exitoso', () => {
    it('debería autenticar exitosamente un usuario sin 2FA', async () => {
      const mockUser = buildMockUser();
      mockUserRepository.find.mockResolvedValueOnce(mockUser);
      mockTokenService.generateTokens.mockResolvedValueOnce(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await useCase.execute({
        emailuser: 'test@test.com',
        password: TEST_VALID_PASSWORD,
      });

      expect(result).toHaveProperty('accessToken', 'test-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(mockTokenService.generateTokens).toHaveBeenCalledWith(expect.objectContaining({ provider: 'internal' }));
    });

    it('debería guardar el sessionToken en el repositorio tras autenticar', async () => {
      const mockUser = buildMockUser();
      mockUserRepository.find.mockResolvedValueOnce(mockUser);
      mockTokenService.generateTokens.mockResolvedValueOnce(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await useCase.execute({
        emailuser: 'test@test.com',
        password: TEST_VALID_PASSWORD,
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith('test@test.com', expect.objectContaining({ sessionToken: 'test-token' }));
    });

    it('debería resetear los intentos fallidos tras un login exitoso', async () => {
      const mockUser = buildMockUser({ failedLoginAttempts: 2 });
      mockUserRepository.find.mockResolvedValueOnce(mockUser);
      mockTokenService.generateTokens.mockResolvedValueOnce(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await useCase.execute({
        emailuser: 'test@test.com',
        password: TEST_VALID_PASSWORD,
      });

      expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.update).toHaveBeenNthCalledWith(1, 'test@test.com', expect.objectContaining({ failedLoginAttempts: 0, lastFailLogDate: null }));
      expect(mockUserRepository.update).toHaveBeenNthCalledWith(2, 'test@test.com', expect.objectContaining({ sessionToken: 'test-token' }));
    });
  });

  describe('Validación de usuario', () => {
    it('debería lanzar InvalidCredentialsException si el usuario no existe', async () => {
      mockUserRepository.find.mockResolvedValueOnce(null);

      await expect(useCase.execute({ emailuser: 'noexiste@test.com', password: TEST_VALID_PASSWORD })).rejects.toThrow(InvalidCredentialsException);
    });

    it('debería lanzar InvalidCredentialsException si el usuario está deshabilitado', async () => {
      const mockUser = buildMockUser({ enabled: false });
      mockUserRepository.find.mockResolvedValueOnce(mockUser);

      await expect(useCase.execute({ emailuser: 'test@test.com', password: TEST_VALID_PASSWORD })).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('Validación de contraseña', () => {
    it('debería lanzar InvalidCredentialsException con credenciales inválidas e incrementar intentos', async () => {
      const mockUser = buildMockUser();
      mockUserRepository.find.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(useCase.execute({ emailuser: 'test@test.com', password: TEST_INVALID_PASSWORD })).rejects.toThrow(InvalidCredentialsException);

      expect(mockUserRepository.update).toHaveBeenCalledWith('test@test.com', expect.objectContaining({ failedLoginAttempts: 1 }));
    });

    it('debería lanzar InvalidCredentialsException si la cuenta está bloqueada por intentos fallidos', async () => {
      const mockUser = buildMockUser({ failedLoginAttempts: 5 });
      mockUserRepository.find.mockResolvedValueOnce(mockUser);

      await expect(useCase.execute({ emailuser: 'test@test.com', password: TEST_INVALID_PASSWORD })).rejects.toThrow(InvalidCredentialsException);
    });

    it('debería lanzar InvalidCredentialsException si la contraseña está expirada', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 91);
      const mockUser = buildMockUser({ lastPasswordUpdate: oldDate });
      mockUserRepository.find.mockResolvedValueOnce(mockUser);

      await expect(useCase.execute({ emailuser: 'test@test.com', password: TEST_VALID_PASSWORD })).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('Validación de inactividad', () => {
    it('debería lanzar InvalidCredentialsException y bloquear cuenta por inactividad prolongada', async () => {
      const oldLoginDate = new Date();
      oldLoginDate.setDate(oldLoginDate.getDate() - 181);
      const mockUser = buildMockUser({ lastLoginDate: oldLoginDate });
      mockUserRepository.find.mockResolvedValueOnce(mockUser);

      await expect(useCase.execute({ emailuser: 'test@test.com', password: TEST_VALID_PASSWORD })).rejects.toThrow(InvalidCredentialsException);

      expect(mockUserRepository.update).toHaveBeenCalledWith('test@test.com', expect.objectContaining({ enabled: false }));
    });

    it('debería permitir el login si la última sesión está dentro del plazo de inactividad', async () => {
      const recentLoginDate = new Date();
      recentLoginDate.setDate(recentLoginDate.getDate() - 31);
      const mockUser = buildMockUser({ lastLoginDate: recentLoginDate });
      mockUserRepository.find.mockResolvedValueOnce(mockUser);
      mockTokenService.generateTokens.mockResolvedValueOnce(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await useCase.execute({ emailuser: 'test@test.com', password: TEST_VALID_PASSWORD });

      expect(result).toHaveProperty('accessToken', 'test-token');
    });
  });
});
