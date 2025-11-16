import { getBaseUrl } from "./getBaseUrl";

export const getAbsoluteImgUrl = (path: string) => {
    return `${getBaseUrl()}/${path}`;
}