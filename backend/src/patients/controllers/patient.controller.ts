import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedDto } from 'src/common/pagination/page';
import { PatientPageOptionsDto } from 'src/patients/dtos/patient-page-options.dto';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PatientResponseDto } from '../dtos/patient-response.dto';
import { PatientService } from '../services/patient.service';

@ApiTags('patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly service: PatientService) {}

  @Post()
  @ApiCreatedResponse({ type: PatientResponseDto })
  create(@Body() dto: CreatePatientDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: PaginatedDto(PatientResponseDto) })
  list(@Query() q: PatientPageOptionsDto) {
    return this.service.list(q);
  }
}
