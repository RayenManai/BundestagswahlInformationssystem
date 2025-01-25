
import { http, HttpResponse } from "msw";

// Mock handler for the /token endpoint

export const handlers = [
    /*
  http.post(`${process.env.REACT_APP_API_URL}/token`, async ({ request }) => {
    const { hash, wahlkreis } = await request.json();
    if (hash && wahlkreis) {
      return HttpResponse.json(
        { token: "mocked-token-12345" },
        { status: 201 }
      );
    }

    return HttpResponse.json({ message: "already voted" }, { status: 400 });
  }),

  http.post(`${process.env.REACT_APP_API_URL}/auth`, async ({ request }) => {
    const { token } = await request.json();

    if (token === "valid-token") {
      const firstVote = [
        {
          id: "1",
          titel: "Dr.",
          name: "Müller",
          vorname: "Hans",
          parteiKurz: "SPD",
          partei: "Sozialdemokratische Partei Deutschlands",
        },
        {
          id: "2",
          titel: "Prof.",
          name: "Schmidt",
          vorname: "Julia",
          parteiKurz: "CDU",
          partei: "Christlich Demokratische Union Deutschlands",
        },
        {
          id: "3",
          titel: "Dr.",
          name: "Müller",
          vorname: "Hans",
          parteiKurz: "SPD",
          partei: "Sozialdemokratische Partei Deutschlands",
        },
        {
          id: "4",
          titel: "Prof.",
          name: "Schmidt",
          vorname: "Julia",
        },
      ];

      const secondVote = [
        {
          id: "1",
          name: "Sozialdemokratische Partei Deutschlands",
          kurzbezeichnung: "SPD",
          parteiListe: [
            { titel: "Dr.", name: "Müller", vorname: "Hans" },
            { titel: "Prof.", name: "Schmidt", vorname: "Julia" },
          ],
        },
        {
          id: "2",
          name: "Christlich Demokratische Union Deutschlands",
          kurzbezeichnung: "CDU",
          parteiListe: [{ titel: "Prof.", name: "Schmidt", vorname: "Julia" }],
        },
        {
          id: "3",
          name: "Christlich Demokratische Union Deutschlands",
          kurzbezeichnung: "CDU",
          parteiListe: [{ titel: "Prof.", name: "Schmidt", vorname: "Julia" }],
        },
      ];

      return HttpResponse.json({ firstVote, secondVote }, { status: 201 });
    }

    // If the token is invalid, simulate an error response
    return HttpResponse.json({ message: "invalid token" }, { status: 400 });
  }),

  http.post(`${process.env.REACT_APP_API_URL}/vote`, async ({ request }) => {
    const { token, firstVote, secondVote } = await request.json();

    // Validate the token and votes
    if (token && Array.isArray(firstVote) && Array.isArray(secondVote)) {
      // Mock a success response
      return HttpResponse.json(
        { message: "Vote successfully submitted." },
        { status: 201 }
      );
    }

    // Mock an error response
    return HttpResponse.json(
      { message: "Invalid vote data or token." },
      { status: 400 }
    );
  }),
     */
];
