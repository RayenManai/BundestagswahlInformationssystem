/*
 Die Herausforderung bestand darin, die Sainte-Laguë/Schepers-Divisor-Methode zur Berechnung des Bundestagswahlergebnisses
 mit SQL zu implementieren.

 Quelle: https://www.bundeswahlleiterin.de/dam/jcr/bf33c285-ee92-455a-a9c3-8d4e3a1ee4b4/btw21_sitzberechnung.pdf
 Erläuterung des Verfahrens: https://www.bundeswahlleiterin.de/dam/jcr/e9eb08cc-e19e-4caa-b9f7-c69247872344/btw21_erl_sitzzuteilung.pdf
 */


-- Schritt 1: Wie viele Sitze stehen einem Land zu? Ausschlaggebend ist die deutsche Bevölkerung des Landes. In jedem Land wird pro Sitz in
-- etwa die gleiche Anzahl Personen benötigt. In Summe müssen genau 598 Sitze verteilt wer-
-- den.

-- Seiten 28 - 29: Ermittlung der Divisorspanne und des endgültigen Divisors für „6.1.1 Ermittlung der Sitzkontingente der
-- Länder nach Bevölkerungszahl“

CREATE materialized view Oberverteilung_2021 AS(
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
    SELECT * FROM (
        WITH sitze as (SELECT  * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        b.kurzbezeichnung,
        b.bevoelkerung,
        divisor_table.divisor AS divisor,
        ROUND(b.bevoelkerung / divisor_table.divisor) AS Sitzkontingente,
        s.iteration + 1 AS iteration,
        (SELECT SUM(ROUND(b2.bevoelkerung / divisor_table.divisor))
         FROM "BundeslandStruktur" b2
         WHERE b2.jahr = 2021) AS total_sitze
    FROM (sitze s JOIN "BundeslandStruktur" b ON s.kurzbezeichnung = b.kurzbezeichnung AND b.jahr = 2021 AND s.iteration<5
        ) , (SELECT (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s1.total_sitze < 598 THEN
                MAX(b2.bevoelkerung / (ROUND(s1.Sitzkontingente) + 0.5)) - 0.0001
            ELSE
                MIN(b2.bevoelkerung / (ROUND(s1.Sitzkontingente) - 0.5)) + 0.0001
        END) AS divisor FROM sitze s1, "BundeslandStruktur" b2
                        WHERE b2.kurzbezeichnung = s1.kurzbezeichnung and b2.jahr = 2021
                        GROUP BY s1.total_sitze) divisor_table
    WHERE s.total_sitze <> 598) t
)
SELECT
s.kurzbezeichnung,
s.bevoelkerung,
s.Sitzkontingente as sitze
FROM Sitzverteilung s
WHERE s.iteration = (SELECT MAX(iteration) FROM Sitzverteilung));

----------------------------------------------------------------------------------
CREATE materialized VIEW Oberverteilung_2017 AS(
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Start with the initial divisor and calculate initial seats
    SELECT
        b.kurzbezeichnung,
        b.bevoelkerung,
        (SELECT SUM(bevoelkerung) FROM "BundeslandStruktur" WHERE jahr = 2017) / 598.0 AS divisor,
        ROUND(b.bevoelkerung / ((SELECT SUM(bevoelkerung) FROM "BundeslandStruktur" WHERE jahr = 2017) / 598.0)) AS Sitzkontingente,
        0 AS iteration,
        (SELECT SUM(ROUND(bevoelkerung /
                          ((SELECT SUM(bevoelkerung) FROM "BundeslandStruktur" WHERE jahr = 2017) / 598.0)))
         FROM "BundeslandStruktur"
         WHERE jahr = 2017) AS total_sitze
    FROM "BundeslandStruktur" b
    WHERE b.jahr = 2017

    UNION ALL
    SELECT * FROM (
        WITH sitze as (SELECT  * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        b.kurzbezeichnung,
        b.bevoelkerung,
        divisor_table.divisor AS divisor,
        ROUND(b.bevoelkerung / divisor_table.divisor) AS Sitzkontingente,
        s.iteration + 1 AS iteration,
        (SELECT SUM(ROUND(b2.bevoelkerung / divisor_table.divisor))
         FROM "BundeslandStruktur" b2
         WHERE b2.jahr = 2017) AS total_sitze
    FROM (sitze s JOIN "BundeslandStruktur" b ON s.kurzbezeichnung = b.kurzbezeichnung AND b.jahr = 2017 AND s.iteration<5
        ) , (SELECT (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s1.total_sitze < 598 THEN
                MAX(b2.bevoelkerung / (ROUND(s1.Sitzkontingente) + 0.5)) - 0.0001
            ELSE
                MIN(b2.bevoelkerung / (ROUND(s1.Sitzkontingente) - 0.5)) + 0.0001
        END) AS divisor FROM sitze s1, "BundeslandStruktur" b2
                        WHERE b2.kurzbezeichnung = s1.kurzbezeichnung and b2.jahr = 2017
                        GROUP BY s1.total_sitze) divisor_table
    WHERE s.total_sitze <> 598) t
)
SELECT
s.kurzbezeichnung,
s.bevoelkerung,
s.Sitzkontingente as sitze
FROM Sitzverteilung s
WHERE s.iteration = (SELECT MAX(iteration) FROM Sitzverteilung));

