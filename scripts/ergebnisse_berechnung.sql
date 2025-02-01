/*
  Entfernen aller Materialized views
 */
DROP MATERIALIZED VIEW IF EXISTS Parteien_Landeslistenverteilung_final_2017;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Landeslistenverteilung_final_2021;
DROP MATERIALIZED VIEW IF EXISTS parteien_sitzverteilung_final_2017;
DROP MATERIALIZED VIEW IF EXISTS parteien_sitzverteilung_final_2021;
DROP MATERIALIZED VIEW IF EXISTS Anfangsdivisor_Erhoehung_GesamtzahlSitze_2017;
DROP MATERIALIZED VIEW IF EXISTS Anfangsdivisor_Erhoehung_GesamtzahlSitze_2021;
DROP MATERIALIZED VIEW IF EXISTS Mindestsitze_2017;
DROP MATERIALIZED VIEW IF EXISTS Mindestsitze_2021;
DROP MATERIALIZED VIEW IF EXISTS ZwischenErgebnis_Mindestsitze_2017;
DROP MATERIALIZED VIEW IF EXISTS ZwischenErgebnis_Mindestsitze_2021;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Sitzverteilung_2017;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Sitzverteilung_2021;
DROP MATERIALIZED VIEW IF EXISTS Mindestsitze_2017;
DROP MATERIALIZED VIEW IF EXISTS Mindestsitze_2021;
DROP MATERIALIZED VIEW IF EXISTS Partei_gewonnene_Walhkreise_2017;
DROP MATERIALIZED VIEW IF EXISTS Partei_gewonnene_Walhkreise_2021;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Sitzverteilung_2017;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Sitzverteilung_2021;
DROP MATERIALIZED VIEW IF EXISTS Partei_Bundesland_Zweitstimmen_neu_2017;
DROP MATERIALIZED VIEW IF EXISTS Partei_Bundesland_Zweitstimmen_neu_2021;
DROP MATERIALIZED VIEW IF EXISTS Partei_Gesamt_Zweitstimmen_neu_2017;
DROP MATERIALIZED VIEW IF EXISTS Partei_Gesamt_Zweitstimmen_neu_2021;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Nach_Huerde_2017;
DROP MATERIALIZED VIEW IF EXISTS Parteien_Nach_Huerde_2021;
DROP MATERIALIZED VIEW IF EXISTS Partei_Gesamt_Zweitstimmen_2017;
DROP MATERIALIZED VIEW IF EXISTS Partei_Gesamt_Zweitstimmen_2021;
DROP MATERIALIZED VIEW IF EXISTS Oberverteilung_2017;
DROP MATERIALIZED VIEW IF EXISTS Oberverteilung_2021;

/*
  Zurücksetzen aller berechneten Ergebnisse
 */
TRUNCATE TABLE  "Ergebnisse";
TRUNCATE TABLE  "Landesergebnisse";
TRUNCATE TABLE  "Gewaehlte_direkt_kandidaten";

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
                MAX(b2.bevoelkerung / (s1.Sitzkontingente + 0.5)) - 0.0001
            ELSE
                MIN(b2.bevoelkerung / (s1.Sitzkontingente - 0.5)) + 0.0001
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
                MAX(b2.bevoelkerung / (s1.Sitzkontingente + 0.5)) - 0.0001
            ELSE
                MIN(b2.bevoelkerung / (s1.Sitzkontingente - 0.5)) + 0.0001
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
INSERT INTO "Gewaehlte_direkt_kandidaten" (
SELECT
    dk."kandidaturId",
    p."parteiId" AS parteiId,
    dk.anzahlStimmen AS gewonnene_stimmen
FROM
    "DirektKandidatur" dk
    JOIN "Kandidat" k ON k."kandidatId" = dk."kandidatId"
    LEFT JOIN "Partei" p ON p."parteiId" = k."parteiId" -- Allow for candidates without a party
WHERE
    dk.anzahlStimmen = (
        SELECT MAX(dk2.anzahlStimmen)
        FROM "DirektKandidatur" dk2
        WHERE dk2."wahlkreisId" = dk."wahlkreisId" AND dk2.jahr = dk.jahr
    ));


