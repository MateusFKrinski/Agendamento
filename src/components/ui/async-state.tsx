import { Spinner } from "@heroui/react";
import { FetchError } from "./fetch-error";
import React from "react";

type AsyncStateProps<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  empty?: React.ReactNode;
  children: (data: T) => React.ReactNode;
  className?: string;
};

export function AsyncState<T>({
  data,
  loading,
  error,
  onRetry,
  empty,
  children,
  className,
}: AsyncStateProps<T>) {
  if (error) {
    return (
      <div className={className}>
        <FetchError message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <Spinner />
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={className}>
        {empty ?? (
          <p className="text-sm text-muted text-center py-4">
            Nenhum resultado encontrado
          </p>
        )}
      </div>
    );
  }

  return <>{children(data)}</>;
}
