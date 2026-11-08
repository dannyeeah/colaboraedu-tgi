import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  AdminCourseCardSkeleton,
  AdmincourseCard,
} from "./_components/AdminCourseCard";
import { EmptyState } from "@/components/general/EmptyStae";
import { Suspense } from "react";

export default function CoursesPages() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seus Cursos</h1>

        <Link className={buttonVariants()} href="/admin/courses/create">
          Criar cursos
        </Link>
      </div>

      <Suspense fallback={<AdminCourseCardSkeletonLayout />}>
        <RenderCourses />
      </Suspense>
    </>
  );
}

async function RenderCourses() {
  const data = await adminGetCourses();

  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          title="Nenhum curso encontrado"
          description="Crie um novo curso para começar"
          buttonText="Criar Curso"
          href="/admin/courses/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
          {data.map((course) => (
            <AdmincourseCard key={course.id} data={course} />
          ))}
        </div>
      )}
    </>
  );
}

function AdminCourseCardSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
      {Array.from({ length: 4 }).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
