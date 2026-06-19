export default function AdminRolePermissionsForm({
                               role,
                               onSuccess,
                             }: {
  role: Role;
  onSuccess: () => void;
}) {
  const currentKeys = role.permissions.map(
    (rp) => `${rp.permission.action}:${rp.permission.resource}`,
  );
  const [selected, setSelected] = useState<string[]>(currentKeys);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateRolePermissions(role.id, {
      permissionKeys: selected,
    });
    setLoading(false);
    if (result?.error) {
      toast.danger(result.error);
      return;
    }
    toast.success("Permissões atualizadas");
    onSuccess();
  }

  return (
    <div className="flex flex-col gap-5">
      {PERMISSION_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted uppercase">
          {group.label}
          </p>
          <CheckboxGroup value={selected} onChange={setSelected}>
        <div className="flex flex-col gap-1">
          {group.entries.map((entry) => {
              const key = `${entry.action}:${entry.resource}`;
              return (
                <Checkbox key={key} value={key}>
              <Checkbox.Control className="bg-default">
                <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                <Label>{entry.label}</Label>
                </Checkbox.Content>
                </Checkbox>
            );
            })}
          </div>
          </CheckboxGroup>
          </div>
  ))}

  <Button onPress={handleSave} className="w-full" isDisabled={loading}>
    {loading ? (
        <>
          <Spinner className="text-accent-foreground" />
          </>
      ) : (
        <>
          <SaveIcon size={16} />
  Salvar permissões
  </>
)}
  </Button>
  </div>
);
}