----------------------------------------------------------------------------------
CREATE materialized VIEW Partei_Gesamt_Zweitstimmen_2021 AS
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


----------------------------------------------------------------------------------
CREATE materialized VIEW Partei_Gesamt_Zweitstimmen_2017 AS
SELECT
    p."parteiId",
    p.kurzbezeichnung AS partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM "ZweitstimmeErgebnisse" zse_inner
         WHERE zse_inner.jahr = 2017)) AS percentage
FROM
    "ZweitstimmeErgebnisse" zse
    JOIN "Partei" p ON zse."parteiId" = p."parteiId"
WHERE
    zse.jahr = 2017
GROUP BY
    p."parteiId", p.kurzbezeichnung;


----------------------------------------------------------------------------------
CREATE materialized VIEW Gewahlte_direkt_kandidaten_2021 AS
SELECT
    k.Titel,
    k.vorname,
    k.name,
    p."parteiId",
    p.kurzbezeichnung AS partei,
    wk."wahlkreisId" AS wahlkreisId,
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

----------------------------------------------------------------------------------
CREATE materialized VIEW Gewahlte_direkt_kandidaten_2017 AS
SELECT
    k.Titel,
    k.vorname,
    k.name,
    p."parteiId",
    p.kurzbezeichnung AS partei,
    wk."wahlkreisId" AS wahlkreisId,
    dk.anzahlStimmen AS gewonnene_stimmen,
    (dk.anzahlStimmen * 100.0 /
        (SELECT SUM(dk2.anzahlStimmen)
         FROM "DirektKandidatur" dk2
         WHERE dk2."wahlkreisId" = dk."wahlkreisId"
         AND dk2.jahr = 2017)) AS stimmanteil_prozent
FROM
    "DirektKandidatur" dk
    JOIN "Kandidat" k ON k."kandidatId" = dk."kandidatId"
    JOIN "Wahlkreis" wk ON wk."wahlkreisId" = dk."wahlkreisId"
    LEFT JOIN "Partei" p ON p."parteiId" = k."parteiId" -- Allow for candidates without a party
WHERE
    dk.jahr = 2017
    AND dk.anzahlStimmen = (
        SELECT MAX(dk2.anzahlStimmen)
        FROM "DirektKandidatur" dk2
        WHERE dk2."wahlkreisId" = dk."wahlkreisId" AND dk2.jahr = 2017
    );


----------------------------------------------------------------------------------
CREATE materialized VIEW Parteien_Nach_Huerde_2021 AS
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


----------------------------------------------------------------------------------
CREATE materialized VIEW Parteien_Nach_Huerde_2017 AS
SELECT
    pzs."parteiId",
    pzs.partei
FROM Partei_Gesamt_Zweitstimmen_2017 pzs
WHERE pzs.percentage >= 5
   OR (
       SELECT COUNT(*)
       FROM Gewahlte_direkt_kandidaten_2021 gdk
       WHERE gdk."parteiId" = pzs."parteiId"
   ) >= 3 OR pzs.partei = 'SSW';


----------------------------------------------------------------------------------
CREATE materialized VIEW Partei_Gesamt_Zweitstimmen_neu_2021 AS
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

----------------------------------------------------------------------------------
CREATE materialized VIEW Partei_Gesamt_Zweitstimmen_neu_2017 AS
SELECT
    pnh."parteiId",
    pnh.partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM "ZweitstimmeErgebnisse" zse_inner
         JOIN Parteien_Nach_Huerde_2017 pnh_inner ON zse_inner."parteiId" = pnh_inner."parteiId"
         WHERE zse_inner.jahr = 2017)) AS neue_percentage
