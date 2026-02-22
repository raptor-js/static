/// <reference lib="deno.ns" />
// deno-lint-ignore-file

import type { Context } from "@raptor/framework";
import { assertEquals, assertInstanceOf } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

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
    await Deno.mkdir(testDir, { recursive: true });

    await Deno.writeTextFile(
      `${testDir}/index.html`,
      "<html><body>Hello</body></html>",
    );
    await Deno.writeTextFile(`${testDir}/style.css`, "body { margin: 0; }");
    await Deno.writeTextFile(`${testDir}/script.js`, "console.log('test');");
    await Deno.writeTextFile(`${testDir}/data.json`, '{"key": "value"}');
    await Deno.writeTextFile(`${testDir}/document.txt`, "Plain text content");
    await Deno.writeTextFile(`${testDir}/readme.md`, "# Markdown");
    await Deno.writeTextFile(`${testDir}/image.svg`, "<svg></svg>");

    const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    await Deno.writeFile(`${testDir}/image.png`, pngHeader);

    await Deno.mkdir(`${testDir}/subdir`, { recursive: true });
    await Deno.writeTextFile(
      `${testDir}/subdir/nested.html`,
      "<html>Nested</html>",
    );

    handler = new StaticHandler({ staticFileDirectory: testDir });
  });

  afterEach(async () => {
    await Deno.remove(testDir, { recursive: true });
  });

  describe("constructor", () => {
    it("should use default path when no path provided", () => {
      const defaultHandler = new StaticHandler();

      assertEquals(defaultHandler.getConfig()["staticFileDirectory"], "public");
    });

    it("should use provided path", () => {
      const customHandler = new StaticHandler({
        staticFileDirectory: "custom-path",
      });

      assertEquals(
        customHandler.getConfig()["staticFileDirectory"],
        "custom-path",
      );
    });
  });

  describe("handle method", () => {
    it("should call next() for root path", async () => {
      const context = createMockContext("http://localhost:3000/");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(result, "next-called");
      assertEquals(next.wasCalled(), true);
    });

    it("should call next() for non-existent files", async () => {
      const context = createMockContext(
        "http://localhost:3000/nonexistent.html",
      );
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(result, "next-called");
      assertEquals(next.wasCalled(), true);
    });

    it("should call next() for directory paths", async () => {
      const context = createMockContext("http://localhost:3000/subdir");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(result, "next-called");
      assertEquals(next.wasCalled(), true);
    });

    it("should serve HTML file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/index.html");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "<html><body>Hello</body></html>");
      assertEquals(context.response.headers.get("Content-Type"), "text/html");
      assertEquals(next.wasCalled(), false);
    });

    it("should serve CSS file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/style.css");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "body { margin: 0; }");
      assertEquals(context.response.headers.get("Content-Type"), "text/css");
    });

    it("should serve JavaScript file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/script.js");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "console.log('test');");
      assertEquals(
        context.response.headers.get("Content-Type"),
        "text/javascript",
      );
    });

    it("should serve JSON file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/data.json");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, '{"key": "value"}');
      assertEquals(
        context.response.headers.get("Content-Type"),
        "application/json",
      );
    });

    it("should serve plain text file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/document.txt");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "Plain text content");
      assertEquals(context.response.headers.get("Content-Type"), "text/plain");
    });

    it("should serve markdown file with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/readme.md");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "# Markdown");
      assertEquals(
        context.response.headers.get("Content-Type"),
        "text/markdown",
      );
    });

    it("should serve SVG as text with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/image.svg");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "<svg></svg>");
      assertEquals(
        context.response.headers.get("Content-Type"),
        "image/svg+xml",
      );
    });

    it("should serve PNG as binary with correct content type", async () => {
      const context = createMockContext("http://localhost:3000/image.png");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertInstanceOf(result, Uint8Array);
      assertEquals(context.response.headers.get("Content-Type"), "image/png");
    });

    it("should serve nested files", async () => {
      const context = createMockContext(
        "http://localhost:3000/subdir/nested.html",
      );
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "<html>Nested</html>");
      assertEquals(context.response.headers.get("Content-Type"), "text/html");
    });

    it("should handle paths with leading slashes", async () => {
      const context = createMockContext("http://localhost:3000///index.html");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertEquals(typeof result, "string");
      assertEquals(result, "<html><body>Hello</body></html>");
    });

    it("should handle files without extension", async () => {
      await Deno.writeTextFile(`${testDir}/noext`, "No extension file");

      const context = createMockContext("http://localhost:3000/noext");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertInstanceOf(result, Uint8Array);
      const decoder = new TextDecoder("utf-8");
      assertEquals(decoder.decode(result as Uint8Array), "No extension file");
      assertEquals(
        context.response.headers.get("Content-Type"),
        "application/octet-stream",
      );
    });

    it("should handle unknown file extensions", async () => {
      await Deno.writeTextFile(`${testDir}/file.xyz`, "Unknown extension");

      const context = createMockContext("http://localhost:3000/file.xyz");
      const next = createMockNext();

      const result = await handler.handle(context, next);

      assertInstanceOf(result, Uint8Array);
      const decoder = new TextDecoder("utf-8");
      assertEquals(decoder.decode(result as Uint8Array), "Unknown extension");
      assertEquals(
        context.response.headers.get("Content-Type"),
        "application/octet-stream",
      );
    });
  });
});
