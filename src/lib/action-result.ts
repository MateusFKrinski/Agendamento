export type ActionError = { success: false; error: string };
export type ActionSuccess<T> = { success: true; data: T };
export type ActionResult<T> = ActionSuccess<T> | ActionError;

export function fail(error: string): ActionError {
  return { success: false, error };
}

export async function createResult<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return { success: false, error: message };
  }
}
