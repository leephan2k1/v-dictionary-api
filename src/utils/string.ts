export const normalizeString = (str: string) => {
  const htmlTagsRegex = /(&nbsp;|<([^>]+)>)/g;
  return str
    .trim()
    .replace(/(\r\n|\n|\r|\")/gm, "")
    .replace(htmlTagsRegex, "");
};
