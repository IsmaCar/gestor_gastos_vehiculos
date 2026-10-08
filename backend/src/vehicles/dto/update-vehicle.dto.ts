import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { VehicleType } from '../../../generated/prisma/enums';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  licenPlate?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  kmAct?: number;

  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;
}
