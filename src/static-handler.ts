import type { Context, Middleware } from "@raptor/kernel";

import type { Config } from "./config.ts";
import { join, normalize } from "./utilities/path.ts";
import { contentType } from "./utilities/content-type.ts";

/**
 * The static file handler middleware.
 */
export default class StaticHandler {
  /**
   * The path to the file.
   */
  private config?: Config;

  /**
   * Construct a new static handler middlware.
   *
   * @param config A configurable path for the handler.
   */
  constructor(config?: Config) {
    this.config = {
      ...this.initialiseDefaultConfig(),
      ...config,
    };
  }

  /**
   * Wrapper to pre-bind this to the static file handler method.
   */
  public get handle(): Middleware {
    return (context: Context, next: CallableFunction) => {
      return this.handleStaticFiles(context, next);
    };
  }

  /**
   * Handle static file requests.
   *
   * @param context The request context.
   * @param next The next middleware.
   * @returns The static file contents for the response.
   */
  public async handleStaticFiles(
    context: Context,
    next: CallableFunction,
  ): Promise<string | Uint8Array<ArrayBuffer> | Response> {
    const { pathname } = new URL(context.request.url);

    if (pathname === "/") {
      return next();
    }

    const sanitizedPath = normalize(pathname.replace(/^\/+/, ""));
    const filePath = join(
      Deno.cwd(),
      this.config?.staticFileDirectory!,
      sanitizedPath,
    );

    try {
      const stat = await Deno.stat(filePath);

      if (stat.isDirectory) {
        return next();
      }

      const file = await Deno.readFile(filePath);
      const ext = filePath.split(".").pop() || "";
      const type = contentType(ext);

      context.response.headers.set("Content-Type", type);

      const isTextBased = type.startsWith("text/") ||
        type === "image/svg+xml" ||
        type === "application/json" ||
        type === "application/xml";

      if (!isTextBased) {
        return file;
      }

      const decoder = new TextDecoder("utf-8");

      return decoder.decode(file);
    } catch {
      return next();
    }
  }

  /**
   * Get the configured kernel config.
   *
   * @returns The configured kernel config.
   */
  public getConfig(): Config {
    return this.config!;
  }

  /**
   * Initialise the middleware config.
   *
   * @returns An initialise set of config.
   */
  private initialiseDefaultConfig(): Config {
    return {
      staticFileDirectory: "public",
    };
  }
}
