import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserCreateDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(12)
  rut: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  order: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  visible: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enabled: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  comment: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  timeZoneCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  languageCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  authProvider: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  img?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enable2fa: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(5)
  iata?: string;

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  profiles?: number[];
}
