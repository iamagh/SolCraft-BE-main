import { HttpStatus, HttpException } from '@nestjs/common';

export class Unauthorized extends HttpException {
  constructor(message: string, description?: any, error?: Error) {
    super(
      {
        message,
        description,
        isOperational: true,
        stack: error?.stack || new Error().stack,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
