import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const publicFolderPath = join(process.cwd(), "./public/img/avatars");

export const writeMovies = (movieList) => writeJSON(moviesJSONPath, movieList);

export const getMovieJSONReadableStream = () =>
  createReadStream(moviesJSONPath);
export const getPDFWritableStream = (filename) =>
  createReadStream(join(dataFolderPath, filename));
export const saveUsersAvatars = (fileName, contentAsABuffer) =>
  writeFile(join(publicFolderPath, fileName), contentAsABuffer);
