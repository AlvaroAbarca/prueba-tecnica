import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from '@modules/users/application/useCases/deleteUser.useCase';
import { UserProfileRepository } from '@modules/users/domain/interfaces/userProfileRepository.interface';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { ValidationException } from '@modules/shared/domain/exceptions/classes';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;

  // Mock del UserRepository
  const mockUserRepository = {
    find: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  // Mock del UserProfileRepository
  const mockUserProfileRepository = {
    deleteProfilesByUserId: jest.fn().mockResolvedValue(undefined),
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
          provide: 'DeleteUserUseCase',
          useFactory: (logger: LogProvider, userRepository: UserRepository, userProfileRepository: UserProfileRepository) =>
            new DeleteUserUseCase(logger, userRepository, userProfileRepository),
          inject: [LogProvider, UserRepository, UserProfileRepository],
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
          provide: UserProfileRepository,
          useValue: mockUserProfileRepository,
        },
      ],
    }).compile();

    useCase = module.get('DeleteUserUseCase');
    jest.clearAllMocks();
    mockUserRepository.find.mockResolvedValue({
      getValues: () => ({ id: 999 }),
    });
  });

  it('debería eliminar un usuario correctamente', async () => {
    // Arrange
    const userId = 1;

    // Act
    await useCase.start({ ids: [userId], user: 'test@correos.cl' });

    // Assert
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@correos.cl' });
    expect(mockUserRepository.delete).toHaveBeenCalledWith([1]);
    expect(mockUserProfileRepository.deleteProfilesByUserId).toHaveBeenCalledWith(1);
    expect(mockLogProvider.debug).toHaveBeenCalledTimes(2);
  });

  it('debería lanzar ValidationException si el array de IDs está vacío', async () => {
    // Act & Assert
    await expect(useCase.start({ ids: [], user: 'test@correos.cl' })).rejects.toThrow('No IDs provided for deletion');

    expect(mockUserRepository.find).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
    expect(mockUserProfileRepository.deleteProfilesByUserId).not.toHaveBeenCalled();
  });

  it('debería lanzar ValidationException si no se envía usuario autenticado', async () => {
    await expect(useCase.start({ ids: [1], user: '' })).rejects.toThrow('No user provided');

    expect(mockUserRepository.find).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('debería lanzar ValidationException si el usuario autenticado no existe', async () => {
    mockUserRepository.find.mockResolvedValueOnce(null);

    await expect(useCase.start({ ids: [1], user: 'missing@correos.cl' })).rejects.toThrow('User not found');

    expect(mockUserRepository.delete).not.toHaveBeenCalled();
    expect(mockUserProfileRepository.deleteProfilesByUserId).not.toHaveBeenCalled();
  });

  it('debería lanzar ValidationException al intentar eliminar al usuario autenticado', async () => {
    mockUserRepository.find.mockResolvedValueOnce({
      getValues: () => ({ id: 1 }),
    });

    await expect(useCase.start({ ids: [1], user: 'self@correos.cl' })).rejects.toThrow('Cannot delete the authenticated user');

    expect(mockUserRepository.delete).not.toHaveBeenCalled();
    expect(mockUserProfileRepository.deleteProfilesByUserId).not.toHaveBeenCalled();
  });

  it('debería propagar el error si falla la eliminación', async () => {
    // Arrange
    const error = new Error('Error al eliminar usuario');
    mockUserRepository.delete.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(useCase.start({ ids: [1], user: 'test@correos.cl' })).rejects.toThrow('Error al eliminar usuario');

    expect(mockUserRepository.delete).toHaveBeenCalledWith([1]);
    expect(mockUserProfileRepository.deleteProfilesByUserId).not.toHaveBeenCalled();
  });
});
