"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateDriverSchema,
  type UpdateDriverFormData,
} from "@/lib/schemas/driver";
import { updateDriver } from "@/actions/driver";
import { Form, Separator, Button } from "@heroui/react";
import { SaveIcon, PlusIcon } from "lucide-react";
import ButtonField from "@/components/ui/button-field";
import { formSubmit } from "@/lib/form-submit";
import { maskCPF, maskPhone } from "@/lib/utils/masks";
import { useState } from "react";
import PaymentMethodForm from "./payment-method-form";
import PaymentMethodCreateForm from "./payment-method-create-form";
import { DriverRow } from "@/actions/types/driver";
import { DriverFormFields } from "@/components/forms/driver-form-fields";
import SectionLabel from "@/components/ui/section-label";

export default function DriverEditForm({
  driver,
  afterSubmitAction,
}: {
  driver: DriverRow;
  afterSubmitAction: () => void;
}) {
  const [addingMethod, setAddingMethod] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateDriverFormData>({
    resolver: zodResolver(updateDriverSchema),
    defaultValues: {
      name: driver.name,
      cpf: maskCPF(driver.cpf),
      rg: driver.rg ?? "",
      role: driver.role ?? "",
      birthDate: driver.birthDate.toISOString().split("T")[0],
      phone: maskPhone(driver.phone),
      observations: driver.observations ?? undefined,
      cnhNumber: driver.cnhNumber,
      cnhCategory: driver.cnhCategory,
      cnhExpiration: driver.cnhExpiration.toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: UpdateDriverFormData) {
    await formSubmit({
      action: () => updateDriver(driver.id, data),
      successMessage: "Motorista atualizado com sucesso",
      onSuccess: afterSubmitAction,
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-2.5">
      <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <DriverFormFields
          control={control}
          errors={errors}
          variant="secondary"
        />

        <ButtonField
          {...{ type: "submit", className: "w-full" }}
          isSubmitting={isSubmitting}
          label="Salvar alterações"
          icon={SaveIcon}
        />
      </Form>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Métodos de pagamento</SectionLabel>
          {!addingMethod && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onPress={() => setAddingMethod(true)}
            >
              <PlusIcon size={14} />
              Adicionar
            </Button>
          )}
        </div>

        {driver.paymentMethods.map((method) => (
          <PaymentMethodForm
            key={method.id}
            method={method}
            canRemove={driver.paymentMethods.length > 1}
            afterSubmitAction={afterSubmitAction}
          />
        ))}

        {addingMethod && (
          <PaymentMethodCreateForm
            driverId={driver.id}
            afterSubmitAction={() => {
              setAddingMethod(false);
              afterSubmitAction();
            }}
            onCancelAction={() => setAddingMethod(false)}
          />
        )}
      </div>
    </div>
  );
}
