import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { VehicleType } from '../../../generated/prisma/enums';

export class CreateVehicleDto {
  @IsOptional()
  @IsString()
  licenPlate?: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(0)
  kmAct!: number;

  @IsEnum(VehicleType)
  type!: VehicleType;
}
