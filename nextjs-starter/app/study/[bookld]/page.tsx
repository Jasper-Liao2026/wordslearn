import { StudyView } from "@/components/study/study-view";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ bookld: string }>;
}) {
  const { bookld } = await params;

  return <StudyView bookld={bookld} />;
}
