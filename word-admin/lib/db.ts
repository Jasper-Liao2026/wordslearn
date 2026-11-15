import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

function dataPath(file: string) {
  return path.join(dataDir, file);
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

const locks = new Map<string, Promise<unknown>>();

export function withFileLock<T>(file: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(file) ?? Promise.resolve();
  const next = previous.then(task, task);
  locks.set(
    file,
    next.catch(() => undefined)
  );
  return next;
}

export async function readCollection<T>(file: string, seed: T[]): Promise<T[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(dataPath(file), "utf8");
    return JSON.parse(raw) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeCollection(file, seed);
      return seed;
    }
    throw error;
  }
}

export async function writeCollection<T>(file: string, items: T[]): Promise<void> {
  await ensureDataDir();
  const target = dataPath(file);
  const temp = `${target}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(temp, JSON.stringify(items, null, 2), "utf8");
  await fs.rename(temp, target);
}

export async function mutateCollection<T, R>(
  file: string,
  seed: T[],
  mutator: (items: T[]) => { items: T[]; result: R }
): Promise<R> {
  return withFileLock(file, async () => {
    const current = await readCollection(file, seed);
    const { items, result } = mutator(current);
    await writeCollection(file, items);
    return result;
  });
}
