import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/results", ({ request }) => {
    const url = new URL(request.url);

    const year = url.searchParams.get("year");
    const bundesland = url.searchParams.get("bundesland");
    const wahlkreis = url.searchParams.get("wahlkreis");

    try {
      // Mock data based on parameters
      if (!year) {
        throw new Error("Year parameter is required");
      }

      if (wahlkreis) {
        // Mock data for wahlkreis filter
        return HttpResponse.json({
          partiesResults: [
            { id: "SPD", firstVotes: 500, secondVotes: 700 },
            { id: "AFD", firstVotes: 400, secondVotes: 600 },
            { id: "CSU", firstVotes: 500, secondVotes: 700 },
            { id: "DIE LINKE", firstVotes: 300, secondVotes: 700 },
          ],
          partiesOldResults: [
            { id: "SPD", firstVotes: 450, secondVotes: 700 },
            { id: "AFD", firstVotes: 420, secondVotes: 600 },
            { id: "CSU", firstVotes: 470, secondVotes: 700 },
            { id: "DIE LINKE", firstVotes: 200, secondVotes: 700 },
          ],
          wahlberechtigte: 1000,
          wahlbeteiligte: 800,
          direktKandidat: {
            name: "Candidate Mustermann",
            party: "SPD",
            bundesland: "BE",
            direktMandat: true,
            UberhangMandat: false,
          },
        });
      }

      if (bundesland) {
        // Mock data for bundesland filter
        return HttpResponse.json({
          partiesResults: [
            { id: "SPD", firstVotes: 500, secondVotes: 700 },
            { id: "AFD", firstVotes: 400, secondVotes: 600 },
            { id: "CSU", firstVotes: 500, secondVotes: 700 },
            { id: "DIE LINKE", firstVotes: 500, secondVotes: 700 },
          ],
          partiesOldResults: [
            { id: "SPD", firstVotes: 500, secondVotes: 700 },
            { id: "AFD", firstVotes: 400, secondVotes: 600 },
            { id: "CSU", firstVotes: 500, secondVotes: 700 },
            { id: "DIE LINKE", firstVotes: 500, secondVotes: 700 },
          ],
          wahlberechtigte: 5000,
          wahlbeteiligte: 4500,
        });
      }

      // Mock data for global results
      return HttpResponse.json({
        partiesResults: [
          { id: "SPD", seats: 206, firstVotes: 10000, secondVotes: 15000 },
          { id: "AFD", seats: 83, firstVotes: 8000, secondVotes: 12000 },
          { id: "FDP", seats: 91, firstVotes: 8000, secondVotes: 12000 },

          { id: "CSU", seats: 45, firstVotes: 500, secondVotes: 700 },
          { id: "CDU", seats: 152, firstVotes: 500, secondVotes: 700 },

          { id: "DIE LINKE", seats: 39, firstVotes: 500, secondVotes: 700 },
          { id: "GRÜNE", seats: 118, firstVotes: 500, secondVotes: 700 },
          { id: "SSW", seats: 1, firstVotes: 500, secondVotes: 700 },
        ],
        partiesOldResults: [
          { id: "SPD", seats: 153, firstVotes: 10000, secondVotes: 15000 },
          { id: "AFD", seats: 94, firstVotes: 8000, secondVotes: 12000 },
          { id: "FDP", seats: 80, firstVotes: 8000, secondVotes: 12000 },

          { id: "CSU", seats: 46, firstVotes: 500, secondVotes: 700 },
          { id: "CDU", seats: 200, firstVotes: 500, secondVotes: 700 },

          { id: "DIE LINKE", seats: 69, firstVotes: 500, secondVotes: 700 },
          { id: "GRÜNE", seats: 67, firstVotes: 500, secondVotes: 700 },
          { id: "SSW", seats: 0, firstVotes: 500, secondVotes: 700 },
        ],
        wahlberechtigte: 20000,
        wahlbeteiligte: 18000,
      });
    } catch (error) {
      console.error("Error in mock handler:", error.message);
    }
  }),

  http.get("/api/delegates/", ({ request }) => {
    const url = new URL(request.url);

    const year = url.searchParams.get("year");
    try {
      // Mock data based on parameters
      if (!year) {
        throw new Error("Year parameter is required");
      }

      // Mock data for wahlkreis filter
      return HttpResponse.json({
        abgeordnete: [
          {
            name: "Max Musterman",
            party: "SPD",
            bundesland: "Berlin",
            direktMandat: "true",
            UberhangMandat: "false",
          },
          {
            name: "Max Musterman2",
            party: "AFD",
            bundesland: "Berlin",
            direktMandat: "true",
            UberhangMandat: "false",
          },
          {
            name: "Max Musterman3",
            party: "CDU",
            bundesland: "Berlin",
            direktMandat: "false",
            UberhangMandat: "true",
          },
          {
            name: "Max Musterman4",
            party: "CSU",
            bundesland: "Berlin",
            direktMandat: "false",
            UberhangMandat: "false",
          },
          {
            name: "Max Musterman5",
            party: "DIE LINKE",
            bundesland: "Berlin",
            direktMandat: "false",
            UberhangMandat: "false",
          },
          {
            name: "Max Musterman6",
            party: "SPD",
            bundesland: "Berlin",
            direktMandat: "true",
            UberhangMandat: "false",
          },
        ],
      });
    } catch (error) {
      console.error("Error in mock handler:", error.message);
    }
  }),

  http.get("/api/q6", ({ request }) => {
    const url = new URL(request.url);

    const year = url.searchParams.get("year");
    try {
      // Mock data based on parameters
      if (!year) {
        throw new Error("Year parameter is required");
      }

      // Mock data for wahlkreis filter
      return HttpResponse.json({
        knappsteSieger: [
          {
            name: "Lars Rohwer",
            partei: "CDU",
            wahlkreis: "160",
            gewonnene_stimmen: 35014,
            sprung: 35,
            vorg_name: "Harlaß Andreas",
            vorg_partei: "AfD",
            vorg_anzahlstimmen: 34979,
          },
          {
            name: "Thomas Hitschler",
            partei: "SPD",
            wahlkreis: "211",
            gewonnene_stimmen: 47901,
            sprung: 41,
            vorg_name: "Dr. Gebhart Thomas",
            vorg_partei: "CDU",
            vorg_anzahlstimmen: 47860,
          },
        ],
        knappsteVerlorene: [
          {
            name: "Astrid Damerow",
            partei: "CDU",
            wahlkreis: "2",
            gewonnene_stimmen: 43745,
            sprung: 34335,
            vorg_name: "Nitsch Sybilla Lena",
            vorg_partei: "SSW",
            vorg_anzahlstimmen: 9410,
          },
          {
            name: "Lars Rohwer",
            partei: "CDU",
            wahlkreis: "160",
            gewonnene_stimmen: 35014,
            sprung: 14303,
            vorg_name: "Dr. Müller Silke",
            vorg_partei: "FDP",
            vorg_anzahlstimmen: 20711,
          },
        ],
      });
    } catch (error) {
      console.error("Error in mock handler:", error.message);
    }
  }),
];
