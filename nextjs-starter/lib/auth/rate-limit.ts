const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_KEYS = 5000;

type Entry = { count: number; resetAt: number };

const attempts = new Map<string, Entry>();

function cleanup(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
}

/**
 * 进程内滑动窗口限流：同一 IP + 邮箱每分钟最多 5 次登录/注册。
 * 已知限制：Serverless 多实例下为单实例级防护。
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  if (attempts.size > MAX_KEYS) cleanup(now);

  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) return false;

  entry.count += 1;
  return true;
}
