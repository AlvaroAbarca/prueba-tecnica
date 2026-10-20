import { nowISO } from '@modules/shared/infrastructure/utils/date.helper';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'node:os';
import * as fs from 'node:fs';

@Injectable()
export class StatusService {
  private readonly nodeEnv: string;

  constructor(private readonly configService: ConfigService) {
    this.nodeEnv = this.configService.get<string>('NODE_ENV');
  }

  private getContainerStats(): string {
    const toGB = (b: number) => (b / 1024 ** 3).toFixed(1);

    const [load1] = os.loadavg();
    const cpuPct = Math.min(Math.round((load1 / os.cpus().length) * 100), 100);

    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const memPct = Math.round((usedMem / totalMem) * 100);

    try {
      const disk = fs.statfsSync('/');
      const diskTotal = disk.blocks * disk.bsize;
      const diskUsed = (disk.blocks - disk.bfree) * disk.bsize;
      const diskPct = Math.round((diskUsed / diskTotal) * 100);
      return `cpu=${cpuPct}% | mem=${memPct}% (${toGB(usedMem)}/${toGB(totalMem)}GB) | disk=${diskPct}% (${toGB(diskUsed)}/${toGB(diskTotal)}GB)`;
    } catch {
      return `cpu=${cpuPct}% | mem=${memPct}% (${toGB(usedMem)}/${toGB(totalMem)}GB) | disk=N/A`;
    }
  }

  async getStatusService(statusBD: boolean, poolStats?: string): Promise<any> {
    return {
      serverTimeUTC: nowISO(),
      serviceStatus: 'OK',
      instanceDeploy: this.nodeEnv || 'UNDEFINED',
      instanceUpTime: (() => {
        const totalSeconds = Math.floor(process.uptime());
        const days = Math.floor(totalSeconds / 86400);
        const remainingSeconds = totalSeconds % 86400;
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      })(),
      instanceId: `[${process.pid}]`,
      instanceStartTimeUTC: new Date(Date.now() - process.uptime() * 1000),
      dataBaseStatus: statusBD,
      dataBaseName: process.env.BD_SCHEMA || 'N/A',
      dataBaseConnectionPool: poolStats ?? null,
      container: this.getContainerStats(),
    };
  }
}
