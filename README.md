# kiini

OpenFn Future Compiler

See [OpenFn/core](https://github.com/OpenFn/core)

## CLI

### `transform`

Using a specified tranform, take an input file (expression) pass it through
the compiler and return the result via STDOUT.

**Example**

```
./bin/kiini transform -a language-http -t legacy test.js
```

- `-a` Specify the adaptor
- `-t` Specify the tranform/compiler to use
- `<expression>` Location of the source file to be transformed

> This is still very much a work in progress and this interface is like to
> change. Currently there is only one compiler available (`legacy`).

## Development

### Working on the CLI

Since the CLI is expected to work on NodeJS (without needing to compile the source) you need to use Rollups build system to update the `dist/cli.js` file when there are changes.

An easy way to stay productive in this situation is to run:

```
rollup --watch --config --input ./src/cli/index.ts
```

This will set up a watcher that only recompiles the CLI specific entry-point.
