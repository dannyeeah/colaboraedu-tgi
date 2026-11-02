import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  "data-invalid"?: boolean;
};

function Field({ className, ...props }: FieldProps) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function FieldLabel(props: React.ComponentProps<typeof Label>) {
  return <Label {...props} />;
}

function FieldError({
  errors,
}: {
  errors: Array<{ message?: string } | undefined | null>;
}) {
  const message =
    errors.find((error) => !!error?.message)?.message ?? "Campo inválido";

  return <p className="text-sm text-destructive">{message}</p>;
}

export { Field, FieldError, FieldLabel };
