
import { requireStudent } from "@/app/data/student/require-student";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStudent();

  return <>{children}</>;
}
