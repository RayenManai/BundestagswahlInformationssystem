export interface Kandidat {
  id: string;
  titel: string;
  name: string;
  vorname: string;
  parteiKurz?: string;
  partei?: string;
}

export interface ListenKandidat {
  titel: string;
  name: string;
  vorname: string;
}

export interface Partei {
  id: string;
  name: string;
  kurzbezeichnung: string;
  parteiListe: ListenKandidat[];
}

export interface Stimmzettel {
  firstVote: Kandidat[];
  secondVote: Partei[];
}