FROM
    "ZweitstimmeErgebnisse" zse
    JOIN Parteien_Nach_Huerde_2017 pnh ON zse."parteiId" = pnh."parteiId"
WHERE
    zse.jahr = 2017
GROUP BY
    pnh."parteiId", pnh.partei;


----------------------------------------------------------------------------------
CREATE materialized VIEW Partei_Bundesland_Zweitstimmen_neu_2021 AS
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


----------------------------------------------------------------------------------
CREATE materialized VIEW Partei_Bundesland_Zweitstimmen_neu_2017 AS
SELECT
    pnh."parteiId",
    pnh.partei,
    wk.bundesland,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM "ZweitstimmeErgebnisse" zse_inner
         JOIN Parteien_Nach_Huerde_2017 pnh_inner ON zse_inner."parteiId" = pnh_inner."parteiId"
         WHERE zse_inner.jahr = 2017)) AS neue_percentage
FROM
    "ZweitstimmeErgebnisse" zse
    JOIN Parteien_Nach_Huerde_2017 pnh ON zse."parteiId" = pnh."parteiId"
    JOIN "Wahlkreis" wk ON zse."wahlkreisId" = wk."wahlkreisId"
WHERE
    zse.jahr = 2017
GROUP BY
    pnh."parteiId", pnh.partei, wk.bundesland
having SUM(zse.anzahlstimmen) <> 0;

----------------------------------------------------------------------------------

-- Schritt 2: Wie verteilt sich das Sitzkontingent eines Landes auf die zu berücksichtigenden Parteien,
-- die in diesem Land mit einer Landesliste angetreten sind?

-- Ausschlaggebend sind die gültigen Zweitstimmen der Landeslisten. In Summe müssen ge-
-- nau so viele Sitze verteilt werden, wie dem Land zustehen.

-- Seiten 30 - 45: Ermittlung der Divisorspanne und des endgültigen Divisors für „6.1.2 Verteilung der Sitzkontingente der
-- Länder auf die Landeslisten der Parteien“

CREATE MATERIALIZED VIEW Parteien_Sitzverteilung_2021 AS (
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Calculate the initial divisor and allocate initial seats

    SELECT
        p.partei,
        ober.kurzbezeichnung,
        p.gesamtstimmen,
        ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE p2.bundesland = ober.kurzbezeichnung
        ) / ober.sitze) - 0.0001 AS divisor,
        -- Calculate initial seat allocation
        ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p2
             WHERE p2.bundesland = ober.kurzbezeichnung) / ober.sitze) - 0.0001
        )) AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties
        (SELECT SUM(ROUND(p2.gesamtstimmen / (
            ((SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p3
             WHERE p3.bundesland = ober.kurzbezeichnung) / ober.sitze
        ) - 0.0001)))
         FROM partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE p2.bundesland = ober.kurzbezeichnung)
         AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2021 p, Oberverteilung_2021 ober
    WHERE p.bundesland = ober.kurzbezeichnung

    UNION ALL

    ( WITH verteilung as (SELECT * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
           p.partei,
        p.bundesland,
        p.gesamtstimmen,
        divisor_table.divisor AS divisor,
        ROUND(p.gesamtstimmen /divisor_table.divisor) AS sitze,
        s.iteration + 1,
        (SELECT SUM(ROUND(p2.gesamtstimmen / divisor_table.divisor))
         FROM "partei_bundesland_zweitstimmen_neu_2021" p2
         WHERE p2.bundesland = ober.kurzbezeichnung) AS total_sitze
    FROM ((verteilung s
    JOIN partei_bundesland_zweitstimmen_neu_2021 p
    ON s.partei = p.partei AND s.kurzbezeichnung = p.bundesland) JOIN Oberverteilung_2021 ober ON p.bundesland = ober.kurzbezeichnung)
    JOIN LATERAL (
        SELECT s3.iteration as iteration, ober2.kurzbezeichnung as kurzbezeichnung, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < ober2.sitze THEN
                MAX(p2.gesamtstimmen / (ROUND(s3.sitze) + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (ROUND(s3.sitze) - 0.5)) + 0.0001
        END ) as divisor
         FROM oberverteilung_2021 ober2, verteilung s3, partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE ober2.kurzbezeichnung = s3.kurzbezeichnung and p2.partei = s3.partei and p2.bundesland = ober2.kurzbezeichnung
         GROUP BY s3.iteration, ober2.kurzbezeichnung, s3.total_sitze, ober2.sitze
        ) divisor_table ON divisor_table.kurzbezeichnung = s.kurzbezeichnung
    WHERE s.total_sitze <> ober.sitze)
)

