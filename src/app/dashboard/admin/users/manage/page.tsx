"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { listUsers } from "@/actions/user";
import UserRow from "@/components/admin/user-row";
import { useFetch } from "@/lib/hooks/use-fetch";
import { AsyncState } from "@/components/ui/async-state";

export default function Page() {
  const router = useRouter();
  const { data, loading, error, refresh } = useFetch(listUsers);

  const users = data?.success ? data.data.users : [];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Usuários</h1>
          <p className="text-sm text-muted">Gerencie os usuários do sistema</p>
        </div>
        <Button onPress={() => router.push("/dashboard/admin/users/create")}>
          <PlusIcon size={16} />
          Novo usuário
        </Button>
      </div>

      <AsyncState
        data={users}
        loading={loading}
        error={error}
        onRetry={refresh}
        className="col-span-3 flex justify-center"
        empty={
          <p className="text-sm text-muted text-center py-4">
            Nenhum usuário cadastrado
          </p>
        }
      >
        {(users) => (
          <div className="w-full grid grid-cols-3 gap-3 items-start">
            {users.map((user) => (
              <UserRow key={user.id} user={user} afterSubmitAction={refresh} />
            ))}
          </div>
        )}
      </AsyncState>
    </div>
  );
}
