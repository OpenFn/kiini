import enhancedResolver from "enhanced-resolve";

/**
 * Resolve a modules .d.ts files location.
 * This expects a module has a `types` key in it's package.json.
 */
export async function dtsResolve(
  startDir: string,
  moduleName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    enhancedResolver.create({
      extensions: [".json", ".d.ts"],
      exportsFields: ["types"],
    })(startDir, moduleName, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

/**
 * Resolve a modules package.json file.
 */
export async function packageResolve(
  startDir: string,
  moduleName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    enhancedResolver.create({
      extensions: [".json"],
      exportsFields: [],
    })(startDir, moduleName, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}
