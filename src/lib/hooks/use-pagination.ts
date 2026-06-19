import { useState } from "react";

export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  return { page, setPage, limit, handleLimitChange };
}
