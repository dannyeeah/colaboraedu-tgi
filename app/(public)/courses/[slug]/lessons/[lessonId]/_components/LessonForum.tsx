"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  Send,
  Reply,
  Trash2,
  Pencil,
  Users,
  X,
} from "lucide-react";

import {
  getForumComments,
  createForumComment,
  deleteForumComment,
  editForumComment,
  searchForumUsers,
} from "@/app/data/forum/forum-actions";

type ForumComment = Awaited<
  ReturnType<typeof getForumComments>
>[number];

type ForumUser = Awaited<
  ReturnType<typeof searchForumUsers>
>[number];

type LessonForumProps = {
  lessonId: string;
  initialComments: ForumComment[];
};

function getRoleLabel(role: string | null) {
  switch (role) {
    case "superadmin":
      return "Superadministrador";
    case "admin":
      return "Professor";
    case "user":
      return "Estudante";
    default:
      return "Participante";
  }
}

function getRoleColor(role: string | null) {
  switch (role) {
    case "superadmin":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
    case "admin":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    default:
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  }
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function CommentContent({
  comment,
}: {
  comment: ForumComment;
}) {
  const names = comment.mentions
    .map((mention) => `@${mention.user.name}`)
    .sort((a, b) => b.length - a.length);

  if (names.length === 0) {
    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {comment.content}
      </p>
    );
  }

  const escapedNames = names.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const regex = new RegExp(
    `(${escapedNames.join("|")})`,
    "g"
  );

  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {comment.content.split(regex).map((part, index) =>
        names.includes(part) ? (
          <span
            key={index}
            className="font-semibold text-purple-600 dark:text-purple-400"
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}

function CommentForm({
  lessonId,
  parentId,
  onSuccess,
  onCancel,
}: {
  lessonId: string;
  parentId?: string;
  onSuccess: () => Promise<void>;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<ForumUser[]>([]);
  const [suggestions, setSuggestions] = useState<ForumUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!mentionQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const users = await searchForumUsers(
          lessonId,
          mentionQuery
        );

        if (active) {
          setSuggestions(users);
        }
      } catch {
        if (active) {
          setSuggestions([]);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mentionQuery, lessonId]);

  function handleContentChange(value: string) {
    setContent(value);
    setSuggestions([]);

    const match = value.match(
      /(?:^|\s)@([^@\n]{0,100})$/
    );

    setMentionQuery(match ? match[1] : "");
  }

  function selectMention(user: ForumUser) {
    const updatedContent = content.replace(
      /@[^@\n]*$/,
      () => `@${user.name} `
    );

    setContent(updatedContent);

    setMentions((previous) =>
      previous.some((item) => item.id === user.id)
        ? previous
        : [...previous, user]
    );

    setSuggestions([]);
    setMentionQuery("");
  }

  async function handleSubmit() {
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      await createForumComment({
        lessonId,
        parentId,
        content,
        mentionIds: mentions
          .filter((user) =>
            content.includes(`@${user.name}`)
          )
          .map((user) => user.id),
      });

      setContent("");
      setMentions([]);
      setSuggestions([]);
      setMentionQuery("");

      await onSuccess();
    } catch {
      setError(
        "Não foi possível publicar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative space-y-3 rounded-xl border bg-card p-4">
      <textarea
        value={content}
        onChange={(event) =>
          handleContentChange(event.target.value)
        }
        placeholder={
          parentId
            ? "Escreva sua resposta..."
            : "Compartilhe sua dúvida ou conhecimento..."
        }
        maxLength={3000}
        disabled={loading}
        className="min-h-28 w-full resize-y rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
      />

      {mentionQuery && suggestions.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
          <p className="border-b p-2 text-xs text-muted-foreground">
            Mencionar usuário
          </p>

          {suggestions.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectMention(user)}
              className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                {getInitials(user.name)}
              </div>

              <div>
                <p className="text-sm font-medium">
                  {user.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <p>Use @Nome para mencionar alguém.</p>
          <p>{content.length}/3000 caracteres</p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            <Send size={16} />

            {loading
              ? "Publicando..."
              : parentId
                ? "Responder"
                : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  comments,
  lessonId,
  onRefresh,
  depth = 0,
}: {
  comment: ForumComment;
  comments: ForumComment[];
  lessonId: string;
  onRefresh: () => Promise<void>;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(
    comment.content
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const replies = comments.filter(
    (item) => item.parentId === comment.id
  );

  async function handleDelete() {
    if (loading) return;

    const confirmed = window.confirm(
      "Tem certeza de que deseja excluir este comentário?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      await deleteForumComment(lessonId, comment.id);
      await onRefresh();
    } catch {
      setError("Não foi possível excluir o comentário.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit() {
    if (!editedContent.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      await editForumComment(
        lessonId,
        comment.id,
        editedContent
      );

      setEditing(false);
      await onRefresh();
    } catch {
      setError("Não foi possível editar o comentário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        depth > 0 && depth <= 3
          ? "ml-2 border-l-2 border-purple-200 pl-3 dark:border-purple-900 sm:ml-5"
          : ""
      }
    >
      <div className="flex gap-3 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 font-semibold text-purple-700">
          {comment.user.image ? (
            <img
              src={comment.user.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(comment.user.name)
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {comment.user.name}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${getRoleColor(
                comment.user.role
              )}`}
            >
              {getRoleLabel(comment.user.role)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}

            {!comment.deletedAt &&
              new Date(comment.updatedAt).getTime() >
                new Date(comment.createdAt).getTime() &&
              " · Editado"}
          </p>

          {comment.deletedAt ? (
            <p className="text-sm italic text-muted-foreground">
              Este comentário foi excluído.
            </p>
          ) : editing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(event) =>
                  setEditedContent(event.target.value)
                }
                maxLength={3000}
                disabled={loading}
                className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={
                    loading || !editedContent.trim()
                  }
                  className="rounded-lg bg-purple-600 px-3 py-2 text-xs text-white disabled:opacity-50"
                >
                  Salvar alterações
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                  className="rounded-lg border px-3 py-2 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <CommentContent comment={comment} />
          )}

          {!comment.deletedAt && !editing && (
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
              >
                {replying ? (
                  <X size={14} />
                ) : (
                  <Reply size={14} />
                )}

                {replying ? "Cancelar" : "Responder"}
              </button>

              {comment.canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedContent(comment.content);
                    setEditing(true);
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              )}

              {comment.canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              )}

              {replies.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {replies.length}{" "}
                  {replies.length === 1
                    ? "resposta"
                    : "respostas"}
                </span>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-500">
              {error}
            </p>
          )}

          {replying && !comment.deletedAt && (
            <CommentForm
              lessonId={lessonId}
              parentId={comment.id}
              onCancel={() => setReplying(false)}
              onSuccess={async () => {
                setReplying(false);
                await onRefresh();
              }}
            />
          )}
        </div>
      </div>

      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          comments={comments}
          lessonId={lessonId}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function LessonForum({
  lessonId,
  initialComments,
}: LessonForumProps) {
  const [comments, setComments] = useState(initialComments);

  const rootComments = comments.filter(
    (comment) => !comment.parentId
  );

  const totalComments = comments.filter(
    (comment) => !comment.deletedAt
  ).length;

  async function refreshComments() {
    const updatedComments =
      await getForumComments(lessonId);

    setComments(updatedComments);
  }

  return (
    <section className="mt-10 space-y-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <MessageCircle size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Fórum de discussão
            </h2>

            <p className="text-sm text-muted-foreground">
              Aprenda, compartilhe e tire suas dúvidas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-medium">
          <Users size={15} />

          {totalComments}{" "}
          {totalComments === 1
            ? "comentário"
            : "comentários"}
        </div>
      </div>

      <CommentForm
        lessonId={lessonId}
        onSuccess={refreshComments}
      />

      {rootComments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
          <MessageCircle
            size={36}
            className="text-purple-400"
          />

          <h3 className="font-semibold">
            Nenhum comentário ainda
          </h3>

          <p className="px-4 text-sm text-muted-foreground">
            Seja a primeira pessoa a participar desta
            discussão!
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              comments={comments}
              lessonId={lessonId}
              onRefresh={refreshComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}