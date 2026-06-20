import { toast } from "@heroui/react";

export type ActionResult =
  | { error: string }
  | { success: true; [key: string]: unknown }
  | null
  | undefined;

type SubmitOptions = {
  action: () => Promise<ActionResult>;
  onSuccess?: (result: ActionResult) => void | Promise<void>;
  successMessage?: string;
  errorMessage?: string;
};
export async function formSubmit({
  action,
  onSuccess,
  successMessage = "Operação realizada com sucesso",
  errorMessage = "Erro ao realizar operação",
}: SubmitOptions): Promise<void> {
  try {
    const result = await action();

    if (result && "error" in result) {
      toast.danger(
        typeof result.error === "string"
          ? result.error
          : "Verifique os campos e tente novamente",
      );
      return;
    }

    if (successMessage) toast.success(successMessage);
    await onSuccess?.(result);
  } catch {
    toast.danger(errorMessage);
  }
}
