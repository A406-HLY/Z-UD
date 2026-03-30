
export const mergeDotNotation = <T extends Record<string, any>>(
  obj: T,
  editsValues: Record<string, any>
): T => {
  const result = JSON.parse(JSON.stringify(obj)) as T;

  Object.entries(editsValues).forEach(([path, value]) => {
    const keys = path.split('.');
    let current: any = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        current[key] = value;
      } else {
        if (current[key] === undefined || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
      }
    }
  });

  return result;
};