import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { SportsError } from "./football.mjs";

// Reserve before sending requests; failed attempts also consume the local budget.
// One backend process owns this file. Shared hosting needs a shared atomic store.
export function createBudget({ file, limit = 90, now = () => Date.now() }) {
  let chain = Promise.resolve();
  return {
    reserve() {
      const operation = chain.then(async () => {
        const day = new Date(now()).toISOString().slice(0, 10);
        let state;
        try {
          state = JSON.parse(await readFile(file, "utf8"));
          if (
            typeof state.day !== "string" ||
            !Number.isInteger(state.used) ||
            state.used < 0
          )
            throw new Error("Invalid budget");
        } catch (error) {
          if (error.code !== "ENOENT")
            throw new SportsError(
              "The request budget could not be verified. Updates are paused.",
              503,
            );
          state = { day, used: 0 };
        }
        if (state.day !== day) state = { day, used: 0 };
        if (state.used >= limit)
          throw new SportsError(
            "The backend daily request budget is exhausted. Updates resume after midnight UTC.",
            429,
          );
        state.used += 1;
        try {
          await mkdir(dirname(file), { recursive: true });
          await writeFile(file + ".tmp", JSON.stringify(state));
          await rename(file + ".tmp", file);
        } catch {
          throw new SportsError(
            "The request budget could not be saved. Updates are paused.",
            503,
          );
        }
      });
      chain = operation.catch(() => {});
      return operation;
    },
  };
}
