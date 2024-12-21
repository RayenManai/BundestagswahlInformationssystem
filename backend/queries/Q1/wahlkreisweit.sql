SELECT p.kurzbezeichnung, z.gesamtstimmen, sum(d.anzahlstimmen) AS erststimmen
FROM "Partei" p, "ZweitstimmeErgebnisse" z, "DirektKandidatur" d, "Wahlkreis" w, "Kandidat" k, gewahlte_direkt_kandidaten_2017 g
WHERE p."parteiId" = z."parteiId" AND p."parteiId" = l."parteiId" AND z.bundesland = l.bundesland AND d.jahr = :year
    AND w.bundesland = l.bundesland AND d."wahlkreisId" = w."wahlkreisId" AND k."kandidatId" = d."kandidatId"
    AND k."parteiId" = p."parteiId" AND l.bundesland = :bundesland
GROUP BY p.kurzbezeichnung, l.sitze, l.direktmandate, l.ueberhang, z.gesamtstimmen, l.bundesland