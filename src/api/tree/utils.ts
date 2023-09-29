import { File, Folder, Play } from "lucide-react";

import { NodeSchemaType } from "./schema/node";

export const forceLeadingSlash = (path?: string) => {
  if (!path) {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
};

export const removeLeadingSlash = (path?: string) => {
  if (!path) {
    return "";
  }
  return path.startsWith("/") ? path.slice(1) : path;
};

export const removeTrailingSlash = (path?: string) => {
  if (!path) {
    return "";
  }
  return path.endsWith("/") ? path.slice(0, -1) : path;
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

export const sortByName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name);

export const sortByRef = (a: { ref: string }, b: { ref: string }): number =>
  a.ref.localeCompare(b.ref);

export const fileTypeToIcon = (type: NodeSchemaType["expandedType"]) => {
  switch (type) {
    case "directory":
      return Folder;
    case "workflow":
      return Play;
    default:
      return File;
  }
};
