SELECT p.kurzbezeichnung AS "Partei_kurzbezeichnung", e."anzahlSitze" AS "Ergebnisse_anzahlSitze",
       e."direktMandate" AS "Ergebnisse_direktMandate",
       e."ueberhangsMandate" AS "Ergebnisse_ueberhangsMandate",
       sum(z.anzahlstimmen) AS zweitstimmen, sum(d.anzahlstimmen) AS erststimmen
FROM "Partei" p, "Ergebnisse" e, "ZweitstimmeErgebnisse" z, "DirektKandidatur" d, "Kandidat" k
WHERE p."parteiId" = e."parteiId" AND p."parteiId" = z."parteiId"
  AND p."parteiId" = k."parteiId" AND e.jahr = :year AND z.jahr = :year
  AND d.jahr = :year AND d."kandidatId" = k."kandidatId"
  AND d."wahlkreisId" = z."wahlkreisId"
 GROUP BY p."parteiId", e."anzahlSitze", e."direktMandate", e."ueberhangsMandate"