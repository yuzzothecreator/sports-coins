import { fixtures, Fixture } from "../data/demo";
export interface SportsProvider {
  readonly mode: "demo" | "live";
  getFixtures(sport?: string): Promise<Fixture[]>;
  getFixture(id: string): Promise<Fixture | undefined>;
}
// UI uses static demo fixtures in milestone 1. Future API adapters implement this
// contract through a server endpoint; provider credentials never belong in Expo.
export const demoProvider: SportsProvider = {
  mode: "demo",
  async getFixtures(sport) {
    return fixtures.filter((f) => !sport || f.sport === sport);
  },
  async getFixture(id) {
    return fixtures.find((f) => f.id === id);
  },
};
