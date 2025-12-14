export const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'; // 또는 value;
  }

  return Number(value).toLocaleString('ko-KR');
};
