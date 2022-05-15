import filedirname from "filedirname";

export const getCurrentDir = () => {
  const [, __dirname] = filedirname(import.meta.url);
  return __dirname;
};
