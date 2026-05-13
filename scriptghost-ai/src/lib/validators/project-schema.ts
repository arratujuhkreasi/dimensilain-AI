import { z } from "zod";

export const characterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama karakter wajib diisi"),
  ageRange: z.string().optional().default(""),
  talentCriteria: z.string().optional().default(""),
  physicalDescription: z.string().optional().default(""),
  weakness: z.string().optional().default(""),
  specialSkills: z.string().optional().default(""),
  role: z.enum(["protagonist", "antagonist", "supporting", "victim"]),
});

export const projectConfigSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  logline: z.string().min(10, "Logline minimal 10 karakter"),
  subGenre: z.enum([
    "gore",
    "supernatural",
    "psychological",
    "found-footage",
    "slasher",
    "cosmic-horror",
    "folk-horror",
  ]),
  characters: z.array(characterSchema).min(1, "Minimal 1 karakter"),
  setting: z.string().min(1, "Setting wajib diisi"),
  settingDetails: z.string(),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(90)]),
  jumpScareDensity: z.enum(["low", "medium", "extreme"]),
  constraints: z.object({
    maxLocations: z.number().min(1).max(20),
    maxActors: z.number().min(1).max(30),
    additionalNotes: z.string(),
  }),
});

export type ProjectConfigInput = z.infer<typeof projectConfigSchema>;
