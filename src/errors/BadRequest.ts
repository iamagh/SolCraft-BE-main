import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequest extends HttpException {
  constructor(message: string, description?: any, error?: Error) {
    super(
      {
        message,
        description,
        isOperational: true,
        stack: error?.stack || new Error().stack,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
