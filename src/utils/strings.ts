export const basename = (path: string, stripExt = true) => {
    const lastSlash = path.lastIndexOf("/");
    const lastDot = path.lastIndexOf(".");
    return path.slice(lastSlash + 1, stripExt && lastDot > lastSlash ? lastDot : undefined);
};

export const pathToFileName = (path: string, ext?: string) => {
    const start = /[a-z]+:\/\//.test(path) ? 0 : path.indexOf("/") + 1;
    const dir = path.slice(start, path.lastIndexOf("/")).replaceAll("/", "-");
    return `${dir}-${basename(path, ext !== undefined)}${ext ? `.${ext}` : ""}`;
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
