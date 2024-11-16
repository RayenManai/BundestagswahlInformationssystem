CREATE VIEW Partei_Bundesland_Zweitstimmen_2021 AS
SELECT
    p.parteiId,
    p.kurzbezeichnung AS partei,
    wk.bundesland,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         WHERE zse_inner.jahr = 2021)) AS percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Partei p ON zse.parteiId = p.parteiId
    JOIN Wahlkreis wk ON zse.wahlkreisId = wk.wahlkreisId
WHERE
    zse.jahr = 2021
GROUP BY
    p.parteiId, p.kurzbezeichnung, wk.bundesland;


CREATE VIEW Partei_Bundesland_Zweitstimmen_2017 AS
SELECT
    p.parteiId,
    p.kurzbezeichnung AS partei,
    wk.bundesland,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         WHERE zse_inner.jahr = 2017)) AS percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Partei p ON zse.parteiId = p.parteiId
    JOIN Wahlkreis wk ON zse.wahlkreisId = wk.wahlkreisId
WHERE
    zse.jahr = 2017
GROUP BY
    p.parteiId, p.kurzbezeichnung, wk.bundesland;

CREATE VIEW Partei_Gesamt_Zweitstimmen_2021 AS
SELECT
    p.parteiId,
    p.kurzbezeichnung AS partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         WHERE zse_inner.jahr = 2021)) AS percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Partei p ON zse.parteiId = p.parteiId
WHERE
    zse.jahr = 2021
GROUP BY
    p.parteiId, p.kurzbezeichnung;


CREATE VIEW Partei_Gesamt_Zweitstimmen_2017 AS
SELECT
    p.parteiId,
    p.kurzbezeichnung AS partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         WHERE zse_inner.jahr = 2017)) AS percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Partei p ON zse.parteiId = p.parteiId
WHERE
    zse.jahr = 2017
GROUP BY
    p.parteiId, p.kurzbezeichnung;

CREATE VIEW Gewahlte_direkt_kandidaten_2021 AS
SELECT
    k.Titel,
    k.vorname,
    k.name,
    p.parteiId,
    p.kurzbezeichnung AS partei,
    wk.wahlkreisName AS wahlkreis,
    dk.anzahlStimmen AS gewonnene_stimmen,
    (dk.anzahlStimmen * 100.0 /
        (SELECT SUM(dk2.anzahlStimmen)
         FROM DirektKandidatur dk2
         WHERE dk2.wahlkreisId = dk.wahlkreisId
         AND dk2.jahr = 2021)) AS stimmanteil_prozent
FROM
    DirektKandidatur dk
    JOIN Kandidat k ON k.kandidatId = dk.kandidatId
    JOIN Wahlkreis wk ON wk.wahlkreisId = dk.wahlkreisId
    LEFT JOIN Partei p ON p.parteiId = k.parteiId -- Allow for candidates without a party
WHERE
    dk.jahr = 2021
    AND dk.anzahlStimmen = (
        SELECT MAX(dk2.anzahlStimmen)
        FROM DirektKandidatur dk2
        WHERE dk2.wahlkreisId = dk.wahlkreisId
    );

CREATE VIEW Gewahlte_direkt_kandidaten_2017 AS
SELECT
    k.Titel,
    k.vorname,
    k.name,
    p.parteiId,
    p.kurzbezeichnung AS partei,
    wk.wahlkreisName AS wahlkreis,
    dk.anzahlStimmen AS gewonnene_stimmen,
    (dk.anzahlStimmen * 100.0 /
        (SELECT SUM(dk2.anzahlStimmen)
         FROM DirektKandidatur dk2
         WHERE dk2.wahlkreisId = dk.wahlkreisId
         AND dk2.jahr = 2017)) AS stimmanteil_prozent
FROM
    DirektKandidatur dk
    JOIN Kandidat k ON k.kandidatId = dk.kandidatId
    JOIN Wahlkreis wk ON wk.wahlkreisId = dk.wahlkreisId
    LEFT JOIN Partei p ON p.parteiId = k.parteiId -- Allow for candidates without a party
WHERE
    dk.jahr = 2017
    AND dk.anzahlStimmen = (
        SELECT MAX(dk2.anzahlStimmen)
        FROM DirektKandidatur dk2
        WHERE dk2.wahlkreisId = dk.wahlkreisId
    );

CREATE VIEW Parteien_Nach_Huerde_2021 AS
SELECT
    pzs.parteiId,
    pzs.partei
FROM Partei_Gesamt_Zweitstimmen_2021 pzs
WHERE pzs.percentage >= 5
   OR (
       SELECT COUNT(*)
       FROM Gewahlte_direkt_kandidaten_2021 gdk
       WHERE gdk.parteiId = pzs.parteiId
   ) >= 3;

