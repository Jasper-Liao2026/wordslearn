import type { Word } from "@/lib/app/types";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function array<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * words.content 的典型结构：{ word: { wordHead, content: {...} } }
 * 兼容部分数据直接以 content 对象存储的情况。
 */
function rootContent(word: Word): UnknownRecord | null {
  const raw = word.content;
  const parsed = typeof raw === "string" ? safeParse(raw) : raw;
  const root = record(parsed);
  const inner = record(record(root?.word)?.content);

  return inner ?? root;
}

export type WordCardData = {
  headWord: string;
  phone: string | null;
  tranCn: string;
  sentence: { sContent: string; sCn?: string } | null;
};

export function parseWordCard(word: Word): WordCardData {
  const content = rootContent(word);
  const trans = array<UnknownRecord>(content?.trans);
  const sentences = array<UnknownRecord>(record(content?.sentence)?.sentences);
  const usphone = str(content?.usphone);
  const ukphone = str(content?.ukphone);
  const phone = str(content?.phone);
  const primaryPhone = usphone ?? ukphone ?? phone;

  return {
    headWord: word.headWord || str(record(record(word.content)?.word)?.wordHead) || "",
    phone: primaryPhone ? `/${primaryPhone}/` : null,
    tranCn: str(trans[0]?.tranCn) ?? "暂无释义",
    sentence: sentences[0]
      ? {
          sContent: str(sentences[0].sContent) ?? "",
          sCn: str(sentences[0].sCn),
        }
      : null,
  };
}

export type WordDetailData = {
  headWord: string;
  usphone?: string;
  ukphone?: string;
  phone?: string;
  trans: { pos?: string; tranCn: string; tranOther?: string }[];
  sentences: { sContent: string; sCn?: string }[];
  phrases: { pContent: string; pCn?: string }[];
  synos: { pos?: string; tran?: string; words: string[] }[];
  relWords: { pos?: string; items: { hwd: string; tran?: string }[] }[];
};

export function parseWordDetail(word: Word): WordDetailData {
  const content = rootContent(word);

  return {
    headWord: word.headWord || str(record(record(word.content)?.word)?.wordHead) || "",
    usphone: str(content?.usphone),
    ukphone: str(content?.ukphone),
    phone: str(content?.phone),
    trans: array<UnknownRecord>(content?.trans)
      .map((item) => ({
        pos: str(item?.pos),
        tranCn: str(item?.tranCn) ?? "",
        tranOther: str(item?.tranOther),
      }))
      .filter((item) => item.tranCn),
    sentences: array<UnknownRecord>(record(content?.sentence)?.sentences)
      .map((item) => ({
        sContent: str(item?.sContent) ?? "",
        sCn: str(item?.sCn),
      }))
      .filter((item) => item.sContent),
    phrases: array<UnknownRecord>(record(content?.phrase)?.phrases)
      .map((item) => ({
        pContent: str(item?.pContent) ?? "",
        pCn: str(item?.pCn),
      }))
      .filter((item) => item.pContent),
    synos: array<UnknownRecord>(record(content?.syno)?.synos)
      .map((item) => ({
        pos: str(item?.pos),
        tran: str(item?.tran),
        words: array<UnknownRecord>(item?.hwds)
          .map((hw) => str(hw?.w))
          .filter((value): value is string => Boolean(value)),
      }))
      .filter((item) => item.words.length > 0),
    relWords: array<UnknownRecord>(record(content?.relWord)?.rels)
      .map((item) => ({
        pos: str(item?.pos),
        items: array<UnknownRecord>(item?.words)
          .map((rel) => ({ hwd: str(rel?.hwd) ?? "", tran: str(rel?.tran) }))
          .filter((rel) => rel.hwd),
      }))
      .filter((item) => item.items.length > 0),
  };
}
