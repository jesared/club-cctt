type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryablePrismaError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = String((error as { message?: unknown }).message ?? "");
  const code = String((error as { code?: unknown }).code ?? "");
  const metaCode = String(
    (error as { meta?: { code?: unknown } }).meta?.code ?? "",
  );

  return (
    message.includes("terminating connection due to administrator command") ||
    message.includes("server closed the connection unexpectedly") ||
    message.includes("Connection terminated unexpectedly") ||
    message.includes("ECONNRESET") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P2034" ||
    metaCode === "57P01" ||
    metaCode === "40001" ||
    message.includes("write conflict") ||
    message.includes("deadlock")
  );
}

export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
) {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 200;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryablePrismaError(error) || attempt === attempts) {
        throw error;
      }

      const delay = baseDelayMs * attempt;
      await sleep(delay);
    }
  }

  throw lastError;
}
