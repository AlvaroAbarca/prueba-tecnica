import { Test, TestingModule } from '@nestjs/testing';
import { EditUserUseCase } from '@modules/users/application/useCases/editUser.useCase';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { BusinessException, ValidationException } from '@modules/shared/domain/exceptions/classes';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { CipherService } from '@modules/shared/domain/interface/cipherService.interface';

describe('EditUserUseCase', () => {
  let useCase: EditUserUseCase;
  const existingUser = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
  };

  const mockUserRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockCipherService = {
    generateBcrypt: jest.fn(),
  };

  const mockLogProvider = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUserRepository.find.mockResolvedValue({
      getValues: () => existingUser,
    });
    mockUserRepository.update.mockImplementation(async (_email: string, userData: Record<string, unknown>) => ({
      getValues: () => ({
        ...existingUser,
        ...userData,
      }),
    }));
    mockCipherService.generateBcrypt.mockResolvedValue('encrypted-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditUserUseCase,
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

    useCase = module.get(EditUserUseCase);
  });

  it('debería editar un usuario correctamente cuando cambia el email', async () => {
    const userData = {
      id: 1,
      firstName: 'Test Updated',
      lastName: 'User Updated',
      email: 'test.updated@test.com',
    };

    const result = await useCase.start(userData, [2, 3]);

    expect(result.getValues()).toEqual(
      expect.objectContaining({
        id: 1,
        email: 'test.updated@test.com',
        firstName: 'Test Updated',
        lastName: 'User Updated',
      }),
    );

    expect(mockUserRepository.find).toHaveBeenCalledWith({ id: 1 });
    expect(mockUserRepository.update).toHaveBeenCalledWith('test@test.com', userData, [2, 3]);
    expect(mockLogProvider.debug).toHaveBeenCalledTimes(2);
  });

  it('debería lanzar ValidationException si el ID está vacío', async () => {
    const userData = {
      id: null,
      firstName: 'Test',
      lastName: 'User',
    };

    await expect(useCase.start(userData)).rejects.toThrow(new ValidationException('ID empty'));

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('debería lanzar ValidationException si el email no cumple reglas de dominio', async () => {
    await expect(useCase.start({ id: 1, email: 'a@b.cl' })).rejects.toThrow(ValidationException);

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('debería lanzar BusinessException cuando el usuario no existe', async () => {
    mockUserRepository.find.mockResolvedValueOnce(null);

    await expect(useCase.start({ id: 1, email: 'missing@test.com' })).rejects.toThrow(new BusinessException('User not found'));

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('debería encriptar la password y resetear flags de sesión cuando se informa password', async () => {
    await useCase.start({ id: 1, password: 'password123' });

    expect(mockCipherService.generateBcrypt).toHaveBeenCalledWith('password123');
    expect(mockUserRepository.update).toHaveBeenCalledWith(
      'test@test.com',
      expect.objectContaining({
        id: 1,
        password: 'encrypted-password',
        failedLoginAttempts: 0,
        logout: true,
      }),
      undefined,
    );
  });

  it('debería propagar el error si falla la actualización', async () => {
    const error = new Error('Error al actualizar usuario');
    mockUserRepository.update.mockRejectedValueOnce(error);

    const userData = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
    };

    await expect(useCase.start(userData)).rejects.toThrow('Error al actualizar usuario');

    expect(mockUserRepository.update).toHaveBeenCalled();
    expect(mockLogProvider.error).toHaveBeenCalled();
  });
});
