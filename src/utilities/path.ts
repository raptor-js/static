/**
 * Normalize a path.
 *
 * @param path The path to normalize.
 * @returns A normalized path string.
 */
export function normalize(path: string): string {
  return path
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\.\.\//g, "");
}

/**
 * Join a set of paths together.
 *
 * @param paths The paths to join together.
 * @returns The newly built path string.
 */
export function join(...paths: string[]): string {
  return paths.filter(Boolean).join("/").replace(/\/+/g, "/");
}
