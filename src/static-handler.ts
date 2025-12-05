import type { Context } from "@raptor/framework";
import { join, normalize } from "./utilities/path.ts";
import { contentType } from "./utilities/content-type.ts";

export default class StaticHandler {
  private path: string;

  constructor() {
    this.path = "public";
  }

  public async handler(
    context: Context,
    next: CallableFunction,
  ): Promise<string | Uint8Array<ArrayBuffer> | Response> {
    const { pathname } = new URL(context.request.url);

    if (pathname === "/") return next();

    const sanitizedPath = normalize(pathname.replace(/^\/+/, ""));
    const filePath = join(Deno.cwd(), this.path, sanitizedPath);

    try {
      const stat = await Deno.stat(filePath);

      if (stat.isDirectory) return next();

      const file = await Deno.readFile(filePath);
      const ext = filePath.split(".").pop() || "";
      const type = contentType(ext);

      context.response.headers.set("Content-Type", type);

      if (!type.startsWith("text/") && type !== "image/svg+xml") {
        return file;
      }

      const decoder = new TextDecoder("utf-8");
      return decoder.decode(file);
    } catch {
      return next();
    }
  }
}
