import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Acme Study 2026-01' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ required: false, example: 'Short description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