----------------------------------------------------------------------------------
CREATE materialized VIEW Parteien_Nach_Huerde_2021 AS
SELECT
    pzs."parteiId",
    pzs.partei
FROM Partei_Gesamt_Zweitstimmen_2021 pzs
WHERE pzs.percentage >= 5
   OR (
       SELECT COUNT(*)
       FROM "Gewaehlte_direkt_kandidaten" gdk, "DirektKandidatur" d
       WHERE gdk."parteiId" = pzs."parteiId" and gdk."kandidaturId" = d."kandidaturId" and d.jahr = 2021
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
       FROM "Gewaehlte_direkt_kandidaten" gdk, "DirektKandidatur" d
       WHERE gdk."parteiId" = pzs."parteiId" and gdk."kandidaturId" = d."kandidaturId" and d.jahr = 2017
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
        p."parteiId",
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
        p."parteiId",
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
    ON s."parteiId" = p."parteiId" AND s.kurzbezeichnung = p.bundesland) JOIN Oberverteilung_2021 ober ON p.bundesland = ober.kurzbezeichnung)
    JOIN LATERAL (
        SELECT s3.iteration as iteration, ober2.kurzbezeichnung as kurzbezeichnung, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < ober2.sitze THEN
                MAX(p2.gesamtstimmen / (s3.sitze + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (s3.sitze - 0.5)) + 0.0001
        END ) as divisor
         FROM oberverteilung_2021 ober2, verteilung s3, partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE ober2.kurzbezeichnung = s3.kurzbezeichnung and p2."parteiId" = s3."parteiId" and p2.bundesland = ober2.kurzbezeichnung
         GROUP BY s3.iteration, ober2.kurzbezeichnung, s3.total_sitze, ober2.sitze
        ) divisor_table ON divisor_table.kurzbezeichnung = s.kurzbezeichnung
    WHERE s.total_sitze <> ober.sitze)
)

SELECT
s."parteiId",
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
        p."parteiId",
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
           p."parteiId",
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
    ON s."parteiId" = p."parteiId" AND s.kurzbezeichnung = p.bundesland) JOIN Oberverteilung_2017 ober ON p.bundesland = ober.kurzbezeichnung)
    JOIN LATERAL (
        SELECT s3.iteration as iteration, ober2.kurzbezeichnung as kurzbezeichnung, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < ober2.sitze THEN
                MAX(p2.gesamtstimmen / (s3.sitze + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (s3.sitze - 0.5)) + 0.0001
        END ) as divisor
         FROM oberverteilung_2017 ober2, verteilung s3, partei_bundesland_zweitstimmen_neu_2017 p2
         WHERE ober2.kurzbezeichnung = s3.kurzbezeichnung and p2."parteiId" = s3."parteiId" and p2.bundesland = ober2.kurzbezeichnung
         GROUP BY s3.iteration, ober2.kurzbezeichnung, s3.total_sitze, ober2.sitze
        ) divisor_table ON divisor_table.kurzbezeichnung = s.kurzbezeichnung
    WHERE s.total_sitze <> ober.sitze)
)

SELECT
s."parteiId",
s.gesamtstimmen,
s.kurzbezeichnung,
s.sitze
FROM Sitzverteilung s,  (SELECT kurzbezeichnung, MAX(iteration) as iteration from Sitzverteilung group by kurzbezeichnung) gesamt
where s.kurzbezeichnung = gesamt.kurzbezeichnung AND s.iteration = gesamt.iteration
);

