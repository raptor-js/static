import type { FilesystemAdapter } from "./adapter.ts";

import BunFilesystem from "./adapters/bun.ts";
import NodeFilesystem from "./adapters/node.ts";
import DenoFilesystem from "./adapters/deno.ts";

/**
 * Manages filesystem operations across different runtimes.
 */
export default class FilesystemManager {
  private adapters: Map<string, FilesystemAdapter> = new Map();

  constructor() {
    this.adapters.set("deno", new DenoFilesystem());
    this.adapters.set("bun", new BunFilesystem());
    this.adapters.set("node", new NodeFilesystem());
  }

  /**
   * Returns the filesystem adapter for the current runtime.
   *
   * @returns The filesystem adapter.
   */
  public getAdapter(): FilesystemAdapter {
    return this.adapters.get(this.getRuntime())!;
  }

  /**
   * Detect the runtime and return the correct adapter name.
   *
   * @returns The name of the adapter to use.
   */
  protected getRuntime(): string {
    // deno-lint-ignore no-explicit-any
    const Deno = (globalThis as any).Deno;

    // deno-lint-ignore no-explicit-any
    const Bun = (globalThis as any).Bun;

    if (typeof Deno !== "undefined") {
      return "deno";
    }

    if (typeof Bun !== "undefined") {
      return "bun";
    }

    return "node";
  }
}
