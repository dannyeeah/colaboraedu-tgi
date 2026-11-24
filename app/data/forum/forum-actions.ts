"use server";

import { prisma } from "@/lib/db";
import { requireForumAccess } from "@/lib/forum-access";
import { revalidatePath } from "next/cache";

function refreshForum(courseSlug: string, lessonId: string) {
  revalidatePath(
    `/courses/${courseSlug}/lessons/${lessonId}`
  );
}

function validateContent(content: string) {
  const text = content.trim();

  if (!text) {
    throw new Error("O comentário não pode estar vazio.");
  }

  if (text.length > 3000) {
    throw new Error(
      "O comentário deve ter no máximo 3000 caracteres."
    );
  }

  return text;
}

// ==========================================
// 1. LISTAR COMENTÁRIOS
// ==========================================

export async function getForumComments(lessonId: string) {
  const access = await requireForumAccess(lessonId);

  const comments = await prisma.forumComment.findMany({
    where: {
      lessonId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      content: true,
      userId: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      mentions: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return comments.map((comment) => ({
    ...comment,

    content: comment.deletedAt
      ? "Este comentário foi excluído."
      : comment.content,

    mentions: comment.deletedAt
      ? []
      : comment.mentions,

    canDelete:
      !comment.deletedAt &&
      (
        comment.userId === access.userId ||
        access.canModerate
      ),

    canEdit:
      !comment.deletedAt &&
      access.canEditAnyComment,
  }));
}

// ==========================================
// 2. PUBLICAR COMENTÁRIO OU RESPOSTA
// ==========================================

export async function createForumComment({
  lessonId,
  content,
  parentId,
  mentionIds = [],
}: {
  lessonId: string;
  content: string;
  parentId?: string;
  mentionIds?: string[];
}) {
  const access = await requireForumAccess(lessonId);

  const text = validateContent(content);

  const uniqueMentionIds = [...new Set(mentionIds)];

  if (uniqueMentionIds.length > 20) {
    throw new Error(
      "Você pode mencionar até 20 usuários por comentário."
    );
  }

  await prisma.$transaction(async (tx) => {
    if (parentId) {
      const parent = await tx.forumComment.findFirst({
        where: {
          id: parentId,
          lessonId,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!parent) {
        throw new Error(
          "O comentário que você deseja responder não está disponível."
        );
      }
    }

    const mentionedUsers = await tx.user.findMany({
      where: {
        id: {
          in: uniqueMentionIds,
        },
        OR: [
          {
            banned: false,
          },
          {
            banned: null,
          },
        ],
        AND: [
          {
            OR: [
              {
                role: "superadmin",
              },
              {
                id: access.userId,
              },
              {
                role: "admin",
                courses: {
                  some: {
                    id: access.courseId,
                  },
                },
              },
              {
                role: {
                  in: ["user", "admin"],
                },
                enrollments: {
                  some: {
                    courseId: access.courseId,
                    status: "Active",
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (mentionedUsers.length !== uniqueMentionIds.length) {
      throw new Error(
        "Uma ou mais menções são inválidas."
      );
    }

    if (
      mentionedUsers.some(
        (user) => !text.includes(`@${user.name}`)
      )
    ) {
      throw new Error(
        "As menções devem estar presentes no comentário."
      );
    }

    await tx.forumComment.create({
      data: {
        content: text,
        lessonId,
        userId: access.userId,
        parentId: parentId || null,

        mentions: {
          create: mentionedUsers.map((user) => ({
            userId: user.id,
          })),
        },
      },
    });
  });

  refreshForum(access.courseSlug, lessonId);

  return {
    success: true,
    message: parentId
      ? "Resposta publicada com sucesso!"
      : "Comentário publicado com sucesso!",
  };
}

// ==========================================
// 3. EXCLUIR COMENTÁRIO
// ==========================================

export async function deleteForumComment(
  lessonId: string,
  commentId: string
) {
  const access = await requireForumAccess(lessonId);

  const comment = await prisma.forumComment.findFirst({
    where: {
      id: commentId,
      lessonId,
      deletedAt: null,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment) {
    throw new Error("Comentário não encontrado.");
  }

  const canDelete =
    comment.userId === access.userId ||
    access.canModerate;

  if (!canDelete) {
    throw new Error(
      "Você não possui permissão para excluir este comentário."
    );
  }

  await prisma.$transaction(async (tx) => {
    const result = await tx.forumComment.updateMany({
      where: {
        id: commentId,
        lessonId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new Error("Comentário não encontrado.");
    }

    await tx.forumMention.deleteMany({
      where: {
        commentId,
      },
    });
  });

  refreshForum(access.courseSlug, lessonId);

  return {
    success: true,
    message: "Comentário excluído com sucesso!",
  };
}

// ==========================================
// 4. EDITAR COMENTÁRIO
// ==========================================

export async function editForumComment(
  lessonId: string,
  commentId: string,
  content: string
) {
  const access = await requireForumAccess(lessonId);

  if (!access.canEditAnyComment) {
    throw new Error(
      "Somente superadministradores podem editar comentários."
    );
  }

  const text = validateContent(content);

  await prisma.$transaction(async (tx) => {
    const result = await tx.forumComment.updateMany({
      where: {
        id: commentId,
        lessonId,
        deletedAt: null,
      },
      data: {
        content: text,
      },
    });

    if (result.count === 0) {
      throw new Error("Comentário não encontrado.");
    }

    await tx.forumMention.deleteMany({
      where: {
        commentId,
      },
    });
  });

  refreshForum(access.courseSlug, lessonId);

  return {
    success: true,
    message: "Comentário atualizado com sucesso!",
  };
}

// ==========================================
// 5. PESQUISAR USUÁRIOS PARA MENÇÕES
// ==========================================

export async function searchForumUsers(
  lessonId: string,
  query: string
) {
  const access = await requireForumAccess(lessonId);

  const search = query.trim();

  if (!search || search.length > 100) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },

      OR: [
        {
          banned: false,
        },
        {
          banned: null,
        },
      ],

      AND: [
        {
          OR: [
            {
              role: "superadmin",
            },
            {
              id: access.userId,
            },
            {
              role: "admin",
              courses: {
                some: {
                  id: access.courseId,
                },
              },
            },
            {
              role: {
                in: ["user", "admin"],
              },
              enrollments: {
                some: {
                  courseId: access.courseId,
                  status: "Active",
                },
              },
            },
          ],
        },
      ],
    },

    select: {
      id: true,
      name: true,
      image: true,
      role: true,
    },

    orderBy: {
      name: "asc",
    },

    take: 8,
  });
}