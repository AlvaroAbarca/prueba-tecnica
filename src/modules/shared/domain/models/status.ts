import { nowISO } from '@modules/shared/infrastructure/utils/date.helper';
import { StatusResponse } from '../interface/statusResponse.interface';

export class Status {
  constructor(
    private readonly status: string,
    private readonly instanceId: string,
    private readonly instanceStartTime: Date,
    private readonly instanceUptime: string,
    private readonly dataBase: boolean,
    private readonly apiV2: boolean,
    private readonly time: string,
  ) {}

  static create(params: { dbAtBeginning: boolean; instanceId: string; instanceUpTime: number; dbStatus: boolean; apiV2Status: boolean }) {
    return new Status(
      params.dbAtBeginning ? 'OK' : 'ERROR',
      params.instanceId || 'unknown',
      new Date(Date.now() - params.instanceUpTime * 1000),
      params.instanceUpTime.toString(),
      params.dbStatus || false,
      params.apiV2Status || false,
      nowISO(),
    );
  }

  toResponse(): StatusResponse {
    return {
      status: this.status,
      services: {
        instanceId: this.instanceId,
        instanceStartTime: this.instanceStartTime,
        instanceUptime: this.instanceUptime,
        dataBase: this.dataBase,
        apiV2: this.apiV2,
      },
      time: this.time,
    };
  }
}
