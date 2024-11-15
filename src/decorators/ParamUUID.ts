import { Param, ParseUUIDPipe } from '@nestjs/common';
import { pipeOptions } from '../utils/pipe-options';

export const ParamUUID = (paramName: string): ParameterDecorator => {
  return (target: Record<string, any>, key: string | symbol, index: number) => {
    Param(paramName, new ParseUUIDPipe(pipeOptions))(target, key, index);
  };
};
