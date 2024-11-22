CREATE VIEW Oberverteilung AS(
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Start with the initial divisor and calculate initial seats
    SELECT
        b.kurzbezeichnung,
        b.bevoelkerung,
        (SELECT SUM(bevoelkerung) FROM "BundeslandStruktur" WHERE jahr = 2021) / 598.0 AS divisor,
        ROUND(b.bevoelkerung / ((SELECT SUM(bevoelkerung) FROM "BundeslandStruktur" WHERE jahr = 2021) / 598.0)) AS Sitzkontingente,
        0 AS iteration,
        (SELECT SUM(ROUND(bevoelkerung /
                          ((SELECT SUM(bevoelkerung) FROM "BundeslandStruktur" WHERE jahr = 2021) / 598.0)))
         FROM "BundeslandStruktur"
         WHERE jahr = 2021) AS total_sitze
    FROM "BundeslandStruktur" b
    WHERE b.jahr = 2021

    UNION ALL

    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        b.kurzbezeichnung,
        b.bevoelkerung,
        CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s.total_sitze < 598 THEN
                b.bevoelkerung / (ROUND(s.Sitzkontingente) + 0.5)
            ELSE
                b.bevoelkerung / (ROUND(s.Sitzkontingente) - 0.5)
        END AS divisor,
        ROUND(b.bevoelkerung /
              CASE
                  WHEN s.total_sitze < 598 THEN
                      b.bevoelkerung / (ROUND(s.Sitzkontingente) + 0.5)
                  ELSE
                      b.bevoelkerung / (ROUND(s.Sitzkontingente) - 0.5)
              END
        ) AS Sitzkontingente,
        s.iteration + 1,
        (SELECT SUM(ROUND(b2.bevoelkerung /
                          CASE
                              WHEN s.total_sitze < 598 THEN
                                  b2.bevoelkerung / (ROUND(s.Sitzkontingente) + 0.5)
                              ELSE
                                  b2.bevoelkerung / (ROUND(s.Sitzkontingente) - 0.5)
                          END))
         FROM "BundeslandStruktur" b2
         WHERE b2.jahr = 2021) AS total_sitze
    FROM Sitzverteilung s
    JOIN "BundeslandStruktur" b ON s.kurzbezeichnung = b.kurzbezeichnung
    WHERE s.total_sitze <> 598 AND iteration < 10
)

-- Final output: The seat allocation when the iteration is complete
-- SELECT
--    *
-- FROM Sitzverteilung
-- ORDER BY kurzbezeichnung);

SELECT
s.kurzbezeichnung,
s.bevoelkerung,
ROUND(b.bevoelkerung /(SELECT s.divisor from Sitzverteilung s WHERE s.total_sitze=598 LIMIT 1)) as sitze
FROM Sitzverteilung s, "BundeslandStruktur" b
                                 WHERE s.kurzbezeichnung = b.kurzbezeichnung);

-- -------
CREATE VIEW Partei_Gesamt_Zweitstimmen_2021 AS
SELECT
    p."parteiId",
    p.kurzbezeichnung AS partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM "ZweitstimmeErgebnisse" zse_inner
         WHERE zse_inner.jahr = 2021)) AS percentage
FROM
    "ZweitstimmeErgebnisse" zse
    JOIN "Partei" p ON zse."parteiId" = p."parteiId"
WHERE
    zse.jahr = 2021
GROUP BY
    p."parteiId", p.kurzbezeichnung;


CREATE VIEW Gewahlte_direkt_kandidaten_2021 AS
SELECT
    k.Titel,
    k.vorname,
    k.name,
    p."parteiId",
    p.kurzbezeichnung AS partei,
    wk."wahlkreisName" AS wahlkreis,
    dk.anzahlStimmen AS gewonnene_stimmen,
    (dk.anzahlStimmen * 100.0 /
        (SELECT SUM(dk2.anzahlStimmen)
         FROM "DirektKandidatur" dk2
         WHERE dk2."wahlkreisId" = dk."wahlkreisId"
         AND dk2.jahr = 2021)) AS stimmanteil_prozent
FROM
    "DirektKandidatur" dk
    JOIN "Kandidat" k ON k."kandidatId" = dk."kandidatId"
    JOIN "Wahlkreis" wk ON wk."wahlkreisId" = dk."wahlkreisId"
    LEFT JOIN "Partei" p ON p."parteiId" = k."parteiId" -- Allow for candidates without a party
WHERE
    dk.jahr = 2021
    AND dk.anzahlStimmen = (
        SELECT MAX(dk2.anzahlStimmen)
        FROM "DirektKandidatur" dk2
        WHERE dk2."wahlkreisId" = dk."wahlkreisId" AND dk2.jahr = 2021
    );


