const MIME_TYPES: Record<string, string> = {
  // Text.
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  json: "application/json",
  xml: "application/xml",
  txt: "text/plain",
  md: "text/markdown",

  // Images.
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",

  // Fonts.
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",

  // Other.
  pdf: "application/pdf",
  zip: "application/zip",
  wasm: "application/wasm",
};

export function contentType(ext: string): string {
  return MIME_TYPES[ext.toLowerCase()] || "application/octet-stream";
}
