# kiini

OpenFn Future Compiler

## Development

### Working on the CLI

Since the CLI is expected to work on NodeJS (without needing to compile the source) you need to use Rollups build system to update the `dist/cli.js` file when there are changes.

An easy way to stay productive in this situation is to run:

```
rollup --watch --config --input ./src/cli/index.ts
```

This will set up a watcher that only recompiles the CLI specific entry-point.
