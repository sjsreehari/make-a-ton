import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, _metadata?: ArgumentMetadata) {
    if (!this.schema) return value;
    try {
      return this.schema.parse(value);
    } catch (err: any) {
      if (err instanceof ZodError || err?.name === 'ZodError' || Array.isArray(err?.errors)) {
        throw new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: err.errors?.[0]?.message || 'Input validation failed',
          details: err.errors,
        });
      }
      throw err;
    }
  }
}

