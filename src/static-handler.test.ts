import type { Context } from "@raptor-js/types";
import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";

import StaticHandler from "../src/static-handler.ts";

const createMockContext = (url: string): Context => {
  return {
    request: {
      url: url,
      method: "GET",
      headers: new Headers(),
    },
    response: {
      headers: new Headers(),
      status: 200,
    },
  } as Context;
};

const createMockNext = () => {
  let called = false;

  const next = () => {
    called = true;

    return "next-called";
  };

  next.wasCalled = () => called;

  return next;
};

describe("static handler", () => {
  const testDir = "./test-static-files";

  let handler: StaticHandler;

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });

    await writeFile(`${testDir}/index.html`, "<html><body>Hello</body></html>");
    await writeFile(`${testDir}/style.css`, "body { margin: 0; }");
    await writeFile(`${testDir}/script.js`, "console.log('test');");
    await writeFile(`${testDir}/data.json`, '{"key": "value"}');
    await writeFile(`${testDir}/document.txt`, "Plain text content");
    await writeFile(`${testDir}/readme.md`, "# Markdown");
    await writeFile(`${testDir}/image.svg`, "<svg></svg>");

    const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    await writeFile(`${testDir}/image.png`, pngHeader);

    await mkdir(`${testDir}/subdir`, { recursive: true });
    await writeFile(`${testDir}/subdir/nested.html`, "<html>Nested</html>");

    handler = new StaticHandler({ directory: testDir });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true });
  });

  describe("constructor", () => {
    it("should use default path when no path provided", () => {
      const defaultHandler = new StaticHandler();

      assert.deepStrictEqual(defaultHandler.getConfig()["directory"], "public");
    });

    it("should use provided path", () => {
      const customHandler = new StaticHandler({
        directory: "custom-path",
      });

      assert.deepStrictEqual(
        customHandler.getConfig()["directory"],
        "custom-path",
      );
    });
  });

  describe("handle method", () => {
    it("should call next() for root path", async () => {
      const context = createMockContext("http://localhost:3000/");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(result, "next-called");
      assert.deepStrictEqual(next.wasCalled(), true);
    });

    it("should call next() for non-existent files", async () => {
      const context = createMockContext(
        "http://localhost:3000/nonexistent.html",
      );
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(result, "next-called");
      assert.deepStrictEqual(next.wasCalled(), true);
    });

    it("should call next() for directory paths", async () => {
      const context = createMockContext("http://localhost:3000/subdir");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(result, "next-called");
      assert.deepStrictEqual(next.wasCalled(), true);
    });

    it("should serve HTML file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/index.html");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "<html><body>Hello</body></html>");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "text/html",
      );
      assert.deepStrictEqual(next.wasCalled(), false);
    });

    it("should serve CSS file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/style.css");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "body { margin: 0; }");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "text/css",
      );
    });

    it("should serve JavaScript file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/script.js");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "console.log('test');");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "text/javascript",
      );
    });

    it("should serve JSON file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/data.json");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, '{"key": "value"}');
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "application/json",
      );
    });

    it("should serve plain text file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/document.txt");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "Plain text content");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "text/plain",
      );
    });

    it("should serve markdown file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/readme.md");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "# Markdown");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "text/markdown",
      );
    });

    it("should serve SVG as text with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/image.svg");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "<svg></svg>");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "image/svg+xml",
      );
    });

    it("should serve PNG as binary with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/image.png");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.ok(result instanceof Response);
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "image/png",
      );
      assert.deepStrictEqual(next.wasCalled(), false);
    });

    it("should serve nested files", async () => {
      const context = createMockContext(
        "http://localhost:3000/subdir/nested.html",
      );
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "<html>Nested</html>");
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "text/html",
      );
    });

    it("should handle paths with leading slashes", async () => {
      const context = createMockContext("http://localhost:3000///index.html");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.deepStrictEqual(typeof result, "string");
      assert.deepStrictEqual(result, "<html><body>Hello</body></html>");
    });

    it("should handle files without extension", async () => {
      await writeFile(`${testDir}/noext`, "No extension file");

      const context = createMockContext("http://localhost:3000/noext");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.ok(result instanceof Uint8Array);
      const decoder = new TextDecoder("utf-8");
      assert.deepStrictEqual(
        decoder.decode(result as Uint8Array),
        "No extension file",
      );
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "application/octet-stream",
      );
    });

    it("should handle unknown file extensions", async () => {
      await writeFile(`${testDir}/file.xyz`, "Unknown extension");

      const context = createMockContext("http://localhost:3000/file.xyz");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assert.ok(result instanceof Uint8Array);
      const decoder = new TextDecoder("utf-8");
      assert.deepStrictEqual(
        decoder.decode(result as Uint8Array),
        "Unknown extension",
      );
      assert.deepStrictEqual(
        context.response.headers.get("Content-Type"),
        "application/octet-stream",
      );
    });
  });
});