CREATE materialized VIEW Partei_gewonnene_Walhkreise_2021 AS (
    SELECT b.kurzbezeichnung as bundesland, p."parteiId" as parteiId, count(w."wahlkreisId") as wahlkreisSitze
    FROM (Parteien_Nach_Huerde_2021 p CROSS JOIN "Bundesland" b)  LEFT OUTER JOIN
        (("Gewaehlte_direkt_kandidaten" direkt JOIN "DirektKandidatur" d ON direkt."kandidaturId" = d."kandidaturId"
            AND d.jahr=2021)
         JOIN "Wahlkreis" w ON  w."wahlkreisId" = d."wahlkreisId") ON p."parteiId" = direkt."parteiId" AND b.kurzbezeichnung = w.bundesland
     GROUP BY b.kurzbezeichnung, p."parteiId"
    );

CREATE materialized VIEW Partei_gewonnene_Walhkreise_2017 AS (
    SELECT b.kurzbezeichnung as bundesland, p."parteiId" as parteiId, count(w."wahlkreisId") as wahlkreisSitze
    FROM (Parteien_Nach_Huerde_2017 p CROSS JOIN "Bundesland" b)  LEFT OUTER JOIN
        (("Gewaehlte_direkt_kandidaten" direkt JOIN "DirektKandidatur" d ON direkt."kandidaturId" = d."kandidaturId"
            AND d.jahr=2017)
         JOIN "Wahlkreis" w ON  w."wahlkreisId" = d."wahlkreisId") ON p."parteiId" = direkt."parteiId" AND b.kurzbezeichnung = w.bundesland
     GROUP BY b.kurzbezeichnung, p."parteiId"
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
    SELECT w.bundesland, w.parteiId, GREATEST(w.wahlkreisSitze, ROUND((w.wahlkreisSitze + COALESCE(p.sitze, 0)) / 2.0 + 0.1)) AS MindestSitzzahl, p.sitze as Sitzkontingente, GREATEST(w.wahlkreisSitze - COALESCE(p.sitze, 0), 0) as drohenderUeberhang
    FROM Partei_gewonnene_Walhkreise_2021 w LEFT OUTER JOIN parteien_sitzverteilung_2021 p
    ON w.parteiId= p."parteiId" and w.bundesland = p.kurzbezeichnung
    );

CREATE materialized VIEW ZwischenErgebnis_Mindestsitze_2017 AS
    (
    SELECT w.bundesland, w.parteiId, GREATEST(w.wahlkreisSitze, COALESCE(p.sitze, 0)) AS MindestSitzzahl, COALESCE(p.sitze, 0) as Sitzkontingente, GREATEST(w.wahlkreisSitze - COALESCE(p.sitze, 0), 0) as drohenderUeberhang
    FROM Partei_gewonnene_Walhkreise_2017 w LEFT OUTER JOIN parteien_sitzverteilung_2017 p
    ON w.parteiId= p."parteiId" and w.bundesland = p.kurzbezeichnung
    );

CREATE materialized VIEW Mindestsitze_2021 AS
    (
    SELECT m.parteiId, GREATEST(sum(m.MindestSitzzahl), sum(m.Sitzkontingente)) as mindSitze, sum(m.drohenderUeberhang) as drohenderUeberhang, sum(m.Sitzkontingente) as Sitzkontingente
    FROM ZwischenErgebnis_Mindestsitze_2021 m
    GROUP BY m.parteiId
    );

