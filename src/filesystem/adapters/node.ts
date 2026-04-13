// deno-lint-ignore-file no-process-global
import type { FilesystemAdapter } from "../adapter.ts";

/**
 * The Node filesystem adapter.
 */
export default class NodeFilesystem implements FilesystemAdapter {
  /**
   * Returns the current working directory.
   *
   * @returns The current working directory.
   */
  public cwd(): string {
    return process.cwd();
  }

  /**
   * Returns file information for the given path.
   *
   * @param path The path to stat.
   * @returns File information.
   */
  public async stat(path: string): Promise<{ isDirectory: boolean }> {
    const { stat } = await import("node:fs/promises");

    const s = await stat(path);

    return { isDirectory: s.isDirectory() };
  }

  /**
   * Reads the file at the given path.
   *
   * @param path The path to read.
   * @returns The file contents as a Uint8Array.
   */
  public async readFile(path: string): Promise<Uint8Array<ArrayBuffer>> {
    const { readFile } = await import("node:fs/promises");

    return readFile(path) as Promise<Uint8Array<ArrayBuffer>>;
  }
}
