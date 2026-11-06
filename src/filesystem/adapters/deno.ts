import type { FilesystemAdapter } from "../adapter.ts";

/**
 * The Deno filesystem adapter.
 */
export default class DenoFilesystem implements FilesystemAdapter {
  /**
   * Returns the current working directory.
   *
   * @returns The current working directory.
   */
  public cwd(): string {
    // biome-ignore lint/suspicious/noExplicitAny: the runtime global has no types here
    return (globalThis as any).Deno.cwd();
  }

  /**
   * Returns file information for the given path.
   *
   * @param path The path to stat.
   * @returns File information.
   */
  public async stat(path: string): Promise<{ isDirectory: boolean }> {
    // biome-ignore lint/suspicious/noExplicitAny: the runtime global has no types here
    const stat = await (globalThis as any).Deno.stat(path);

    return { isDirectory: stat.isDirectory };
  }

  /**
   * Reads the file at the given path.
   *
   * @param path The path to read.
   * @returns The file contents as a Uint8Array.
   */
  public async readFile(path: string): Promise<Uint8Array<ArrayBuffer>> {
    // biome-ignore lint/suspicious/noExplicitAny: the runtime global has no types here
    return (globalThis as any).Deno.readFile(path);
  }
}
