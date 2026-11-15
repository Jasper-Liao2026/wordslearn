export type Book = {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookld: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Word = {
  id: number;
  wordRand: number;
  headWord: string;
  content: unknown;
  bookld: string;
};

export type AppUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type BookProgress = {
  id: string;
  userId: string;
  bookld: string;
  lastWordRank: number;
  learnedCount: number;
  completed: boolean;
  lastStudiedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgressEntry = {
  progress: BookProgress;
  book: Book;
};

export type SaveProgressResult = {
  progress: BookProgress;
  nextWord: Word | null;
  total: number;
};
