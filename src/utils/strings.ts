export const ellipsize = (str: string, len: number) => (str.length > len ? `${str.slice(0, len - 1)}…` : str);

export const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
