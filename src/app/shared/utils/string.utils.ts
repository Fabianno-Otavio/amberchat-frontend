export const getFirstLetters = (input: string): string => {
  const strings = input.split(' ');
  let initials = '';

  strings.map((s) => {
    initials += s[0];
  });

  if (initials.length < 2) {
    initials += strings[0][1] ?? '';
  }
  return initials.slice(0, 2).toUpperCase();
};
