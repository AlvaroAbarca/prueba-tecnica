import { PartialType } from '@nestjs/swagger';
import { UserCreateDTO } from './userCreate.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserEditDTO extends PartialType(UserCreateDTO) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