CREATE materialized VIEW Mindestsitze_2017 AS
    (
    SELECT m.parteiId, GREATEST(sum(m.MindestSitzzahl), sum(m.Sitzkontingente)) as mindSitze, sum(m.drohenderUeberhang) as drohenderUeberhang, sum(m.Sitzkontingente) as Sitzkontingente
    FROM ZwischenErgebnis_Mindestsitze_2017 m
    GROUP BY m.parteiId
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
        WHERE p."parteiId" = m.parteiId
    ),
    MitUebergang AS (
        (SELECT (p.gesamtstimmen / (m.mindSitze - 0.5)) as divisor
        FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
        WHERE p."parteiId" = m.parteiId AND m.drohenderUeberhang > 0)
        UNION
      (SELECT (p.gesamtstimmen / (m.mindSitze - 1.5)) as divisor
        FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
        WHERE p."parteiId" = m.parteiId AND m.drohenderUeberhang > 1)
    UNION
        (SELECT (p.gesamtstimmen / (m.mindSitze - 2.5)) as divisor
    FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
    WHERE p."parteiId" = m.parteiId AND m.drohenderUeberhang > 2)
    UNION
        (SELECT (p.gesamtstimmen / (m.mindSitze - 3.5)) as divisor
    FROM partei_gesamt_zweitstimmen_neu_2021 p, Mindestsitze_2021 m
    WHERE p."parteiId" = m.parteiId AND m.drohenderUeberhang > 3)
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


CREATE materialized VIEW Anfangsdivisor_Erhoehung_GesamtzahlSitze_2017 AS
(
SELECT MIN(p.gesamtstimmen / (m.mindSitze - 0.5)) AS anfangsdivisor
FROM partei_gesamt_zweitstimmen_neu_2017 p,
     mindestsitze_2017 m
WHERE p."parteiId" = m.parteiId
    );


-- Seite 47: Erhöhung der Gesamtzahl der Sitze für
-- die Parteien

CREATE materialized VIEW parteien_sitzverteilung_final_2021 AS
    (
    SELECT p."parteiId", p.gesamtstimmen, round(p.gesamtstimmen / g.anfangsdivisor) as sitze
    FROM partei_gesamt_zweitstimmen_neu_2021 p, Anfangsdivisor_Erhoehung_GesamtzahlSitze_2021 g
    );

CREATE materialized VIEW parteien_sitzverteilung_final_2017 AS
    (
    SELECT p."parteiId", p.gesamtstimmen, round(p.gesamtstimmen / g.anfangsdivisor) as sitze
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
        p."parteiId",
        p.gesamtstimmen,
        ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2021 p2
         WHERE p2."parteiId" = p."parteiId"
        ) / psf.sitze) + 0.0001 AS divisor,
        -- Calculate initial seat allocation
        (SELECT ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p2
             WHERE p2."parteiId" = p."parteiId") / psf.sitze) + 0.0001
        ))) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p2
             WHERE p2."parteiId" = p."parteiId") / psf.sitze) + 0.0001
        )), m.mindestsitzzahl)
         FROM zwischenergebnis_mindestsitze_2021 m
         WHERE m.bundesland = p.bundesland AND m.parteiId = p."parteiId") AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / (
            ((SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2021 p3
             WHERE p3."parteiId" = p."parteiId") / psf.sitze
        ) + 0.0001)), m.mindestsitzzahl))
         FROM partei_bundesland_zweitstimmen_neu_2021 p2, zwischenergebnis_mindestsitze_2021 m
         WHERE p2."parteiId" = p."parteiId" and m.parteiId = p."parteiId" and m.bundesland = p2.bundesland)
         AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2021 p, parteien_sitzverteilung_final_2021 psf
    WHERE psf."parteiId"=p."parteiId"

    UNION
    SELECT * FROM (
        WITH s2 as (SELECT  * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        p.bundesland,
        p."parteiId",
        p.gesamtstimmen,
        divisor_table.divisor as divisor,
        (SELECT ROUND(p.gesamtstimmen / divisor_table.divisor)) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / divisor_table.divisor), m.mindestsitzzahl)
         FROM zwischenergebnis_mindestsitze_2021 m
         WHERE m.bundesland = p.bundesland AND m.parteiId = p."parteiId") AS sitze,
        divisor_table.iteration + 1,
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / divisor_table.divisor), m.mindestsitzzahl))
         FROM "partei_bundesland_zweitstimmen_neu_2021" p2, zwischenergebnis_mindestsitze_2021 m
         WHERE p2."parteiId" = p."parteiId" AND m.bundesland = p2.bundesland AND m.parteiId = p."parteiId"
         ) AS total_sitze
    FROM ((s2 s JOIN partei_bundesland_zweitstimmen_neu_2021 p ON p."parteiId" = p."parteiId"
    ) JOIN Parteien_Sitzverteilung_final_2021 psf ON p."parteiId"= psf."parteiId") JOIN LATERAL
        (
        SELECT s3.iteration as iteration, p2."parteiId" as parteiId, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < psf.sitze THEN
                MAX(p2.gesamtstimmen / (s3.sitze + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (s3.sitze - 0.5)) + 0.0001
        END ) as divisor
         FROM "partei_bundesland_zweitstimmen_neu_2021" p2, s2 s3, zwischenergebnis_mindestsitze_2021 z
         WHERE p2.bundesland = s3.bundesland and p2.bundesland = z.bundesland and (s3.sitze <> 0)
           and z.mindestsitzzahl <= s3.gerundetesitze and z.parteiId = p2."parteiId" and z.parteiId = s3."parteiId" and p.partei = p2.partei
         GROUP BY s3.iteration, p2."parteiId", s3.total_sitze, psf.sitze
         ) divisor_table ON
    s.total_sitze <> psf.sitze AND s."parteiId" = divisor_table.parteiId
    GROUP BY p.bundesland, p."parteiId", p.gesamtstimmen, divisor_table.divisor, divisor_table.iteration) t
)
SELECT s."parteiId", s.bundesland, s.sitze
FROM Sitzverteilung s, (SELECT MAX(iteration) as iteration, "parteiId" from Sitzverteilung group by "parteiId") gesamt, zwischenergebnis_mindestsitze_2021 m
WHERE s.iteration = gesamt.iteration AND s."parteiId" = gesamt."parteiId" AND m.parteiId = s."parteiId" AND m.bundesland = s.bundesland);


