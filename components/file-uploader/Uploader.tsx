"use client";

import { useCallback, useEffect, useState } from "react";
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

interface UploaderProps {
  onFileSelected?: (file: File | null) => void;
  fileKey?: string;
  mediaType?: "image" | "video";
  status?: "uploading" | "success" | "error";
  progress?: number;
}

export function Uploader({
  onFileSelected,
  fileKey,
  mediaType = "image",
  progress = 0,
  status,
}: UploaderProps) {
  const fileUrl = useConstructUrl(fileKey ?? "");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [removed, setRemoved] = useState(false);

  const isUploading = status === "uploading";

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (isUploading || acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];

      setSelectedFile(file);
      setRemoved(false);

      onFileSelected?.(file);

      toast.success(
        mediaType === "video"
          ? "Vídeo selecionado com sucesso."
          : "Imagem selecionada com sucesso."
      );
    },
    [mediaType, onFileSelected, isUploading]
  );

  function rejectedFiles(fileRejections: FileRejection[]) {
    if (!fileRejections.length) return;

    const tooManyFiles = fileRejections.some(
      (rejection) =>
        rejection.errors.some(
          (error) => error.code === "too-many-files"
        )
    );

    const fileSizeTooBig = fileRejections.some(
      (rejection) =>
        rejection.errors.some(
          (error) => error.code === "file-too-large"
        )
    );

    const invalidType = fileRejections.some(
      (rejection) =>
        rejection.errors.some(
          (error) => error.code === "file-invalid-type"
        )
    );

    if (fileSizeTooBig) {
      toast.error("O tamanho do arquivo excede os limites.");
    }

    if (tooManyFiles) {
      toast.error("Selecione apenas um arquivo.");
    }

    if (invalidType) {
      toast.error(
        mediaType === "video"
          ? "Selecione um vídeo válido."
          : "Selecione uma imagem válida."
      );
    }
  }

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept:
        mediaType === "video"
          ? { "video/*": [] }
          : { "image/*": [] },
      maxFiles: 1,
      multiple: false,
      disabled: isUploading,
      maxSize:
        mediaType === "video"
          ? 512 * 1024 * 1024
          : 4 * 1024 * 1024,
      onDropRejected: rejectedFiles,
    });

  async function handleRemoveFile() {
    if (isUploading) return;

    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoved(true);

    onFileSelected?.(null);

    toast.success("Arquivo removido do formulário.");
  }

  function handleSelectAgain() {
    if (isUploading) return;

    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoved(true);

    onFileSelected?.(null);
  }

  function renderContent() {
    if (status === "error" && selectedFile) {
      return (
        <RenderErrorState
          onSelectAgain={handleSelectAgain}
        />
      );
    }

    if (isUploading && selectedFile) {
      return (
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <RenderUploadingState
            progress={progress}
            file={selectedFile}
            mediaType={mediaType}
          />
        </div>
      );
    }

    const currentPreview = selectedFile
      ? previewUrl
      : !removed && fileKey
        ? fileUrl
        : null;

    if (!currentPreview) {
      return (
        <RenderEmptyState
          isDragActive={isDragActive}
          mediaType={mediaType}
        />
      );
    }

    return (
      <RenderUploadedState
        previewUrl={currentPreview}
        fileName={
          selectedFile?.name ??
          (mediaType === "video"
            ? "Vídeo salvo"
            : "Imagem salva")
        }
        mediaType={mediaType}
        isDeleting={false}
        isLoading={false}
        handleRemoveFile={handleRemoveFile}
      />
    );
  }

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />

        {renderContent()}
      </CardContent>
    </Card>
  );
}