CREATE VIEW Parteien_Nach_Huerde_2021 AS
SELECT
    pzs."parteiId",
    pzs.partei
FROM Partei_Gesamt_Zweitstimmen_2021 pzs
WHERE pzs.percentage >= 5
   OR (
       SELECT COUNT(*)
       FROM Gewahlte_direkt_kandidaten_2021 gdk
       WHERE gdk."parteiId" = pzs."parteiId"
   ) >= 3 OR pzs.partei = 'SSW';


CREATE VIEW Partei_Gesamt_Zweitstimmen_neu_2021 AS
SELECT
    pnh."parteiId",
    pnh.partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM "ZweitstimmeErgebnisse" zse_inner
         JOIN Parteien_Nach_Huerde_2021 pnh_inner ON zse_inner."parteiId" = pnh_inner."parteiId"
         WHERE zse_inner.jahr = 2021)) AS neue_percentage
FROM
    "ZweitstimmeErgebnisse" zse
    JOIN Parteien_Nach_Huerde_2021 pnh ON zse."parteiId" = pnh."parteiId"
WHERE
    zse.jahr = 2021
GROUP BY
    pnh."parteiId", pnh.partei;


CREATE VIEW Partei_Bundesland_Zweitstimmen_neu_2021 AS
SELECT
    pnh."parteiId",
    pnh.partei,
    wk.bundesland,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM "ZweitstimmeErgebnisse" zse_inner
         JOIN Parteien_Nach_Huerde_2021 pnh_inner ON zse_inner."parteiId" = pnh_inner."parteiId"
         WHERE zse_inner.jahr = 2021)) AS neue_percentage
FROM
    "ZweitstimmeErgebnisse" zse
    JOIN Parteien_Nach_Huerde_2021 pnh ON zse."parteiId" = pnh."parteiId"
    JOIN "Wahlkreis" wk ON zse."wahlkreisId" = wk."wahlkreisId"
WHERE
    zse.jahr = 2021
GROUP BY
    pnh."parteiId", pnh.partei, wk.bundesland
having SUM(zse.anzahlstimmen) <> 0;

-------

CREATE VIEW SH_Parteien_Sitzverteilung AS (
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Calculate the initial divisor and allocate initial seats
    SELECT
        p.partei,
        p.bundesland,
        p.gesamtstimmen,
        (SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE p2.bundesland = 'SH') / 22.0 AS divisor,
        -- Calculate initial seat allocation
        ROUND(p.gesamtstimmen / (
            (SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p2
             WHERE p2.bundesland = 'SH') / 22.0
        )) AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties in SH
        (SELECT SUM(ROUND(p2.gesamtstimmen / (
            (SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p3
             WHERE p3.bundesland = 'SH') / 22.0
        )))
         FROM partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE p2.bundesland = 'SH') AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2021 p
    WHERE p.bundesland = 'SH'

    UNION ALL

    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
           p.partei,
        p.bundesland,
        p.gesamtstimmen,
        CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s.total_sitze < 22 THEN
                p.gesamtstimmen / (ROUND(s.sitze) + 0.5)
            ELSE
                p.gesamtstimmen / (ROUND(s.sitze) - 0.5)
        END AS divisor,
        ROUND(p.gesamtstimmen /
              CASE
                  WHEN s.total_sitze < 22 THEN
                      p.gesamtstimmen / (ROUND(s.sitze) + 0.5)
                  ELSE
                      p.gesamtstimmen / (ROUND(s.sitze) - 0.5)
              END
        ) AS sitze,
        s.iteration + 1,
        (SELECT SUM(ROUND(p2.gesamtstimmen /
                          CASE
                              WHEN s.total_sitze < 22 THEN
                                  p.gesamtstimmen / (ROUND(s.sitze) + 0.5)
                              ELSE
                                  p.gesamtstimmen / (ROUND(s.sitze) - 0.5)
                          END))
         FROM "partei_bundesland_zweitstimmen_neu_2021" p2
         WHERE p2.bundesland = 'SH') AS total_sitze
    FROM Sitzverteilung s
    JOIN partei_bundesland_zweitstimmen_neu_2021 p
    ON s.partei = p.partei
    WHERE s.total_sitze <> 22 AND iteration < 10 AND p.bundesland = 'SH'
)

SELECT
p.partei,
p.gesamtstimmen,
ROUND(p.gesamtstimmen /(SELECT s.divisor from Sitzverteilung s WHERE s.total_sitze=22 LIMIT 1)) as sitze
FROM partei_bundesland_zweitstimmen_neu_2021 p where p.bundesland='SH'
);





