"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./RenderState";
import { toast } from "sonner";
import { useConstructUrl } from "@/hooks/use-construct-url";

interface UploaderState {
  file: File | null;
  objectUrl: string | null | undefined;
  uploading?: boolean;
  progress?: number;
  error?: boolean;
  fileType?: string;
  id?: string | null;
  isDeleting?: boolean;
  isLoading?: boolean;
}

interface UploaderProps {
  onFileSelected?: (file: File | null) => void;
  fileKey?: string;
  status?: "uploading" | "success" | "error";
  progress?: number;
}

export function Uploader({
  onFileSelected,
  fileKey,
  progress = 0,
  status,
}: UploaderProps) {
  const fileUrl = useConstructUrl(fileKey ?? "");
  const [fileState, setFileState] = useState<UploaderState>({
    file: null,
    objectUrl: fileKey ? fileUrl : null,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(file);

        setFileState({
          file: file,
          objectUrl,
          isLoading: true,
        });
        onFileSelected?.(file);

        await new Promise((resolve) => setTimeout(resolve, 700));
        setFileState((prev) => ({ ...prev, isLoading: false }));
        toast.success("Imagem adicionada com sucesso.", { duration: 4000 });
      }
    },
    [onFileSelected],
  );

  function rejectedFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const tooManyfiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files",
      );

      const fileSizeToBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large",
      );

      if (fileSizeToBig) {
        toast.error("O tamanho do arquivo excede os limites");
      }

      if (tooManyfiles) {
        toast.error("Muitos arquivos selecionados, o máximo é 1");
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 4 * 1024 * 1024,
    onDropRejected: rejectedFiles,
  });

  async function handleRemoveFile() {
    if (fileState.isDeleting || fileState.isLoading || !fileState.objectUrl) {
      return;
    }

    setFileState((prev) => ({
      ...prev,
      isDeleting: true,
      error: false,
    }));

    try {
      const minimumAnimation = new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );

      if (fileKey) {
        const response = await fetch("/api/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: fileKey }),
        });

        if (!response.ok) {
          toast.error("Não foi possível remover o arquivo");

          setFileState((prev) => ({
            ...prev,
            isDeleting: false,
            error: true,
          }));

          return;
        }

        await minimumAnimation;
      } else {
        await minimumAnimation;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      setFileState(() => ({
        file: null,
        uploading: false,
        progress: 0,
        objectUrl: undefined,
        error: false,
        fileType: "image",
        id: null,
        isDeleting: false,
        isLoading: false,
      }));

      toast.success("Arquivo removido com sucesso");
    } catch {
      toast.error("Erro para remover o arquivo. Por favor tente novamente");

      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
        isLoading: false,
      }));
    }
  }

  function handleSelectAgain() {
    if (fileState.objectUrl) {
      URL.revokeObjectURL(fileState.objectUrl);
    }

    setFileState({ file: null, objectUrl: null });
    onFileSelected?.(null);
  }

  function renderContent() {
    if (!fileState.file) {
      return <RenderEmptyState isDragActive={isDragActive} />;
    }

    if (status === "error") {
      return <RenderErrorState onSelectAgain={handleSelectAgain} />;
    }

    if (status === "uploading") {
      return (
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <RenderUploadingState progress={progress} file={fileState.file} />
        </div>
      );
    }

    return fileState.objectUrl ? (
      <RenderUploadedState
        previewUrl={fileState.objectUrl}
        fileName={fileState.file.name}
        isDeleting={fileState.isDeleting ?? false}
        isLoading={fileState.isLoading ?? false}
        handleRemoveFile={handleRemoveFile}
      />
    ) : null;
  }

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary",
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
