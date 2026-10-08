import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';

@Controller('vehicle')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('create')
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiclesService.create(user.id, createVehicleDto);
  }

  // TODO: scope results to the authenticated user (use @CurrentUser()).
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.vehiclesService.findAll(user.id)
  }

  // TODO: scope lookup to the authenticated user (use @CurrentUser()).
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number,
          @CurrentUser() user :AuthenticatedUser,
  ) {
    return this.vehiclesService.findOne(id, user.id)
   }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    throw new Error('Not implemented');
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    throw new Error('Not implemented');
  }
}
