export const ellipsize = (str: string, len: number) => (str.length > len ? `${str.slice(0, len - 1)}…` : str);

export const basename = (path: string) => {
    const lastSlash = path.lastIndexOf("/");
    const lastDot = path.lastIndexOf(".");
    return path.slice(lastSlash + 1, lastDot > lastSlash ? lastDot : undefined);
};
