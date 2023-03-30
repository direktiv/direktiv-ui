import { NodeSchemaType } from "./schema";

export const forceSlashIfPath = (path?: string) => {
  if (!path) {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
};

export const removeSlashIfPath = (path?: string) => {
  if (!path) {
    return "";
  }
  return path.startsWith("/") ? path.slice(1) : path;
};

export const sortFoldersFirst = (
  a: NodeSchemaType,
  b: NodeSchemaType
): number => {
  if (a.type === "directory" && b.type !== "directory") {
    return -1;
  }

  if (b.type === "directory" && a.type !== "directory") {
    return 1;
  }

  return a.name.localeCompare(b.name);
};
