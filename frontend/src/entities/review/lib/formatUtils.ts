

export const formatValueForUI = (value: unknown): string | number => {
  if (value === null || value === undefined) {
    return '정보 없음';
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? value.map((item) => formatValueForUI(item)).join(', ')
      : '항목 없음';
  }

  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value);

    const validValues = values.filter(v => v !== null && v !== undefined && v !== '');

    return validValues.length > 0
      ? validValues.map((val) => formatValueForUI(val)).join(' / ')
      : '정보 없음';
  }

  if (typeof value === 'boolean') {
    return value ? '예' : '아니오';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return String(value);
};