CREATE materialized VIEW Parteien_Landeslistenverteilung_final_2017 AS (
WITH RECURSIVE Sitzverteilung AS (
    -- Initial step: Calculate the initial divisor and allocate initial seats

    SELECT
        p.bundesland,
        p."parteiId",
        p.gesamtstimmen,
        ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
         FROM partei_bundesland_zweitstimmen_neu_2017 p2
         WHERE p2."parteiId" = p."parteiId"
        ) / psf.sitze) + 0.0001 AS divisor,
        -- Calculate initial seat allocation
        (SELECT ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p2
             WHERE p2."parteiId" = p."parteiId") / psf.sitze) + 0.0001
        ))) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / (
            ((SELECT CAST(SUM(p2.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p2
             WHERE p2."parteiId" = p."parteiId") / psf.sitze) + 0.0001
        )), m.wahlkreisSitze)
         FROM partei_gewonnene_walhkreise_2017 m
         WHERE m.bundesland = p.bundesland AND m.parteiId = p."parteiId") AS sitze,
        0 AS iteration,
        -- Sum of initial seats for all parties
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / (
            ((SELECT CAST(SUM(p3.gesamtstimmen) AS FLOAT)
             FROM partei_bundesland_zweitstimmen_neu_2017 p3
             WHERE p3."parteiId" = p."parteiId") / psf.sitze
        ) + 0.0001)), m.wahlkreisSitze))
         FROM partei_bundesland_zweitstimmen_neu_2017 p2, partei_gewonnene_walhkreise_2017 m
         WHERE p2."parteiId" = p."parteiId" and m.parteiId = p."parteiId" and m.bundesland = p2.bundesland)
         AS total_sitze
    FROM partei_bundesland_zweitstimmen_neu_2017 p, parteien_sitzverteilung_final_2017 psf
    WHERE psf."parteiId"=p."parteiId"

    UNION
    SELECT * FROM (
        WITH s2 as (SELECT  * FROM Sitzverteilung)
    -- Recursive step: Adjust divisor and recalculate seats iteratively
    SELECT
        p.bundesland,
        p."parteiId",
        p.gesamtstimmen,
        divisor_table.divisor as divisor,
        (SELECT ROUND(p.gesamtstimmen / divisor_table.divisor)) AS gerundetesitze,
        (SELECT GREATEST(ROUND(p.gesamtstimmen / divisor_table.divisor), m.wahlkreisSitze)
         FROM partei_gewonnene_walhkreise_2017 m
         WHERE m.bundesland = p.bundesland AND m.parteiId = p."parteiId") AS sitze,
        divisor_table.iteration + 1,
        (SELECT SUM(GREATEST(ROUND(p2.gesamtstimmen / divisor_table.divisor), m.wahlkreisSitze))
         FROM "partei_bundesland_zweitstimmen_neu_2017" p2, partei_gewonnene_walhkreise_2017 m
         WHERE p2."parteiId" = p."parteiId" AND m.bundesland = p2.bundesland AND m.parteiId = p."parteiId"
         ) AS total_sitze
    FROM ((s2 s JOIN partei_bundesland_zweitstimmen_neu_2017 p ON p."parteiId" = p."parteiId"
    ) JOIN Parteien_Sitzverteilung_final_2017 psf ON p."parteiId" = psf."parteiId" AND p."parteiId" = p."parteiId") JOIN LATERAL
        (
        SELECT s3.iteration as iteration, p2."parteiId" as parteiId, (CASE
            -- Calculate the new divisor based on the adjusted seat count from the previous iteration
            WHEN s3.total_sitze < psf.sitze THEN
                MAX(p2.gesamtstimmen / (s3.sitze + 0.5)) - 0.0001
            ELSE
                MIN(p2.gesamtstimmen / (s3.sitze - 0.5)) + 0.0001
        END ) as divisor
         FROM "partei_bundesland_zweitstimmen_neu_2017" p2, s2 s3, partei_gewonnene_walhkreise_2017 z
         WHERE p2.bundesland = s3.bundesland and p2.bundesland = z.bundesland and (s3.sitze <> 0)
           and z.wahlkreisSitze <= s3.gerundetesitze and z.parteiId = p2."parteiId" and z.parteiId = s3."parteiId" and p."parteiId" = p2."parteiId"
         GROUP BY s3.iteration, p2."parteiId", s3.total_sitze, psf.sitze
         ) divisor_table ON
    s.total_sitze <> psf.sitze AND s."parteiId" = divisor_table.parteiId
    GROUP BY p.bundesland, p."parteiId", p.gesamtstimmen, divisor_table.divisor, divisor_table.iteration) t
)
SELECT s."parteiId", s.bundesland, s.sitze
FROM Sitzverteilung s, (SELECT MAX(iteration) as iteration, "parteiId" from Sitzverteilung group by "parteiId") gesamt
WHERE s.iteration = gesamt.iteration AND s."parteiId" = gesamt."parteiId");


