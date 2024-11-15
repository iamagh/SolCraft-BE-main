import {
  HttpStatus,
  ParseUUIDPipeOptions,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';
import { BadRequest } from '../errors/BadRequest';

export const pipeOptions: ParseUUIDPipeOptions = {
  version: '4', // Specify the UUID version if needed
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  // Custom HTTP status code for errors
  exceptionFactory: (errors: string) => {
    // Custom exception handling logic
    // You can throw a custom exception or return a specific value
    throw new BadRequest('validation_error', errors);
  },
};

export const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    throw new BadRequest(
      'validation_error',
      errors.reduce(
        (accumulator, currentValue) => ({
          ...accumulator,
          [currentValue.property]: Object.values(currentValue.constraints).join(
            ', ',
          ),
        }),
        {},
      ),
    );
  },
};
