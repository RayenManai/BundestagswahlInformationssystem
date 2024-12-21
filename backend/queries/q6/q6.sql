/*
 Stellt die Top 10 der knappsten Sieger fur alle Parteien dar. Die knappsten Sieger
sind die gewählten Erstkandidaten, welche mit dem geringsten Vorsprung gegen-
uber ihren Konkurrenten gewonnen haben. Sollte eine Partei keinen Wahlkreis
gewonnen haben, sollen stattdessen die Wahlkreise ausgegeben werden, in denen
sie am knappsten verloren hat.

output: first 10 rows: Top 10 der knappsten Sieger, the next rows are one for each party (nach Hurde) that did not win any Wahlkreis
 */

with besterZweiKandidatenProBundesland_2021 AS
    (SELECT
    k.Titel,
    k.vorname,
    k.name,
    p.kurzbezeichnung AS partei,
    wk."wahlkreisId" AS wahlkreisId,
    dk.anzahlStimmen AS gewonnene_stimmen
FROM
    "DirektKandidatur" dk
    JOIN "Kandidat" k ON k."kandidatId" = dk."kandidatId"
    JOIN "Wahlkreis" wk ON wk."wahlkreisId" = dk."wahlkreisId"
    LEFT JOIN "Partei" p ON p."parteiId" = k."parteiId" -- Allow for candidates without a party
WHERE
    dk.jahr = 2021
    AND(dk.anzahlStimmen = (
        SELECT MAX(dk2.anzahlStimmen)
        FROM "DirektKandidatur" dk2
        WHERE dk2."wahlkreisId" = dk."wahlkreisId" AND dk2.jahr = 2021
    ) OR (SELECT count(*) FROM "DirektKandidatur" dk3
        WHERE dk3."wahlkreisId" = dk."wahlkreisId" and dk3.anzahlstimmen > dk.anzahlstimmen AND dk3.jahr = 2021) = 1)),
knappeste_Sieger as (SELECT b1.*, abs(b1.gewonnene_stimmen - b2.gewonnene_stimmen) as sprung, b2.titel as vorg_titel, b2.name as vorg_name, b2.vorname as vorg_vorname, b2.partei as vorg_partei, b2.gewonnene_stimmen as vorg_anzahlStimmen from besterZweiKandidatenProBundesland_2021 b1, besterZweiKandidatenProBundesland_2021 b2
                  where b1.wahlkreisId = b2.wahlkreisId and b1.partei != b2.partei
                  and b1.gewonnene_stimmen = (SELECT MAX(dk2.anzahlStimmen)
        FROM "DirektKandidatur" dk2
        WHERE dk2."wahlkreisId" = b1.wahlkreisId AND dk2.jahr = 2021)  order by sprung asc limit 10),
    keineGewinnerParteien as (
        select "parteiId"
        from "Ergebnisse"
        where "direktMandate" = 0 AND jahr = 2021
    ),
keineGewinnerParteienSprunge as (
    select gdk.titel, gdk.vorname, gdk.name, gdk."parteiName" as partei, gdk."wahlkreisId" as wahlkreisid, gdk.anzahlstimmen as gewonnene_stimmen, (gdk.anzahlstimmen - dk.anzahlstimmen) as sprung, k.titel as vorg_titel, k.name as vorg_name, k.vorname as vorg_vorname,p.kurzbezeichnung as vorg_partei , dk.anzahlstimmen as vorg_anzahlStimmen
    from (select *
          from "DirektKandidatur" d2, "Kandidat" k2, "Partei" p3
          where anzahlstimmen = (select max(d3.anzahlstimmen) from "DirektKandidatur" d3 where d3.jahr = d2.jahr and d3."wahlkreisId" = d2."wahlkreisId")
          And p3."parteiId" = k2."parteiId" AND k2."kandidatId" = d2."kandidatId" AND jahr=2021) gdk, keineGewinnerParteien kp, "DirektKandidatur" dk, "Wahlkreis" wk, "Kandidat" k
    JOIN "Partei" p ON p."parteiId" = k."parteiId"
WHERE
    dk.jahr = 2021 AND kp."parteiId" = k."parteiId" AND k."kandidatId" = dk."kandidatId" AND wk."wahlkreisId" = dk."wahlkreisId"
  AND gdk."wahlkreisId" = dk."wahlkreisId"
)

select * from knappeste_Sieger
union all
select * from keineGewinnerParteienSprunge k1
          group by k1.titel, k1.vorname, k1.name, k1.partei, k1.wahlkreisid, k1.gewonnene_stimmen, k1.vorg_partei, k1.sprung, k1.vorg_titel, k1.vorg_name, k1.vorg_vorname, k1.vorg_anzahlStimmen
          having sprung = (select min(sprung) from keineGewinnerParteienSprunge k2 where k1.vorg_partei = k2.vorg_partei)


