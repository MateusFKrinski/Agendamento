import { Alert } from "@heroui/react";
import { TriangleAlertIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@heroui/react";

type FetchErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function FetchError({
  message = "Não foi possível carregar os dados, tente novamente",
  onRetry,
}: FetchErrorProps) {
  return (
    <Alert status="danger" className="flex items-center w-fit">
      <Alert.Indicator>
        <TriangleAlertIcon size={16} />
      </Alert.Indicator>
      <Alert.Content className="flex-1">
        <Alert.Title>Erro ao carregar</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
      {onRetry && (
        <Button
          isIconOnly
          size="md"
          variant="ghost"
          onPress={onRetry}
          className="text-danger hover:bg-danger/10 shrink-0"
        >
          <RefreshCwIcon size={16} />
        </Button>
      )}
    </Alert>
  );
}