CREATE VIEW Parteien_Nach_Huerde_2017 AS
SELECT
    pzs.parteiId,
    pzs.partei
FROM Partei_Gesamt_Zweitstimmen_2017 pzs
WHERE pzs.percentage >= 5
   OR (
       SELECT COUNT(*)
       FROM Gewahlte_direkt_kandidaten_2017 gdk
       WHERE gdk.parteiId = pzs.parteiId
   ) >= 3;



-- Step 4: Recalculate percentages for remaining parties

CREATE VIEW Partei_Gesamt_Zweitstimmen_neu_2021 AS
SELECT
    pnh.parteiId,
    pnh.partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         JOIN Parteien_Nach_Huerde_2021 pnh_inner ON zse_inner.parteiId = pnh_inner.parteiId
         WHERE zse_inner.jahr = 2021)) AS neue_percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Parteien_Nach_Huerde_2021 pnh ON zse.parteiId = pnh.parteiId
WHERE
    zse.jahr = 2021
GROUP BY
    pnh.parteiId, pnh.partei;

CREATE VIEW Partei_Gesamt_Zweitstimmen_neu_2017 AS
SELECT
    pnh.parteiId,
    pnh.partei,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         JOIN Parteien_Nach_Huerde_2017 pnh_inner ON zse_inner.parteiId = pnh_inner.parteiId
         WHERE zse_inner.jahr = 2017)) AS neue_percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Parteien_Nach_Huerde_2021 pnh ON zse.parteiId = pnh.parteiId
WHERE
    zse.jahr = 2017
GROUP BY
    pnh.parteiId, pnh.partei;


CREATE VIEW Partei_Bundesland_Zweitstimmen_neu_2021 AS
SELECT
    pnh.parteiId,
    pnh.partei,
    wk.bundesland,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         JOIN Parteien_Nach_Huerde_2021 pnh_inner ON zse_inner.parteiId = pnh_inner.parteiId
         WHERE zse_inner.jahr = 2021)) AS neue_percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Parteien_Nach_Huerde_2021 pnh ON zse.parteiId = pnh.parteiId
    JOIN Wahlkreis wk ON zse.wahlkreisId = wk.wahlkreisId
WHERE
    zse.jahr = 2021
GROUP BY
    pnh.parteiId, pnh.partei, wk.bundesland;

CREATE VIEW Partei_Bundesland_Zweitstimmen_neu_2017 AS
SELECT
    pnh.parteiId,
    pnh.partei,
    wk.bundesland,
    SUM(zse.anzahlstimmen) AS gesamtstimmen,
    (SUM(zse.anzahlstimmen) * 100.0 /
        (SELECT SUM(zse_inner.anzahlstimmen)
         FROM ZweitstimmeErgebnisse zse_inner
         JOIN Parteien_Nach_Huerde_2017 pnh_inner ON zse_inner.parteiId = pnh_inner.parteiId
         WHERE zse_inner.jahr = 2017)) AS neue_percentage
FROM
    ZweitstimmeErgebnisse zse
    JOIN Parteien_Nach_Huerde_2017 pnh ON zse.parteiId = pnh.parteiId
    JOIN Wahlkreis wk ON zse.wahlkreisId = wk.wahlkreisId
WHERE
    zse.jahr = 2017
GROUP BY
    pnh.parteiId, pnh.partei, wk.bundesland;


CREATE VIEW Direktmandate_2021 AS
SELECT
    gdk.parteiId,
    COUNT(*) AS direktmandate
FROM Gewahlte_direkt_kandidaten_2021 gdk
GROUP BY gdk.parteiId;


CREATE VIEW Uberhangsmandate_2021 AS
SELECT
    pr.parteiId,
    pr.partei,
    pr.neue_percentage * 598 AS sitze,
    GREATEST(0, dm.direktmandate - (pr.neue_percentage * 598)) AS uberhangmandate
FROM Partei_Gesamt_Zweitstimmen_neu_2021 pr
JOIN Direktmandate_2021 dm ON ps.parteiId = dm.parteiId;

CREATE VIEW Direktmandate_2017 AS
SELECT
    gdk.parteiId,
    COUNT(*) AS direktmandate
FROM Gewahlte_direkt_kandidaten_2017 gdk
GROUP BY gdk.parteiId;


CREATE VIEW Uberhangsmandate_2017 AS
SELECT
    pr.parteiId,
    pr.partei,
    pr.neue_percentage * 598 AS sitze,
    GREATEST(0, dm.direktmandate - (pr.neue_percentage * 598)) AS uberhangsmandate
FROM Partei_Gesamt_Zweitstimmen_neu_2017 pr
JOIN Direktmandate_2017 dm ON ps.parteiId = dm.parteiId;
