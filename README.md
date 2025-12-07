<p align="center">
  <img src="https://github.com/raptor-http/brand/raw/main/assets/logo.svg" width="150" height="150" alt="Raptor Framework" />
</p>

<p align="center">
  <a href="https://github.com/raptor-http/static/actions"><img src="https://github.com/raptor-http/static/workflows/ci/badge.svg" alt="Build Status"></a>
  <a href="jsr.io/@raptor/static"><img src="https://jsr.io/badges/@raptor/static?logoColor=3A9D95&color=3A9D95&labelColor=083344" /></a>
  <a href="jsr.io/@raptor/static score"><img src="https://jsr.io/badges/@raptor/static/score?logoColor=3A9D95&color=3A9D95&labelColor=083344" /></a>
  <a href="https://jsr.io/@raptor"><img src="https://jsr.io/badges/@raptor?logoColor=3A9D95&color=3A9D95&labelColor=083344" alt="" /></a>
</p>

## Raptor Static

See more information about the Raptor framework here: <a href="https://jsr.io/@raptor/framework">https://jsr.io/@raptor/framework</a>.

# Usage

> [!NOTE]
> This is currently under heavy development and is not yet suitable for production use. Please proceed with caution.

## Installation

To start using the static file handling, simply install into an existing Raptor application via the CLI or import it directly from JSR.

### Using the Deno CLI

```
deno add jsr:@raptor/static
```

### Importing with JSR

Raptor is also available to import directly via JSR:
[https://jsr.io/@raptor/static](https://jsr.io/@raptor/static)

## Usage

The static handler supports a configurable path, relative to the current working directory.

```ts
import { StaticHandler } from "jsr:@raptor/static";
import { Kernel, Context } from "jsr:@raptor/framework";

const app = new Kernel();

const handler = new StaticHandler({
  path: "public"
});

app.add((context: Context) => handler.handle(context));

app.add(() => "Hello, Dr Malcolm!");

app.serve({ port: 8000 });
```

# License

_Copyright 2025, @briward. All rights reserved. The framework is licensed under
the MIT license._
