import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsArray, IsBooleanString } from 'class-validator';

const normalizeArrayValue = ({ value }: { value: unknown }): unknown[] | undefined => {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
};

export class FindAllUsersQueryDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  rut?: string;

  @IsOptional()
  @Transform(normalizeArrayValue)
  @IsArray()
  @IsEmail({}, { each: true })
  email?: string[];

  @IsOptional()
  @Transform(normalizeArrayValue)
  @IsArray()
  @IsString({ each: true })
  firstName?: string[];

  @IsOptional()
  @Transform(normalizeArrayValue)
  @IsArray()
  @IsString({ each: true })
  lastName?: string[];

  @IsOptional()
  @IsString()
  authProvider?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enable2fa?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  orderType?: 'asc' | 'desc' | 'none';

  @IsOptional()
  @IsString()
  search?: string;

  @IsBooleanString()
  @IsOptional()
  enabled?: string;
}
