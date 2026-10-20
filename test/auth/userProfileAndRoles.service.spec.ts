import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileAndRolesService } from '@modules/auth/application/services/userProfileAndRoles.service';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { UserProfileAndRolesRepository } from '@modules/users/domain/interfaces/userProfileAndRoles.interface';

describe('UserProfileAndRolesService', () => {
  let service: UserProfileAndRolesService;

  const mockUserRepository = {
    find: jest.fn(),
  };

  const mockProfileAndRolesRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileAndRolesService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: UserProfileAndRolesRepository,
          useValue: mockProfileAndRolesRepository,
        },
      ],
    }).compile();

    service = module.get(UserProfileAndRolesService);
    jest.clearAllMocks();
  });

  it('debería retornar los roles del usuario correctamente', async () => {
    // Arrange
    const mockUser = {
      getValues: () => ({ id: 1, email: 'test@test.com' }),
    };
    mockUserRepository.find.mockResolvedValueOnce(mockUser);
    mockProfileAndRolesRepository.find.mockResolvedValueOnce([
      { name: 'Admin', description: 'Administrator', roles: ['ROLE_ADMIN', 'ROLE_USER'] },
      { name: 'Editor', description: 'Editor', roles: ['ROLE_EDITOR', 'ROLE_USER'] },
    ]);

    // Act
    const result = await service.getUserRoles('test@test.com');

    // Assert
    expect(result).toEqual(expect.arrayContaining(['ROLE_ADMIN', 'ROLE_USER', 'ROLE_EDITOR']));
    expect(result).toHaveLength(3); // Sin duplicados gracias al Set
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(mockProfileAndRolesRepository.find).toHaveBeenCalledWith(1);
  });

  it('debería retornar arreglo vacío si el usuario no existe', async () => {
    // Arrange
    mockUserRepository.find.mockResolvedValueOnce(null);

    // Act
    const result = await service.getUserRoles('noexiste@test.com');

    // Assert
    expect(result).toEqual([]);
    expect(mockUserRepository.find).toHaveBeenCalledWith({ email: 'noexiste@test.com' });
    expect(mockProfileAndRolesRepository.find).not.toHaveBeenCalled();
  });

  it('debería retornar arreglo vacío si el usuario no tiene perfiles', async () => {
    // Arrange
    const mockUser = {
      getValues: () => ({ id: 2, email: 'user@test.com' }),
    };
    mockUserRepository.find.mockResolvedValueOnce(mockUser);
    mockProfileAndRolesRepository.find.mockResolvedValueOnce([]);

    // Act
    const result = await service.getUserRoles('user@test.com');

    // Assert
    expect(result).toEqual([]);
    expect(mockProfileAndRolesRepository.find).toHaveBeenCalledWith(2);
  });

  it('debería eliminar roles duplicados entre perfiles', async () => {
    // Arrange
    const mockUser = {
      getValues: () => ({ id: 3, email: 'dup@test.com' }),
    };
    mockUserRepository.find.mockResolvedValueOnce(mockUser);
    mockProfileAndRolesRepository.find.mockResolvedValueOnce([
      { name: 'Profile1', description: 'P1', roles: ['ROLE_A', 'ROLE_B'] },
      { name: 'Profile2', description: 'P2', roles: ['ROLE_B', 'ROLE_C'] },
      { name: 'Profile3', description: 'P3', roles: ['ROLE_A', 'ROLE_C'] },
    ]);

    // Act
    const result = await service.getUserRoles('dup@test.com');

    // Assert
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(['ROLE_A', 'ROLE_B', 'ROLE_C']));
  });

  it('debería propagar errores del repositorio', async () => {
    // Arrange
    mockUserRepository.find.mockRejectedValueOnce(new Error('DB error'));

    // Act & Assert
    await expect(service.getUserRoles('test@test.com')).rejects.toThrow('DB error');
  });
});
