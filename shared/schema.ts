import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the schema for location data
const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Define the schema for screen information
const screenInfoSchema = z.object({
  width: z.number(),
  height: z.number(),
  orientation: z.string(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  caption: text("caption").notNull(),
  imageUrl: text("image_url").notNull(),
  location: jsonb("location").$type<z.infer<typeof locationSchema> | null>(),
  screenInfo: jsonb("screen_info").$type<z.infer<typeof screenInfoSchema>>().notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  shareId: text("share_id").unique(),
  isShared: boolean("is_shared").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// First create the base schema
const baseEntrySchema = createInsertSchema(diaryEntries)
  .omit({ id: true, createdAt: true });

// Then extend it with captionText
export const insertEntrySchema = baseEntrySchema.extend({
  captionText: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDiaryEntry = z.infer<typeof insertEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
