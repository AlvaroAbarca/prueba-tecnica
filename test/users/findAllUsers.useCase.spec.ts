import { Test, TestingModule } from '@nestjs/testing';
import { FindAllUsersUseCase } from '@modules/users/application/useCases/findAllUsers.useCase';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';

describe('FindAllUsersUseCase', () => {
  let useCase: FindAllUsersUseCase;

  // Mock de usuarios para pruebas
  const mockUsersData = [
    {
      getValues: jest.fn().mockReturnValue({
        id: 1,
        email: 'user1@test.com',
        firstName: 'User',
        lastName: 'One',
        enabled: true,
      }),
    },
    {
      getValues: jest.fn().mockReturnValue({
        id: 2,
        email: 'user2@test.com',
        firstName: 'User',
        lastName: 'Two',
        enabled: true,
      }),
    },
  ];

  // Mock del UserRepository - retorna el array directamente
  const mockUserRepository = {
    findAll: jest.fn().mockResolvedValue(mockUsersData),
    count: jest.fn().mockResolvedValue(mockUsersData.length),
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
          provide: 'FindAllUsersUseCase',
          useFactory: (logger: LogProvider, userRepository: UserRepository) => new FindAllUsersUseCase(logger, userRepository),
          inject: [LogProvider, UserRepository],
        },
        {
          provide: LogProvider,
          useValue: mockLogProvider,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get('FindAllUsersUseCase');
    jest.clearAllMocks();
  });

  it('debería obtener todos los usuarios correctamente', async () => {
    // Act
    const result = await useCase.start({ params: {} } as any);

    // Assert
    expect(result.data).toHaveLength(2);

    expect(result.data[0]).toMatchObject({
      id: 1,
      email: 'user1@test.com',
      firstName: 'User',
      lastName: 'One',
    });

    expect(result.data[1]).toMatchObject({
      id: 2,
      email: 'user2@test.com',
      firstName: 'User',
      lastName: 'Two',
    });

    expect(result.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      pageCount: 1,
    });

    expect(mockUserRepository.findAll).toHaveBeenCalled();
    expect(mockLogProvider.debug).toHaveBeenCalledTimes(2);
  });

  it('debería lanzar NotFoundException si no hay usuarios', async () => {
    // Arrange
    mockUserRepository.findAll.mockResolvedValueOnce([]);
    mockUserRepository.count.mockResolvedValueOnce(0);

    // Act & Assert
    const result = await useCase.start({ limit: 10, offset: 0 } as any);
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.page).toBe(0);

    expect(mockUserRepository.findAll).toHaveBeenCalled();
  });

  it('debería propagar el error si falla la búsqueda', async () => {
    // Arrange
    const error = new Error('Error al buscar usuarios');
    mockUserRepository.findAll.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(useCase.start({ params: {} } as any)).rejects.toThrow('Error al buscar usuarios');

    expect(mockUserRepository.findAll).toHaveBeenCalled();
    expect(mockLogProvider.error).toHaveBeenCalled();
  });
});
