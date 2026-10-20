import { Test, TestingModule } from '@nestjs/testing';
import { InternalLogoutUseCase } from '@modules/auth/application/useCases/logout.useCase';

describe('InternalLogoutUseCase', () => {
  let useCase: InternalLogoutUseCase;

  // Mock del UserRepository
  const mockUserRepository = {
    find: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    findDistinctValues: jest.fn(),
    count: jest.fn(),
  };

  // Mock del LogProvider
  const mockLogProvider = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InternalLogoutUseCase,
          useFactory: () => new InternalLogoutUseCase(mockLogProvider, mockUserRepository),
        },
      ],
    }).compile();

    useCase = module.get(InternalLogoutUseCase);
    jest.clearAllMocks();
  });

  it('debería ejecutar logout exitosamente para un usuario válido', async () => {
    // Arrange

    const mockUser = {
      getValues: () => ({
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        enabled: true,
        logout: true,
        authProvider: 'internal',
        failedLoginAttempts: 0,
      }),
    };

    const params = {
      emailuser: 'test@test.com',
    };

    mockUserRepository.find.mockResolvedValueOnce(mockUser);
    mockUserRepository.update.mockResolvedValueOnce(undefined);

    // Act
    await useCase.execute(params);

    // Assert
    expect(mockLogProvider.debug).toHaveBeenCalledWith('INI | InternalLogoutUseCase - emailuser: test@test.com', 'InternalLogoutUseCase');
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(mockUserRepository.update).toHaveBeenCalledWith('test@test.com', {
      id: 1,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedPassword',
      enabled: true,
      logout: false,
      authProvider: 'internal',
      failedLoginAttempts: 0,
      sessionToken: null,
    });
    expect(mockLogProvider.info).toHaveBeenCalledWith('Logout for user: test@test.com', 'InternalLogoutUseCase');
  });

  it('debería lanzar error cuando el usuario no es encontrado', async () => {
    // Arrange
    const mockUser = {
      getValues: () => null,
    };

    const params = {
      emailuser: 'nonexistent@test.com',
    };

    mockUserRepository.find.mockResolvedValueOnce(mockUser);

    // Act & Assert
    await expect(useCase.execute(params)).rejects.toThrow('User not found');

    expect(mockLogProvider.debug).toHaveBeenCalledWith('INI | InternalLogoutUseCase - emailuser: nonexistent@test.com', 'InternalLogoutUseCase');
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'nonexistent@test.com' });
    expect(mockLogProvider.error).toHaveBeenCalledWith('ERROR | InternalLogoutUseCase - User not found', 'InternalLogoutUseCase');
  });

  it('debería lanzar error cuando find devuelve null', async () => {
    // Arrange
    const params = {
      emailuser: 'test@test.com',
    };

    mockUserRepository.find.mockResolvedValueOnce(null);

    // Act & Assert
    await expect(useCase.execute(params)).rejects.toThrow();

    expect(mockLogProvider.debug).toHaveBeenCalledWith('INI | InternalLogoutUseCase - emailuser: test@test.com', 'InternalLogoutUseCase');
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@test.com' });
  });

  it('debería manejar errores del repositorio correctamente', async () => {
    // Arrange
    const params = {
      emailuser: 'test@test.com',
    };

    const repositoryError = new Error('Database connection failed');
    mockUserRepository.find.mockRejectedValueOnce(repositoryError);

    // Act & Assert
    await expect(useCase.execute(params)).rejects.toThrow('Database connection failed');

    expect(mockLogProvider.debug).toHaveBeenCalledWith('INI | InternalLogoutUseCase - emailuser: test@test.com', 'InternalLogoutUseCase');
    expect(mockLogProvider.error).toHaveBeenCalledWith('ERROR | InternalLogoutUseCase - Database connection failed', 'InternalLogoutUseCase');
  });

  it('debería manejar errores durante la actualización del usuario', async () => {
    // Arrange
    const mockUser = {
      getValues: () => ({
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        enabled: true,
        logout: true,
        authProvider: 'internal',
        failedLoginAttempts: 0,
      }),
    };

    const params = {
      emailuser: 'test@test.com',
    };

    const updateError = new Error('Update failed');
    mockUserRepository.find.mockResolvedValueOnce(mockUser);
    mockUserRepository.update.mockRejectedValueOnce(updateError);

    // Act & Assert
    await expect(useCase.execute(params)).rejects.toThrow('Update failed');

    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(mockUserRepository.update).toHaveBeenCalledWith('test@test.com', {
      id: 1,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedPassword',
      enabled: true,
      logout: false,
      authProvider: 'internal',
      failedLoginAttempts: 0,
      sessionToken: null,
    });
    expect(mockLogProvider.error).toHaveBeenCalledWith('ERROR | InternalLogoutUseCase - Update failed', 'InternalLogoutUseCase');
  });
});