SELECT
s.partei,
s.gesamtstimmen,
s.kurzbezeichnung,
s.sitze
FROM Sitzverteilung s,  (SELECT kurzbezeichnung, MAX(iteration) as iteration from Sitzverteilung group by kurzbezeichnung) gesamt
where s.kurzbezeichnung = gesamt.kurzbezeichnung AND s.iteration = gesamt.iteration
);


----------------------------------------------------------------------------------
CREATE materialized VIEW Parteien_Sitzverteilung_2017 AS (
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Calculate the initial divisor and allocate initial seats


    SELECT
        p.partei,
        ober.kurzbezeichnung,
        p.gesamtstimmen,
        ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2017 p2
         WHERE p2.bundesland = ober.kurzbezeichnung
        ) / ober.sitze) - 0.0001 AS divisor,
        -- Calculate initial seat allocation
        ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p2
             WHERE p2.bundesland = ober.kurzbezeichnung) / ober.sitze) - 0.0001
        )) AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties
        (SELECT SUM(ROUND(p2.gesamtstimmen / (
            ((SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p3
             WHERE p3.bundesland = ober.kurzbezeichnung) / ober.sitze
        ) - 0.0001)))
         FROM partei_bundesland_zweitstimmen_neu_2017 p2
         WHERE p2.bundesland = ober.kurzbezeichnung)
         AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2017 p, Oberverteilung_2017 ober
    WHERE p.bundesland = ober.kurzbezeichnung

    UNION ALL

    ( WITH verteilung as (SELECT * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
           p.partei,
        p.bundesland,
        p.gesamtstimmen,
        divisor_table.divisor AS divisor,
        ROUND(p.gesamtstimmen /divisor_table.divisor) AS sitze,
        s.iteration + 1,
        (SELECT SUM(ROUND(p2.gesamtstimmen / divisor_table.divisor))
         FROM "partei_bundesland_zweitstimmen_neu_2017" p2
         WHERE p2.bundesland = ober.kurzbezeichnung) AS total_sitze
    FROM ((verteilung s
    JOIN partei_bundesland_zweitstimmen_neu_2017 p
    ON s.partei = p.partei AND s.kurzbezeichnung = p.bundesland) JOIN Oberverteilung_2017 ober ON p.bundesland = ober.kurzbezeichnung)
    JOIN LATERAL (
        SELECT s3.iteration as iteration, ober2.kurzbezeichnung as kurzbezeichnung, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < ober2.sitze THEN
                MAX(p2.gesamtstimmen / (ROUND(s3.sitze) + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (ROUND(s3.sitze) - 0.5)) + 0.0001
        END ) as divisor
         FROM oberverteilung_2017 ober2, verteilung s3, partei_bundesland_zweitstimmen_neu_2017 p2
         WHERE ober2.kurzbezeichnung = s3.kurzbezeichnung and p2.partei = s3.partei and p2.bundesland = ober2.kurzbezeichnung
         GROUP BY s3.iteration, ober2.kurzbezeichnung, s3.total_sitze, ober2.sitze
        ) divisor_table ON divisor_table.kurzbezeichnung = s.kurzbezeichnung
    WHERE s.total_sitze <> ober.sitze)
)

SELECT
s.partei,
s.gesamtstimmen,
s.kurzbezeichnung,
s.sitze
FROM Sitzverteilung s,  (SELECT kurzbezeichnung, MAX(iteration) as iteration from Sitzverteilung group by kurzbezeichnung) gesamt
where s.kurzbezeichnung = gesamt.kurzbezeichnung AND s.iteration = gesamt.iteration
);

