import { Test, TestingModule } from '@nestjs/testing';
import { StatusUseCase } from '@modules/status/application/useCases/status.useCase';
import { ConfigModule } from '@nestjs/config';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { StatusService } from '@modules/shared/infrastructure/services/status.service';
import { CheckConnection } from '@modules/shared/domain/interface/checkConnection.interface';

describe('StatusUseCase', () => {
  let useCase: StatusUseCase;

  // Mock del StatusService con el método correcto
  const mockStatusService = {
    getStatusService: jest.fn().mockResolvedValue({
      code: 200,
      data: {
        serverTimeUTC: new Date().toISOString(),
        serviceStatus: 'OK',
        instanceDeploy: 'ALEJANDRO',
        instanceUpTime: '00d 00h 02m 02s',
        instanceId: '[19512]',
        instanceStartTimeUTC: new Date().toISOString(),
        dataBaseStatus: true,
        dataBaseName: 'postgres',
      },
      message: 'statuservice ok',
    }),
  };

  // Mock actualizado de CheckConnection
  const mockCheckConnection = {
    check: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true), // Agregamos este método
  };

  // Mock simple para LogProvider
  const mockLogProvider = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        StatusUseCase,
        { provide: StatusService, useValue: mockStatusService },
        { provide: CheckConnection, useValue: mockCheckConnection },
        { provide: LogProvider, useValue: mockLogProvider },
      ],
    }).compile();

    useCase = module.get<StatusUseCase>(StatusUseCase);
  });

  it('debería devolver el status del servicio', async () => {
    // Arrange
    mockStatusService.getStatusService.mockClear();
    mockCheckConnection.isInitialized.mockClear();

    // Act
    const result = await useCase.start();

    // Assert
    expect(result).toHaveProperty('code', 200);
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('serviceStatus', 'OK');
    expect(mockStatusService.getStatusService).toHaveBeenCalled();
    expect(mockCheckConnection.isInitialized).toHaveBeenCalled();
  });
});
