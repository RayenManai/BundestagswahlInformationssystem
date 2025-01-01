export interface PartyResult {
  id: string;
  seats: number;
  numberOfDirektMandaten: number;
  numberOfUberhangMandaten: number;
  firstVotes: number;
  secondVotes: number;
}

export interface Results {
  partiesResults: PartyResult[];
  partiesOldResults: PartyResult[];
  wahlberechtigte: number;
  wahlbeteiligte: number;
}

export interface WahlkreisResult {
  partiesResults: PartyResultWK[];
  partiesOldResults: PartyResultWK[];
  wahlberechtigte: number;
  wahlbeteiligte: number;
  direktKandidat: Abgeordneter;
}

export interface PartyResultWK {
  id: string;
  firstVotes: number;
  secondVotes: number;
}

export interface Abgeordneter {
  name: string;
  party: string;
  bundesland: string;
  direktMandat: Boolean;
  UberhangMandat: Boolean;
}

export interface Abgeordnete {
  abgeordnete: Abgeordneter[];
}

export const COALITIONS = [
  { name: "Ampel-Koalition", parties: ["SPD", "GRÜNE", "FDP"] },
  { name: "Jamaika-Koalition", parties: ["CDU", "GRÜNE", "FDP"] },
  { name: "Große Koalition", parties: ["CDU", "CSU", "SPD"] },
  { name: "Rot-Grün", parties: ["SPD", "GRÜNE"] },
  { name: "Rot-Rot-Grün", parties: ["SPD", "DIE LINKE", "GRÜNE"] },
  { name: "Schwarz-Gelb", parties: ["CDU", "CSU", "FDP"] },
];

export interface KnappsteMandate {
  name: string;
  partei: string;
  wahlkreis: string;
  gewonnene_stimmen: number;
  sprung: number;
  vorg_name: string;
  vorg_partei: string;
  vorg_anzahlstimmen: number;
}

export interface Statistik1 {
  knappsteSieger: KnappsteMandate[];
  knappsteVerlorene: KnappsteMandate[];
}

export interface Statistik2 {
  wahlkreisId: number;
  weighted_age: number;
  weighted_direction: number;
}

export interface Statistik3 {
  anzahl_stimmen_grune: number;
  percent_stimmen_grune: number;
  pkw_elektro_hybrid_percent: number;
  wahlkreisId: number;
}