CREATE materialized VIEW Partei_gewonnene_Walhkreise_2021 AS (
    SELECT b.kurzbezeichnung as bundesland, p.partei as partei, count(direkt.wahlkreisId) as wahlkreisSitze
    FROM ((Parteien_Nach_Huerde_2021 p CROSS JOIN "Bundesland" b)  LEFT OUTER JOIN
        (Gewahlte_direkt_kandidaten_2021 direkt JOIN "Wahlkreis" w ON direkt.wahlkreisId = w."wahlkreisId")
        ON p."parteiId" = direkt."parteiId" and b.kurzbezeichnung = w.bundesland)
     GROUP BY b.kurzbezeichnung, p.partei
    );

CREATE materialized VIEW Partei_gewonnene_Walhkreise_2017 AS (
    SELECT b.kurzbezeichnung as bundesland, p.partei as partei, count(direkt.wahlkreisId) as wahlkreisSitze
    FROM ((Parteien_Nach_Huerde_2017 p CROSS JOIN "Bundesland" b)  LEFT OUTER JOIN
        (Gewahlte_direkt_kandidaten_2017 direkt JOIN "Wahlkreis" w ON direkt.wahlkreisId = w."wahlkreisId")
        ON p."parteiId" = direkt."parteiId" and b.kurzbezeichnung = w.bundesland)
     GROUP BY b.kurzbezeichnung, p.partei
    );


--Zwischenergebnis: Wie viele Sitze bekommt eine Partei, nachdem Schritt 1 und 2 durchgeführt wurden?

-- Innerhalb eines Bundeslandes wird die Anzahl der gewonnenen Wahlkreise festgestellt
-- und der (kaufmännisch gerundete) Mittelwert aus der nach Zweitstimmen ermittelten Sitz-
-- zahl und der Anzahl der gewonnenen Wahlkreise berechnet. Der höhere der beiden Werte
-- ist ausschlaggebend. Zusätzlich muss für jede Partei die Summe der so ermittelten Werte
-- über alle Bundesländer noch mit der Summe der nach Zweitstimmen ermittelten Sitzzahl
-- verglichen werden, wiederum zählt der höhere Wert.


CREATE materialized VIEW ZwischenErgebnis_Mindestsitze_2021 AS
    (
    SELECT w.bundesland, w.partei, GREATEST(w.wahlkreisSitze, ROUND((w.wahlkreisSitze + COALESCE(p.sitze, 0)) / 2.0 + 0.1)) AS MindestSitzzahl, p.sitze as Sitzkontingente, GREATEST(w.wahlkreisSitze - COALESCE(p.sitze, 0), 0) as drohenderUeberhang
    FROM Partei_gewonnene_Walhkreise_2021 w LEFT OUTER JOIN parteien_sitzverteilung_2021 p
    ON w."partei"= p.partei and w.bundesland = p.kurzbezeichnung
    );

CREATE materialized VIEW ZwischenErgebnis_Mindestsitze_2017 AS
    (
    SELECT w.bundesland, w.partei, GREATEST(w.wahlkreisSitze, ROUND((w.wahlkreisSitze + COALESCE(p.sitze, 0)) / 2.0 + 0.1)) AS MindestSitzzahl, p.sitze as Sitzkontingente, GREATEST(w.wahlkreisSitze - COALESCE(p.sitze, 0), 0) as drohenderUeberhang
    FROM Partei_gewonnene_Walhkreise_2017 w LEFT OUTER JOIN parteien_sitzverteilung_2017 p
    ON w."partei"= p.partei and w.bundesland = p.kurzbezeichnung
    );

CREATE materialized VIEW Mindestsitze_2021 AS
    (
    SELECT m.partei, GREATEST(sum(m.MindestSitzzahl), sum(m.Sitzkontingente)) as mindSitze, sum(m.drohenderUeberhang) as drohenderUeberhang, sum(m.Sitzkontingente) as Sitzkontingente
    FROM ZwischenErgebnis_Mindestsitze_2021 m
    GROUP BY m.partei
    );

CREATE materialized VIEW Mindestsitze_2017 AS
    (
    SELECT m.partei, GREATEST(sum(m.MindestSitzzahl), sum(m.Sitzkontingente)) as mindSitze, sum(m.drohenderUeberhang) as drohenderUeberhang, sum(m.Sitzkontingente) as Sitzkontingente
    FROM ZwischenErgebnis_Mindestsitze_2017 m
    GROUP BY m.partei
    );

-- Schritt 3: Wie viele Sitze müsste der Bundestag danach insgesamt haben, damit alle Parteien die für
-- sie ermittelte Mindestsitzzahl erhalten? Wie viele Sitze entfallen damit auf jede Partei?

