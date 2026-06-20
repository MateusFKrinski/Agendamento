import { Pagination } from "@heroui/react";
import { SelectField } from "@/components/ui/select-field";

const LIMIT_OPTIONS = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
];

interface TablePaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function TablePagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  const items = Array.from({ length: pages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="w-full flex items-center justify-between px-2 py-2">
      <div className="w-full flex items-center gap-6">
        <SelectField
          aria-label="Itens por página"
          label=""
          placeholder="Exibição da tabela"
          variant="primary"
          options={LIMIT_OPTIONS}
          value={String(limit)}
          onChange={(val) => onLimitChange(Number(val))}
          className="w-50"
        />
        <p className="text-xs text-muted">
          {total} registro{total !== 1 ? "s" : ""}
        </p>
      </div>

      <Pagination className="flex justify-end">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              onPress={() => onPageChange(Math.max(1, page - 1))}
              isDisabled={page === 1}
            >
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>

          {items.map((p, i) =>
            p === "..." ? (
              <Pagination.Item key={`ellipsis-${i}`}>
                <Pagination.Ellipsis />
              </Pagination.Item>
            ) : (
              <Pagination.Item key={p}>
                <Pagination.Link
                  isActive={page === p}
                  onPress={() => onPageChange(p as number)}
                >
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ),
          )}

          <Pagination.Item>
            <Pagination.Next
              onPress={() => onPageChange(Math.min(pages, page + 1))}
              isDisabled={page === pages}
            >
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}
