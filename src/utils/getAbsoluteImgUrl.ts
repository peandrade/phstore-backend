import { getBaseUrl } from "@/utils/getBaseUrl";

export const getAbsoluteImgUrl = (path: string) => {
  return `${getBaseUrl()}/${path}`;
};