-- Ausschlaggebend ist das Verhältnis der Zweitstimmen der Parteien. Jede Partei soll pro Sitz
-- in etwa die gleiche Anzahl Stimmen benötigen. Letztlich verbleiben allerdings bis zu drei
-- Direktmandate, die nicht auf diese Weise ausgeglichen werden (sogenannter verbleibender
-- Überhang).

-- Seiten 46 - 47: Ermittlung der Divisorspanne und des endgültigen Divisors für „6.1.4 Erhöhung der Gesamtzahl der Sitze für
-- die Parteien“

-- Seite 46 Anfangsdivisor
CREATE materialized VIEW Anfangsdivisor_Erhoehung_GesamtzahlSitze_2021 AS (
    WITH OhneUeberhang AS (
        SELECT MIN(p.gesamtstimmen / (m.sitzkontingente - 0.5)) AS divisor
        FROM partei_gesamt_zweitstimmen_neu_2021 p, mindestsitze_2021 m
        WHERE p.partei = m.partei
    ),
    MitUebergang AS (
        (SELECT (p.gesamtstimmen / (m.mindSitze - 0.5)) as divisor
        FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
        WHERE p.partei = m.partei AND m.drohenderUeberhang > 0)
        UNION
      (SELECT (p.gesamtstimmen / (m.mindSitze - 1.5)) as divisor
        FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
        WHERE p.partei = m.partei AND m.drohenderUeberhang > 1)
    UNION
        (SELECT (p.gesamtstimmen / (m.mindSitze - 2.5)) as divisor
    FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
    WHERE p.partei = m.partei AND m.drohenderUeberhang > 2)
    UNION
        (SELECT (p.gesamtstimmen / (m.mindSitze - 3.5)) as divisor
    FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
    WHERE p.partei = m.partei AND m.drohenderUeberhang > 3)
        ) ,
    Viertkleinster AS (
        SELECT m1.divisor
        FROM MitUebergang m1
        WHERE (SELECT count(*)
               FROM MitUebergang m2
               WHERE m2.divisor < m1.divisor) = 3
    )
        SELECT MIN(divisor) as anfangsdivisor
        FROM  (SELECT divisor FROM OhneUeberhang
                             UNION
              SELECT divisor FROM Viertkleinster) v

                               );


CREATE materialized VIEW Anfangsdivisor_Erhoehung_GesamtzahlSitze_2017 AS (
    WITH OhneUeberhang AS (
        SELECT MIN(p.gesamtstimmen / (m.sitzkontingente - 0.5)) AS divisor
        FROM partei_gesamt_zweitstimmen_neu_2017 p, mindestsitze_2017 m
        WHERE p.partei = m.partei
    ),
    MitUebergang AS (
        (SELECT (p.gesamtstimmen / (m.mindSitze - 0.5)) as divisor
        FROM partei_gesamt_zweitstimmen_neu_2017 p, Mindestsitze_2017 m
        WHERE p.partei = m.partei AND m.drohenderUeberhang > 0)
        UNION
      (SELECT (p.gesamtstimmen / (m.mindSitze - 1.5)) as divisor
        FROM partei_gesamt_zweitstimmen_neu_2017 p, Mindestsitze_2017 m
        WHERE p.partei = m.partei AND m.drohenderUeberhang > 1)
    UNION
        (SELECT (p.gesamtstimmen / (m.mindSitze - 2.5)) as divisor
    FROM partei_gesamt_zweitstimmen_neu_2017 p, Mindestsitze_2017 m
    WHERE p.partei = m.partei AND m.drohenderUeberhang > 2)
    UNION
        (SELECT (p.gesamtstimmen / (m.mindSitze - 3.5)) as divisor
    FROM partei_gesamt_zweitstimmen_neu_2017 p, Mindestsitze_2017 m
    WHERE p.partei = m.partei AND m.drohenderUeberhang > 3)
        ) ,
    Viertkleinster AS (
        SELECT m1.divisor
        FROM MitUebergang m1
        WHERE (SELECT count(*)
               FROM MitUebergang m2
               WHERE m2.divisor < m1.divisor) = 3
    )
        SELECT MIN(divisor) as anfangsdivisor
        FROM  (SELECT divisor FROM OhneUeberhang
                             UNION
              SELECT divisor FROM Viertkleinster) v

                               );


-- Seite 47: Erhöhung der Gesamtzahl der Sitze für
-- die Parteien

