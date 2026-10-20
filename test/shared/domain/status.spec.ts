import { Status } from '@modules/shared/domain/models/status';

describe('Status', () => {
  const baseParams = {
    dbAtBeginning: true,
    instanceId: 'instance-001',
    instanceUpTime: 3600,
    dbStatus: true,
    apiV2Status: true,
  };

  describe('create', () => {
    it('should create a Status instance', () => {
      const status = Status.create(baseParams);
      expect(status).toBeInstanceOf(Status);
    });

    it('should set status to OK when dbAtBeginning is true', () => {
      const status = Status.create({ ...baseParams, dbAtBeginning: true });
      const response = status.toResponse();
      expect(response.status).toBe('OK');
    });

    it('should set status to ERROR when dbAtBeginning is false', () => {
      const status = Status.create({ ...baseParams, dbAtBeginning: false });
      const response = status.toResponse();
      expect(response.status).toBe('ERROR');
    });

    it('should use instanceId from params', () => {
      const status = Status.create({ ...baseParams, instanceId: 'my-instance' });
      const response = status.toResponse();
      expect(response.services.instanceId).toBe('my-instance');
    });

    it('should use "unknown" as instanceId when not provided', () => {
      const status = Status.create({ ...baseParams, instanceId: '' });
      const response = status.toResponse();
      expect(response.services.instanceId).toBe('unknown');
    });

    it('should set dataBase from dbStatus', () => {
      const status = Status.create({ ...baseParams, dbStatus: false });
      const response = status.toResponse();
      expect(response.services.dataBase).toBe(false);
    });

    it('should set apiV2 from apiV2Status', () => {
      const status = Status.create({ ...baseParams, apiV2Status: false });
      const response = status.toResponse();
      expect(response.services.apiV2).toBe(false);
    });

    it('should include instanceUptime as string', () => {
      const status = Status.create({ ...baseParams, instanceUpTime: 1800 });
      const response = status.toResponse();
      expect(response.services.instanceUptime).toBe('1800');
    });
  });

  describe('toResponse', () => {
    it('should return a valid StatusResponse shape', () => {
      const response = Status.create(baseParams).toResponse();
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('services');
      expect(response).toHaveProperty('time');
      expect(response.services).toHaveProperty('instanceId');
      expect(response.services).toHaveProperty('instanceStartTime');
      expect(response.services).toHaveProperty('instanceUptime');
      expect(response.services).toHaveProperty('dataBase');
      expect(response.services).toHaveProperty('apiV2');
    });

    it('should return time as ISO string', () => {
      const response = Status.create(baseParams).toResponse();
      expect(response.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
