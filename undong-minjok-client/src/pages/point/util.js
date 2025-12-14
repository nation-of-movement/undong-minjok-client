export const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const number = Number(
    String(value).replace(/[^0-9]/g, '')
  );

  if (isNaN(number)) return '';

  return number.toLocaleString('ko-KR');
};