CREATE materialized VIEW parteien_sitzverteilung_final_2021 AS
    (
    SELECT p.partei, p.gesamtstimmen, round(p.gesamtstimmen / g.anfangsdivisor) as sitze
    FROM partei_gesamt_zweitstimmen_neu_2021 p, Anfangsdivisor_Erhoehung_GesamtzahlSitze_2021 g
    );



CREATE VIEW parteien_sitzverteilung_final_2017 AS
    (
    SELECT p.partei, p.gesamtstimmen, round(p.gesamtstimmen / g.anfangsdivisor) as sitze
    FROM partei_gesamt_zweitstimmen_neu_2017 p, Anfangsdivisor_Erhoehung_GesamtzahlSitze_2017 g
    );


-- Schritt 4: Wie viele Sitze einer Partei entfallen auf ihre Landeslisten?

--  Ausschlaggebend ist die Anzahl der gültigen Zweitstimmen. Aber es dürfen nicht weniger
-- Sitze auf die jeweilige Landesliste entfallen, als die Partei Mindestsitze gewonnen hat.

-- Seiten 48 - 63: Ermittlung der Divisorspanne und des endgültigen Divisors für „6.1.5 Verteilung der Sitze auf die
-- Landeslisten“

CREATE materialized VIEW Parteien_Landeslistenverteilung_final_2021 AS (
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Calculate the initial divisor and allocate initial seats

    SELECT
        p.bundesland,
        p.partei,
        p.gesamtstimmen,
        ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE p2.partei = p.partei
        ) / psf.sitze) + 0.0001 AS divisor,
        -- Calculate initial seat allocation
        (SELECT ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p2
             WHERE p2.partei = p.partei) / psf.sitze) + 0.0001
        ))) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p2
             WHERE p2.partei = p.partei) / psf.sitze) + 0.0001
        )), m.mindestsitzzahl)
         FROM zwischenergebnis_mindestsitze_2021 m
         WHERE m.bundesland = p.bundesland AND m.partei = p.partei) AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / (
            ((SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p3
             WHERE p3.partei = p.partei) / psf.sitze
        ) + 0.0001)), m.mindestsitzzahl))
         FROM partei_bundesland_zweitstimmen_neu_2021 p2, zwischenergebnis_mindestsitze_2021 m
         WHERE p2.partei = p.partei and m.partei = p.partei and m.bundesland = p2.bundesland)
         AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2021 p, parteien_sitzverteilung_final_2021 psf
    WHERE psf.partei=p.partei

    UNION
    SELECT * FROM (
        WITH s2 as (SELECT  * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        p.bundesland,
        p.partei,
        p.gesamtstimmen,
        divisor_table.divisor as divisor,
        (SELECT ROUND(p.gesamtstimmen / divisor_table.divisor)) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / divisor_table.divisor), m.mindestsitzzahl)
         FROM zwischenergebnis_mindestsitze_2021 m
         WHERE m.bundesland = p.bundesland AND m.partei = p.partei) AS sitze,
        divisor_table.iteration + 1,
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / divisor_table.divisor), m.mindestsitzzahl))
         FROM "partei_bundesland_zweitstimmen_neu_2021" p2, zwischenergebnis_mindestsitze_2021 m
         WHERE p2.partei = p.partei AND m.bundesland = p2.bundesland AND m.partei = p.partei
         ) AS total_sitze
    FROM ((s2 s JOIN partei_bundesland_zweitstimmen_neu_2021 p ON p.partei = p.partei
    ) JOIN Parteien_Sitzverteilung_final_2021 psf ON p.partei = psf.partei AND p.partei = p.partei) JOIN LATERAL
        (
        SELECT s3.iteration as iteration, p2.partei as partei, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < psf.sitze THEN
                MAX(p2.gesamtstimmen / (ROUND(s3.sitze) + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (ROUND(s3.sitze) - 0.5)) + 0.0001
        END ) as divisor
         FROM "partei_bundesland_zweitstimmen_neu_2021" p2, s2 s3, zwischenergebnis_mindestsitze_2021 z
         WHERE p2.bundesland = s3.bundesland and p2.bundesland = z.bundesland and (s3.sitze <> 0)
           and z.mindestsitzzahl <= s3.gerundetesitze and z.partei = p2.partei and z.partei = s3.partei and p.partei = p2.partei
         GROUP BY s3.iteration, p2.partei, s3.total_sitze, psf.sitze
         ) divisor_table ON
    s.total_sitze <> psf.sitze AND s.partei = divisor_table.partei
    GROUP BY p.bundesland, p.partei, p.gesamtstimmen, divisor_table.divisor, divisor_table.iteration) t
)
SELECT s.partei, s.bundesland, s.sitze
FROM Sitzverteilung s, (SELECT MAX(iteration) as iteration, partei from Sitzverteilung group by partei) gesamt, zwischenergebnis_mindestsitze_2021 m
WHERE s.iteration = gesamt.iteration AND s.partei = gesamt.partei AND m.partei = s.partei AND m.bundesland = s.bundesland);


