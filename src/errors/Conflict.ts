import { HttpException, HttpStatus } from '@nestjs/common';

export class Conflict extends HttpException {
  constructor(message: string, description?: any, error?: Error) {
    super(
      {
        message,
        description,
        isOperational: true,
        stack: error?.stack || new Error().stack,
      },
      HttpStatus.CONFLICT,
    );
  }
}
