import { Controller, Get } from '@nestjs/common';
import { StatusUseCase } from '../../application/useCases/status.useCase';
import { Public } from '@modules/shared/infrastructure/decorators/public.decorator';
import { EmitResponse } from '@modules/shared/infrastructure/dto/respuesta';

@Controller(['api'])
export class StatusController {
  constructor(private readonly StatusUseCase: StatusUseCase) {}

  @Public()
  @Get('status')
  async validate(): Promise<any> {
    const data = await this.StatusUseCase.start();
    return EmitResponse.ok('statuservice ok', data);
  }
}
