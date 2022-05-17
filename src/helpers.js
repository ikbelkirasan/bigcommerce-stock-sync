import filedirname from "filedirname";

export const getCurrentDir = () => {
  const [, __dirname] = filedirname(import.meta.url);
  return __dirname;
};

export const debug = (...args) => {
  if (process.env.NODE_ENV?.startsWith("test")) {
    return;
  }
  return console.debug(...args);
};
