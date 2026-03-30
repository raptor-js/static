import type { Middleware } from "@raptor/types";

import type { Config } from "./config.ts";
import StaticHandler from "./static-handler.ts";

export default function staticHandler(config?: Config): Middleware {
  const instance = new StaticHandler(config);

  return instance.handle;
}
