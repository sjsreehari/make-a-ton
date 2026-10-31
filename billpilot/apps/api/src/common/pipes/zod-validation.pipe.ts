import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, _metadata?: ArgumentMetadata) {
    if (!this.schema) return value;
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: 'Input validation failed',
          details: err.errors,
        });
      }
      throw err;
    }
  }
}
