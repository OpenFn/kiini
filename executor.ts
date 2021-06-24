async function execute(path: string) {
  const { default: main } = await import(path);

  return Promise.race([
    new Promise(async (_, reject) => {
      setTimeout(() => {
        reject("Timeout...");
      }, 3000);
    }),
    main(),
  ]);
}

execute(process.argv[process.argv.length - 1]).catch((error) => {
  process.exitCode = 1;
  console.error(error);
  process.exit();
});
