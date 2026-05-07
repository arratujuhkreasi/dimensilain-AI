export type SubGenre =
  | "gore"
  | "supernatural"
  | "psychological"
  | "found-footage"
  | "slasher"
  | "cosmic-horror"
  | "folk-horror";

export type Duration = 15 | 30 | 60 | 90;

export type JumpScareDensity = "low" | "medium" | "extreme";

export type CharacterRole = "protagonist" | "antagonist" | "supporting" | "victim";

export interface Character {
  id: string;
  name: string;
  physicalDescription: string;
  weakness: string;
  role: CharacterRole;
}

export interface ProductionConstraints {
  maxLocations: number;
  maxActors: number;
  additionalNotes: string;
}

export interface ProjectConfig {
  title: string;
  logline: string;
  subGenre: SubGenre;
  characters: Character[];
  setting: string;
  settingDetails: string;
  duration: Duration;
  jumpScareDensity: JumpScareDensity;
  constraints: ProductionConstraints;
}
