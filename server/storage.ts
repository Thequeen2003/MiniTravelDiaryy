import { DiaryEntry, InsertDiaryEntry } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getEntriesByUserId(userId: string): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  createEntry(entry: Omit<InsertDiaryEntry, "id">): Promise<DiaryEntry>;
  deleteEntry(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, DiaryEntry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async getEntriesByUserId(userId: string): Promise<DiaryEntry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    return this.entries.get(id);
  }

  async createEntry(entryData: Omit<InsertDiaryEntry, "id">): Promise<DiaryEntry> {
    const id = this.currentId++;
    const now = new Date();
    
    const newEntry: DiaryEntry = {
      id,
      userId: entryData.userId,
      caption: entryData.caption,
      imageUrl: entryData.imageUrl,
      location: entryData.location,
      screenInfo: entryData.screenInfo,
      createdAt: now.toISOString(),
    };
    
    this.entries.set(id, newEntry);
    return newEntry;
  }

  async deleteEntry(id: number): Promise<void> {
    this.entries.delete(id);
  }
}

export const storage = new MemStorage();
