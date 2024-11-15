import { InternalServerError } from '../errors/InternalServerError';
import { NodeEnv } from './enums/node-env.enum';

export function generateUserVerifyCode(length: number): string {
  const num1 = Number(`1${'0'.repeat(length - 1)}`);
  const num2 = Number(`9${'0'.repeat(length - 1)}`);
  return Math.floor(num1 + Math.random() * num2).toString();
}

export function setValueAtPath(obj, path, value) {
  console.log('setValueAtPath', { obj, path, value });
  const keys = path?.split('.');
  let current = obj;

  keys?.forEach((key, index) => {
    current[key] = current?.[key] || {};

    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current = current?.[key];
    }
  });
}

export function generateOrderPrice(flowState): number {
  if (process.env.NODE_ENV !== NodeEnv.PROD) {
    return 10;
  }
  const mandatoryPriceSum = flowState?.payable?.mandatoryPrices?.reduce(
    (acc, currentValue) => acc + currentValue?.value,
    0,
  );
  if (!mandatoryPriceSum) {
    throw new InternalServerError('mandatory_price_count_error');
  }

  const extraPricesSum = sumJsonValues(
    flowState?.json?.['allValues'],
    'extraPrice',
  );

  return mandatoryPriceSum + extraPricesSum;
}

function sumJsonValues(obj, key) {
  let sum = 0;

  function recursiveSum(obj) {
    for (const prop in obj) {
      if (typeof obj?.[prop] === 'object') {
        // If the property is an object, recursively call the function
        recursiveSum(obj?.[prop]);
      } else if (prop === key) {
        // If the property matches the provided key, add its value to the sum
        sum += obj?.[prop];
      }
    }
  }

  recursiveSum(obj);
  return sum;
}
