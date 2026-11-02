import { fixtures, Fixture } from "../data/demo";
export interface SportsProvider {
  readonly mode: "demo" | "live";
  getFixtures(sport?: string): Promise<Fixture[]>;
  getFixture(id: string): Promise<Fixture | undefined>;
}
// Samples are available through the explicitly labelled demo view. Provider data
// uses football.ts and server/football.mjs; credentials never belong in Expo.
export const demoProvider: SportsProvider = {
  mode: "demo",
  async getFixtures(sport) {
    return fixtures.filter((f) => !sport || f.sport === sport);
  },
  async getFixture(id) {
    return fixtures.find((f) => f.id === id);
  },
};
