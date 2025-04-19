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
    console.log('Storage: Creating new entry with data:', {
      userId: entryData.userId,
      caption: entryData.caption,
      hasImage: !!entryData.imageUrl,
      hasLocation: !!entryData.location
    });
    
    try {
      const id = this.currentId++;
      const now = new Date();
      
      // Default values if data is missing
      const imageUrl = entryData.imageUrl || 'https://example.com/placeholder.jpg';
      const caption = entryData.caption || 'My travel memory';
      
      const newEntry: DiaryEntry = {
        id,
        userId: entryData.userId,
        caption: caption,
        imageUrl: imageUrl,
        location: entryData.location ? entryData.location : null,
        screenInfo: entryData.screenInfo ? entryData.screenInfo : {
          width: 0,
          height: 0,
          orientation: 'unknown'
        },
        createdAt: now.toISOString(),
      };
      
      console.log('Storage: Entry created with ID:', id);
      this.entries.set(id, newEntry);
      return newEntry;
    } catch (error) {
      console.error('Storage: Error creating entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: number): Promise<void> {
    this.entries.delete(id);
  }
}

export const storage = new MemStorage();
