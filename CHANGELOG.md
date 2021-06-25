# 2021-06-24 Experiment 1

Using:

- typescript
- ts-node

Created a `commonjs` exported module that has a default export
and an 'executor' that imports the module and calls the default export
(with a timeout).

```
npx tsc first.ts && NODE_OPTIONS=--enable-source-maps ts-node executor.ts ./first.ts
```

The user contract is that they provide a default export that is an (async) function.


Running the testing web server.

```
ts-node test-server.ts
```

# 2021-06-25 Experiment 2

Using the expression from experiment 1, and abstracting the http post into
a module (which extends the axios type interface), we can get compiler errors
if you call `post` incorrectly.
