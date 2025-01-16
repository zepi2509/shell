export const ellipsize = (str: string, len = 40) => (str.length > len ? `${str.slice(0, len - 1)}…` : str);