INSERT INTO "Landesergebnisse"("parteiId", jahr, sitze, ueberhang, "direktMandate", "bundesland")
    (
    SELECT p."parteiId", 2021, p.sitze, z.drohenderUeberhang as Ueberhang, p2.wahlkreisSitze as direktMandate, p.bundesland
    FROM parteien_landeslistenverteilung_final_2021 p, ZwischenErgebnis_Mindestsitze_2021 z, partei_gewonnene_walhkreise_2021 p2
    WHERE p."parteiId" = z.parteiId AND p.bundesland = z.bundesland AND p."parteiId" = p2.parteiId AND p.bundesland = p2.bundesland);

INSERT INTO "Landesergebnisse"("parteiId", jahr, sitze, ueberhang, "direktMandate", "bundesland")
(
    SELECT p."parteiId", 2017, p.sitze, z.drohenderUeberhang as Ueberhang, p2.wahlkreisSitze as direktMandate, p.bundesland
    FROM parteien_landeslistenverteilung_final_2017 p, ZwischenErgebnis_Mindestsitze_2017 z, partei_gewonnene_walhkreise_2017 p2
    WHERE p."parteiId" = z.parteiId AND p.bundesland = z.bundesland AND p."parteiId" = p2.parteiId AND p.bundesland = p2.bundesland);

INSERT INTO "Ergebnisse" ("parteiId", jahr, "anzahlSitze", "direktMandate", "ueberhangsMandate", "ausgleichsMandate")
SELECT "parteiId", jahr, sum(sitze), sum("direktMandate"), sum(Ueberhang), 0
FROM "Landesergebnisse"
GROUP BY "parteiId", jahr;