CREATE materialized VIEW Parteien_Landeslistenverteilung_final_2017 AS (
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Calculate the initial divisor and allocate initial seats

    SELECT
        p.bundesland,
        p.partei,
        p.gesamtstimmen,
        ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2017 p2
         WHERE p2.partei = p.partei
        ) / psf.sitze) + 0.0001 AS divisor,
        -- Calculate initial seat allocation
        (SELECT ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p2
             WHERE p2.partei = p.partei) / psf.sitze) + 0.0001
        ))) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p2
             WHERE p2.partei = p.partei) / psf.sitze) + 0.0001
        )), m.mindestsitzzahl)
         FROM zwischenergebnis_mindestsitze_2017 m
         WHERE m.bundesland = p.bundesland AND m.partei = p.partei) AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / (
            ((SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p3
             WHERE p3.partei = p.partei) / psf.sitze
        ) + 0.0001)), m.mindestsitzzahl))
         FROM partei_bundesland_zweitstimmen_neu_2017 p2, zwischenergebnis_mindestsitze_2017 m
         WHERE p2.partei = p.partei and m.partei = p.partei and m.bundesland = p2.bundesland)
         AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2017 p, parteien_sitzverteilung_final_2017 psf
    WHERE psf.partei=p.partei

    UNION
    SELECT * FROM (
        WITH s2 as (SELECT  * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        p.bundesland,
        p.partei,
        p.gesamtstimmen,
        divisor_table.divisor as divisor,
        (SELECT ROUND(p.gesamtstimmen / divisor_table.divisor)) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / divisor_table.divisor), m.mindestsitzzahl)
         FROM zwischenergebnis_mindestsitze_2017 m
         WHERE m.bundesland = p.bundesland AND m.partei = p.partei) AS sitze,
        divisor_table.iteration + 1,
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / divisor_table.divisor), m.mindestsitzzahl))
         FROM "partei_bundesland_zweitstimmen_neu_2017" p2, zwischenergebnis_mindestsitze_2017 m
         WHERE p2.partei = p.partei AND m.bundesland = p2.bundesland AND m.partei = p.partei
         ) AS total_sitze
    FROM ((s2 s JOIN partei_bundesland_zweitstimmen_neu_2017 p ON p.partei = p.partei
    ) JOIN Parteien_Sitzverteilung_final_2017 psf ON p.partei = psf.partei AND p.partei = p.partei) JOIN LATERAL
        (
        SELECT s3.iteration as iteration, p2.partei as partei, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < psf.sitze THEN
                MAX(p2.gesamtstimmen / (ROUND(s3.sitze) + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (ROUND(s3.sitze) - 0.5)) + 0.0001
        END ) as divisor
         FROM "partei_bundesland_zweitstimmen_neu_2017" p2, s2 s3, zwischenergebnis_mindestsitze_2017 z
         WHERE p2.bundesland = s3.bundesland and p2.bundesland = z.bundesland and (s3.sitze <> 0)
           and z.mindestsitzzahl <= s3.gerundetesitze and z.partei = p2.partei and z.partei = s3.partei and p.partei = p2.partei
         GROUP BY s3.iteration, p2.partei, s3.total_sitze, psf.sitze
         ) divisor_table ON
    s.total_sitze <> psf.sitze AND s.partei = divisor_table.partei
    GROUP BY p.bundesland, p.partei, p.gesamtstimmen, divisor_table.divisor, divisor_table.iteration) t
)
SELECT s.partei, s.bundesland, s.sitze
FROM Sitzverteilung s, (SELECT MAX(iteration) as iteration, partei from Sitzverteilung group by partei) gesamt
WHERE s.iteration = gesamt.iteration AND s.partei = gesamt.partei);
