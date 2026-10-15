import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { todayIsoDate } from "@/lib/format";
import { ApiError } from "@/lib/http";
import { cn } from "@/lib/utils";
import { formatLicensePlate, formatTrackerSerial } from "../lib/license-plate";
import {
  ACCEPTED_IMAGE_TYPES,
  InvalidImageError,
  MAX_IMAGE_SIZE_MB,
  prepareTruckImage,
} from "../lib/image";
import {
  emptyTruckForm,
  truckFormSchema,
  type TruckFormOutput,
  type TruckFormValues,
} from "../schemas";
import type { TruckInput } from "../types";
import { LocationPicker } from "./location-picker";
import { TruckAvatar } from "./truck-avatar";

interface TruckFormProps {
  defaultValues?: Partial<TruckFormValues>;
  submitLabel: string;
  /** Resolves when saved; rejections are shown on the form. */
  onSubmit: (input: TruckInput) => Promise<unknown>;
  onCancel?: () => void;
  /** `split` places the map beside the fields on large screens. */
  layout?: "split" | "stacked";
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="space-y-4">
    <h2 className="text-base font-semibold">{title}</h2>
    {children}
  </section>
);

export function TruckForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  layout = "split",
}: TruckFormProps) {
  const ids = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<TruckFormValues, unknown, TruckFormOutput>({
    resolver: zodResolver(truckFormSchema),
    defaultValues: { ...emptyTruckForm(), ...defaultValues },
  });
  const { control, formState, setError, setValue } = form;
  // useWatch (not watch) keeps subscriptions compatible with React Compiler.
  const [imageUrl, identifier] = useWatch({
    control,
    name: ["imageUrl", "identifier"],
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError(
          "licensePlate",
          { message: "Já existe um caminhão com essa placa" },
          { shouldFocus: true }
        );
      } else {
        setError("root", {
          message: "Não foi possível salvar o caminhão. Tente novamente.",
        });
      }
    }
  });

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      setValue("imageUrl", await prepareTruckImage(file), {
        shouldDirty: true,
      });
      form.clearErrors("imageUrl");
    } catch (error) {
      setError("imageUrl", {
        message:
          error instanceof InvalidImageError
            ? error.message
            : "Não foi possível ler a imagem.",
      });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {formState.errors.root && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{formState.errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "grid gap-8",
          layout === "split" && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
        )}
      >
        <Section title="Dados do caminhão">
          <FieldGroup>
            <Controller
              name="identifier"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${ids}-identifier`}>
                    Identificação
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${ids}-identifier`}
                    placeholder="Ex.: Volvo FH 540 · Curitiba (PR)"
                    maxLength={40}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="licensePlate"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${ids}-plate`}>Placa</FieldLabel>
                    <Input
                      {...field}
                      id={`${ids}-plate`}
                      onChange={(event) =>
                        field.onChange(formatLicensePlate(event.target.value))
                      }
                      placeholder="ABC-1234 ou ABC1D23"
                      className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="trackerSerialNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${ids}-tracker`}>
                      Nº de série do rastreador
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${ids}-tracker`}
                      onChange={(event) =>
                        field.onChange(formatTrackerSerial(event.target.value))
                      }
                      placeholder="Ex.: VT540SP01"
                      className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${ids}-start`}>
                    Em operação desde
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${ids}-start`}
                    type="date"
                    max={todayIsoDate()}
                    className="sm:w-48"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field data-invalid={Boolean(formState.errors.imageUrl)}>
              <FieldLabel htmlFor={`${ids}-image`}>Foto (opcional)</FieldLabel>
              <div className="flex items-center gap-4">
                <TruckAvatar
                  truck={{ identifier: identifier || "novo", imageUrl }}
                  className="size-16"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus />
                    {imageUrl ? "Trocar foto" : "Enviar foto"}
                  </Button>
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setValue("imageUrl", null, { shouldDirty: true })
                      }
                    >
                      <Trash2 />
                      Remover
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  id={`${ids}-image`}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(event) => {
                    void handleImage(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </div>
              <FieldDescription>
                JPG, PNG ou WEBP de até {MAX_IMAGE_SIZE_MB} MB. A imagem é
                redimensionada no navegador antes de salvar.
              </FieldDescription>
              <FieldError errors={[formState.errors.imageUrl]} />
            </Field>
          </FieldGroup>
        </Section>

        <Section title="Localização">
          <Controller
            name="coordinates"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  invalid={fieldState.invalid}
                  describedBy={`${ids}-location-error`}
                />
                <FieldError
                  id={`${ids}-location-error`}
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
        </Section>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <Spinner />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
