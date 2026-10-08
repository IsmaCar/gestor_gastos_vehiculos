import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * TODO (Scenario 1): create a vehicle for the authenticated user.
   * - Ignore any `userId` present in the DTO/body and use the one from the
   *   authenticated request instead.
   */
  async create(userId: number, createVehicleDto: CreateVehicleDto) {
    const { licenPlate, brand, model, kmAct, type} = createVehicleDto;
    try {
       return this.prisma.vehicle.create({
      data: { userId, licenPlate, brand, model, kmAct, type }
    })
    } catch (error) {
     if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('No se puedo crear el vehículo')
     }
     throw new ConflictException('Error inesperado al crear el vehículo') 
    }
  }

  /**
   * TODO: list vehicles belonging to the authenticated user.
   */
  async findAll(userId: number) {
    return this.prisma.vehicle.findMany({
      where: { userId },
    })
  }

  /**
   * TODO: fetch a single vehicle by id, scoped to the authenticated user.
   */
  async findOne(id: number, userId: number) {
    return this.prisma.vehicle.findFirst({
      where: { userId, id }
    })
  }

  /**
   * TODO (Scenario 3.2): reject the update with a BadRequestException when
   * `kmAct` is lower than the currently stored value.
   */
  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    throw new Error('Not implemented');
  }

  /**
   * TODO (Scenario 4.2): soft delete — deactivate the vehicle (set `active`
   * to false) instead of removing the row, so historical expenses survive.
   */
  async remove(id: number) {
    throw new Error('Not implemented');
  }
}
