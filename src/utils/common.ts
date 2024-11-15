export function lowercaseFirstLetter(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function isDateExpired(date: Date, expiresInMin: number) {
  console.log(new Date(date), new Date());
  return Date.now() > expiresInMin * 60 * 1000 + new Date(date).getTime();
}

type NestedObject = Record<string, any>;

export function flattenObject(
  obj: NestedObject,
  parentKey = '',
): Record<string, any> {
  let result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(obj[key])) {
        // Convert array to comma-separated string
        result[currentKey] = obj[key].join(', ');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively flatten nested objects
        const nestedFlatten = flattenObject(obj[key], currentKey);
        result = { ...result, ...nestedFlatten };
      } else {
        // Assign the flattened key-value pair
        result[currentKey] = obj[key];
      }
    }
  }

  return result;
}
