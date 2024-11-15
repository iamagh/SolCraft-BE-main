import axios, { AxiosInstance, AxiosError } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

export function createAxiosInstance(): AxiosInstance {
  const instance = axios.create();

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const { response } = error;

      if (response) {
        const errorMessage =
          response.data &&
          typeof response.data === 'object' &&
          'message' in response.data
            ? response.data.message
            : 'Internal server error';

        throw new HttpException(errorMessage, response.status);
      } else {
        throw new HttpException(
          'Network error or server is unreachable',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    },
  );

  return instance;
}
