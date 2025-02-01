import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    de: {
      translation: {
        Ergebnisse: "Ergebnisse",
        Abgeordnete: "Abgeordnete",
        Statistiken: "Statistiken",
        Jahr: "Jahr",
        Bundesland: "Bundesland",
        Wahlkreis: "Wahlkreis",
        Aggregiert: "Aggregiert",
        Bundestagswahl: "Bundestagswahl",
        Bundestag: "Bundestag",
        Alle: "Alle",
        Sitzverteilung: "Sitzverteilung",
        Partei: "Partei",
        Sitze: "Sitze",
        "Differenz zu Vorwahl": "Differenz zu Vorwahl",
        Wahlbeteiligung: "Wahlbeteiligung",
        Wahlberechtigte: "Wahlberechtigte",
        Wahlbeteiligte: "Wahlbeteiligte",
        Erststimmen: "Erststimmen",
        Zweitstimmen: "Zweitstimmen",
        "Mögliche Koalitionen": "Mögliche Koalitionen",
        Direktmandat: "Direktmandat",
        Name: "Name",
        "Fehler beim Laden, bitte später erneut versuchen":
          "Fehler beim Laden, bitte später erneut versuchen",
        "Nicht-Teilgenommen": "Nicht-Teilgenommen",
        "Knappste Sieger": "Knappste Sieger",
        "Politische Richtung vs. Durchschnittsalter der Wahlkreise":
          "Politische Richtung vs. Durchschnittsalter der Wahlkreise",
        "Verhältnis von GRÜNEN-Zweitstimmen zu Elektro-/Hybrid-PKWs":
          "Verhältnis von GRÜNEN-Zweitstimmen zu Elektro-/Hybrid-PKWs",
        knap_verlierer:
          "Sollte eine Partei keinen Wahlkreis gewonnen haben, sollen stattdessen die Wahlkreise ausgegeben werden, in denen sie am knappsten verloren hat.",
        knap_sieger:
          "Top 10 der knappsten Sieger: Die knappsten Sieger sind die gewählten Erstkandidaten, welche mit dem geringsten Vorsprung gegen- uber ihren Konkurrenten gewonnen haben.",
        "Gewonnene Stimmen": "Gewonnene Stimmen",
        Abstand: "Abstand",
        "Vorgänger Name": "Vorgänger Name",
        loader_text: "Ergebnisse werden geladen...",
        Überhangmandat: "Überhangmandat",
        Wahlkreise: "Wahlkreise",
        "Alter vs. Politische Richtung": "Alter vs. Politische Richtung",
        "Politische Richtung": "Politische Richtung",
        Durchschnittsalter: "Durchschnittsalter",
        "Elektro-/Hybrid-PKWs": "Elektro-/Hybrid-PKWs",
        "GRÜNEN-Zweitstimmen und Elektromobilität im Wahlkreis":
          "GRÜNEN-Zweitstimmen und Elektromobilität im Wahlkreis",
        "GRÜNEN-Anteil": "GRÜNEN-Anteil",
        "Anteil Elektro-/Hybrid-PKWs (%)": "Anteil Elektro-/Hybrid-PKWs (%)",
        "Anteil der GRÜNEN-Zweitstimmen (%)":
          "Anteil der GRÜNEN-Zweitstimmen (%)",
        "Keine Daten vorhanden": "Keine Daten vorhanden",
      },
    },
    en: {
      translation: {
        Ergebnisse: "Results",
        Abgeordnete: "Members",
        Statistiken: "Statistics",
        Jahr: "Year",
        Bundesland: "State",
        Wahlkreis: "District",
        Aggregiert: "Aggregated",
        Bundestagswahl: "Federal Election",
        Bundestag: "Federal Parliament",
        Alle: "All",
        Sitzverteilung: "Seat Distribution",
        Partei: "Party",
        Sitze: "Seats",
        "Differenz zu Vorwahl": "Difference to previous election",
        Wahlbeteiligung: "Voter Turnout",
        Wahlberechtigte: "Wahlberechtigte",
        Wahlbeteiligte: "Eligible Voters",
        Erststimmen: "First Votes",
        Zweitstimmen: "Second Votes",
        "Mögliche Koalitionen": "Possible coalitions",
        Direktmandat: "Direct Mandate",
        Name: "Name",
        "Fehler beim Laden, bitte später erneut versuchen":
          "Error loading, please try again later",
        "Nicht-Teilgenommen": "Not Participated",
        "Knappste Sieger": "Closest Winners",
        "Politische Richtung vs. Durchschnittsalter der Wahlkreise":
          "Political direction vs. average age of constituencies",
        "Verhältnis von GRÜNEN-Zweitstimmen zu Elektro-/Hybrid-PKWs":
          "Ratio of GREEN second votes to electric/hybrid cars",
        knap_verlierer:
          "If a party has not won a constituency, the constituencies in which it lost the most narrowly should be announced instead.",
        knap_sieger:
          "Top 10 closest winners: The closest winners are the first-time elected candidates who won by the smallest margin over their competitors.",
        "Gewonnene Stimmen": "Winner Votes",
        Abstand: "Difference",
        "Vorgänger Name": "Predecessor Name",
        loader_text: "Loading results ...",
        Überhangmandat: "Overhang seat",
        Wahlkreise: "Constituencies",
        "Alter vs. Politische Richtung": "Age vs. Political Orientation",
        "Politische Richtung": "Political Orientation",
        Durchschnittsalter: "Average age",
        "Elektro-/Hybrid-PKWs": "electric/hybrid cars",
        "GRÜNEN-Zweitstimmen und Elektromobilität im Wahlkreis":
          "GRÜNEN second votes and electromobility in the constituency",
        "GRÜNEN-Anteil": "GRÜNEN percentage",
        "Anteil Elektro-/Hybrid-PKWs (%)":
          "Share of electric/hybrid cars (%) (%)",
        "Anteil der GRÜNEN-Zweitstimmen (%)":
          "share of GRÜNEN second votes (%)",
        "Keine Daten vorhanden": "No data available",
      },
    },
  },
  fallbackLng: "de", // Default language
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
