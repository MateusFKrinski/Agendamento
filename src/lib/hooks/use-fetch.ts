import { useState, useEffect, useCallback } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

type MaybeError = { error: string };

function hasError(value: unknown): value is MaybeError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as MaybeError).error === "string"
  );
}

export function useFetch<T>(action: () => Promise<T>): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await action();

      if (hasError(result)) {
        setError(result.error);
        return;
      }

      setData(result);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [action]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
