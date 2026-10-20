import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '@modules/users/application/useCases/createUser.useCase';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { CipherService } from '@modules/shared/domain/interface/cipherService.interface';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  // Mock del UserRepository
  const mockUserRepository = {
    create: jest.fn().mockImplementation((userData) => ({
      getValues: () => ({
        id: 1,
        ...userData,
      }),
    })),
  };

  // Mock del CipherService
  const mockCipherService = {
    generateBcrypt: jest.fn().mockResolvedValue('encrypted-password'),
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
          provide: 'CreateUserUseCase',
          useFactory: (logger: LogProvider, userRepository: UserRepository, cipherService: CipherService) => new CreateUserUseCase(logger, userRepository, cipherService),
          inject: [LogProvider, UserRepository, CipherService],
        },
        {
          provide: LogProvider,
          useValue: mockLogProvider,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: CipherService,
          useValue: mockCipherService,
        },
      ],
    }).compile();

    useCase = module.get('CreateUserUseCase');
    jest.clearAllMocks();
  });

  it('debería crear un usuario correctamente con password', async () => {
    // Arrange
    const userData = {
      user: {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      },
      profiles: [1],
    };

    // Act
    const result = await useCase.start(userData);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'encrypted-password',
      }),
    );

    expect(mockCipherService.generateBcrypt).toHaveBeenCalledWith('password123');
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockLogProvider.debug).toHaveBeenCalledTimes(2);
  });

  it('debería propagar el error si falla la creación', async () => {
    // Arrange
    const error = new Error('Error al crear usuario');
    mockUserRepository.create.mockRejectedValueOnce(error);

    const userData = {
      user: {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      },
      profiles: [1],
    };

    // Act & Assert
    await expect(useCase.start(userData)).rejects.toThrow('Error al crear usuario');

    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockLogProvider.error).toHaveBeenCalled();
  });
});
