/**
 * Interface for filesystem operations across different runtimes.
 */
export interface FilesystemAdapter {
  /**
   * Returns the current working directory.
   */
  cwd(): string;

  /**
   * Returns file information for the given path.
   *
   * @param path The path to stat.
   */
  stat(path: string): Promise<{ isDirectory: boolean }>;

  /**
   * Reads the file at the given path.
   *
   * @param path The path to read.
   */
  readFile(path: string): Promise<Uint8Array<ArrayBuffer>>;
}
