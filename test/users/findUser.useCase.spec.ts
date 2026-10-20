import { Test, TestingModule } from '@nestjs/testing';
import { FindUserUseCase } from '@modules/users/application/useCases/findUser.useCase';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { UserProfileRepository } from '@modules/users/domain/interfaces/userProfileRepository.interface';
import { NotFoundException } from '@modules/shared/domain/exceptions/classes/notFoundException';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';

describe('FindUserUseCase', () => {
  let useCase: FindUserUseCase;

  // Mock del UserRepository
  const mockUserRepository = {
    find: jest.fn(),
  };

  // Mock del UserProfileRepository
  const mockUserProfileRepository = {
    getProfilesWithRolesByUserId: jest.fn(),
  };

  // Mock del LogProvider
  const mockLogProvider = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: UserProfileRepository,
          useValue: mockUserProfileRepository,
        },
        {
          provide: LogProvider,
          useValue: mockLogProvider,
        },
      ],
    }).compile();

    useCase = module.get(FindUserUseCase);
    jest.clearAllMocks();
  });

  it('debería encontrar un usuario con sus perfiles', async () => {
    // Arrange
    const mockUser = {
      getValues: () => ({
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
      }),
    };

    const mockProfiles = [
      { id: 1, name: 'Profile 1', roles: ['ADMIN'] },
      { id: 2, name: 'Profile 2', roles: ['USER'] },
    ];

    const filter = { email: 'test@test.com' };

    mockUserRepository.find.mockResolvedValueOnce(mockUser);
    mockUserProfileRepository.getProfilesWithRolesByUserId.mockResolvedValueOnce(mockProfiles);

    // Act
    const result = await useCase.start(filter);

    // Assert
    expect(result).toEqual({
      id: 1,
      email: 'test@test.com',
      name: 'Test User',
      profiles: mockProfiles,
    });
    expect(mockUserRepository.find).toHaveBeenCalledWith(filter);
    expect(mockUserProfileRepository.getProfilesWithRolesByUserId).toHaveBeenCalledWith(1);
    expect(mockLogProvider.debug).toHaveBeenCalled();
  });

  it('debería lanzar NotFoundException si no encuentra el usuario', async () => {
    // Arrange
    const filter = { email: 'noexiste@test.com' };
    mockUserRepository.find.mockResolvedValueOnce(null);

    // Act & Assert
    await expect(useCase.start(filter)).rejects.toThrow(NotFoundException);

    expect(mockUserRepository.find).toHaveBeenCalledWith(filter);
    expect(mockUserProfileRepository.getProfilesWithRolesByUserId).not.toHaveBeenCalled();
    expect(mockLogProvider.error).toHaveBeenCalled();
  });

  it('debería propagar errores del repositorio', async () => {
    // Arrange
    const filter = { id: 1 };
    const error = new Error('Error de base de datos');
    mockUserRepository.find.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(useCase.start(filter)).rejects.toThrow(error);

    expect(mockUserRepository.find).toHaveBeenCalledWith(filter);
    expect(mockLogProvider.error).toHaveBeenCalled();
  });
});
