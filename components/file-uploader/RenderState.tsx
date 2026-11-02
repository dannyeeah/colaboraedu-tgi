import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import Image from "next/image";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary",
          )}
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        Coloque seus arquivos aqui
        <span className="text-primary bold cursor-pointer">
          click para o upload
        </span>
      </p>
      <Button className="mt-4" type="button">
        Selecione os arquivos
      </Button>
    </div>
  );
}

export function RenderErrorState({
  onSelectAgain,
}: {
  onSelectAgain: () => void;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon className={cn("size-6 text-destructive")} />
      </div>

      <p className="text-base font-semibold">Falha no Upload</p>
      <p className="text-xs mr-1 text-muted-foreground">Algo deu errado</p>
      <Button className="mt-4" type="button" onClick={onSelectAgain}>
        Selecione novamente
      </Button>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  fileName,
  isDeleting,
  isLoading,
  handleRemoveFile,
}: {
  previewUrl: string;
  fileName: string;
  isDeleting: boolean;
  isLoading: boolean;
  handleRemoveFile: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <div className="relative">
        <Image
          src={previewUrl}
          alt={`Pré-visualização de ${fileName}`}
          width={400}
          height={160}
          className={cn(
            "max-h-36 w-auto rounded-md object-contain transition-opacity duration-500",
            isLoading && "opacity-40 animate-pulse",
          )}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      <p className="max-w-full truncate text-sm text-muted-foreground">
        {fileName}
      </p>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className={cn("absolute top-4 right-4")}
        title="Trocar imagem"
        disabled={isDeleting || isLoading}
        onClick={handleRemoveFile}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function RenderUploadingState({
  progress,
  file,
}: {
  progress: number;
  file: File;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-2 text-center">
      <Progress value={progress} />

      <p className="text-sm font-medium text-foreground">
        Enviando imagem... {Math.round(progress)}%
      </p>

      <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
        {file.name}
      </p>
    </div>
  );
}
