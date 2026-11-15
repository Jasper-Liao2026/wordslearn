import { WordDetailView } from "@/components/word/word-detail-view";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ bookld: string; wordRank: string }>;
}) {
  const { bookld, wordRank } = await params;

  return <WordDetailView bookld={bookld} wordRank={Number(wordRank)} />;
}
