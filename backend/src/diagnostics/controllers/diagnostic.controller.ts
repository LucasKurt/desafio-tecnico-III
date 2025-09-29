import { Body, Controller, Get, Headers, Post, Query, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DiagnosticService } from '../services/diagnostic.service';
import { DiagnosticResponseDto } from '../dtos/diagnostic-response.dto';
import { CreateDiagnosticDto } from '../dtos/create-diagnostic.dto';
import type { Response } from 'express';
import { PageOptionsDto, PaginatedDto } from 'src/common/pagination/page';

@ApiTags('diagnostics')
@Controller('diagnostics')
export class DiagnosticController {
  constructor(private readonly service: DiagnosticService) {}

  @Post()
  @ApiCreatedResponse({ type: DiagnosticResponseDto, description: 'Criado' })
  @ApiOkResponse({ type: DiagnosticResponseDto, description: 'Retry idempotente' })
  async create(
    @Res({ passthrough: true }) res: Response,
    @Headers('Idempotency-Key') idempotencyKey: string,
    @Body() dto: CreateDiagnosticDto,
  ) {
    const { created, body } = await this.service.create(idempotencyKey, dto);
    res.status(created ? 201 : 200);
    return body;
  }

  @Get()
  @ApiOkResponse({ type: PaginatedDto(DiagnosticResponseDto) })
  list(@Query() q: PageOptionsDto) {
    return this.service.list(q);
  }
}
