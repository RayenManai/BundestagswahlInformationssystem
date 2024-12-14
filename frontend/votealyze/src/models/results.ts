export interface PartyResult {
  id: string;
  seats: number;
  firstVotes: number;
  secondVotes: number;
}

export interface GlobalResults {
  parties: PartyResult[];
}

export interface BunedslandResult {
  id: string;
  votes: number;
}

export interface BundeslandResults {
  bundeslandResults: BunedslandResult[];
}

export interface WahlkreisResult {
  id: string;
  votes: number;
}

export interface WahlkreisResults {
  wahlkreisResults: WahlkreisResult[];
}

export interface Abgeordneter {
  name: string;
  party: string;
  bundesland: string;
  wahlkreis: string;
  direktMandat: Boolean;
  UberhangMandat: Boolean;
}
