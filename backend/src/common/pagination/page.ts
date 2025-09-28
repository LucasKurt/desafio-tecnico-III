import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPage<T>(items: T[], total: number, page: number, pageSize: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

class PaginatedBaseDto {
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() hasNext: boolean;
  @ApiProperty() hasPrev: boolean;
}

type ClassConstructor<T> = abstract new (...args: unknown[]) => T;

export function PaginatedDto<T>(model: ClassConstructor<T>) {
  @ApiExtraModels(model)
  class PaginatedOfModel extends PaginatedBaseDto {
    @ApiProperty({ type: 'array', items: { $ref: getSchemaPath(model) } })
    items!: T[];
  }
  return PaginatedOfModel;
}
