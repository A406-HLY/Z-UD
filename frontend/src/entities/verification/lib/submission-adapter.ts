
const setByPath = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let lastObj = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in lastObj) || lastObj[key] === null || typeof lastObj[key] !== 'object') {
      lastObj[key] = {};
    }
    lastObj = lastObj[key];
  }
  lastObj[keys[keys.length - 1]] = value;
};

export const prepareFinalPayload = <T extends object>(
  originalData: T,
  editedValues: Record<string, any>
): T => {
  const result = structuredClone(originalData);

  Object.entries(editedValues).forEach(([path, value]) => {
    setByPath(result, path, value);
  });

  return result;
};