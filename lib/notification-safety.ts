export function isNotificationSchemaMissingError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = String((error as { message?: unknown }).message ?? "");
  const code = String((error as { code?: unknown }).code ?? "");
  const metaTable = String(
    (error as { meta?: { table?: unknown } }).meta?.table ?? "",
  );
  const metaModel = String(
    (error as { meta?: { modelName?: unknown } }).meta?.modelName ?? "",
  );

  if (code !== "P2021" && code !== "P2022") {
    return false;
  }

  return (
    message.includes("Notification") ||
    message.includes("notification") ||
    metaTable.includes("Notification") ||
    metaTable.includes("notification") ||
    metaModel.includes("Notification") ||
    metaModel.includes("notification")
  );
}

export async function withNotificationSchemaFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
) {
  try {
    return await operation();
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return fallback;
    }

    throw error;
  }
}
