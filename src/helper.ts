import type { Middleware } from "@raptor/kernel";

import StaticHandler from "./static-handler.ts";
import type { Config } from "./config.ts";

export default function staticHandler(config?: Config): Middleware {
  const instance = new StaticHandler(config);

  return instance.handle;
}
