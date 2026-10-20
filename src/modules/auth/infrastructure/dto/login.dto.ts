import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'usuario@correos.cl' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  emailuser: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'MiPassword123!', maxLength: 256 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password: string;

  @ApiProperty({ description: 'Proveedor de autenticación', example: 'internal', required: false, default: 'internal', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  provider?: string;

  @ApiProperty({ description: 'Token externo (requerido para proveedores externos como SSO)', example: 'eyJhbGciOiJSUzI1NiJ9...', required: false })
  @IsString()
  @IsOptional()
  token?: string;
}
