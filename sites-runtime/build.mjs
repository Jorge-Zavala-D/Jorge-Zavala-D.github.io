import { copyFile, mkdir, rm } from "node:fs/promises";

const dist = new URL("./dist/", import.meta.url);
const server = new URL("./dist/server/", import.meta.url);

await rm(dist, { force: true, recursive: true });
await mkdir(server, { recursive: true });
await copyFile(new URL("./src/index.js", import.meta.url), new URL("./dist/server/index.js", import.meta.url));
