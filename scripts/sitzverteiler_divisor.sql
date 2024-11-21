/*WITH RECURSIVE Oberverteilung AS (
    (SELECT kurzbezeichnung, bevoelkerung, cast(round(bevoelkerung * 800.0 / total.t) as Integer) AS sitzKontingente
        FROM "BundeslandStruktur", (SELECT sum(bevoelkerung) as t
                                    FROM "BundeslandStruktur"
                                    WHERE jahr = 2021) AS total
        WHERE jahr = 2021)
        UNION
    (WITH paddedSitze AS (
        SELECT (CASE
                   WHEN (SELECT SUM(sitzKontingente) FROM Oberverteilung) < 800 THEN 1.5
                   WHEN (SELECT SUM(sitzKontingente) FROM Oberverteilung) > 800 THEN -1.5
                   ELSE 0.5
            END) AS factor
        ), intermediateIteration AS (
        SELECT kurzbezeichnung,
               bevoelkerung,
               (bevoelkerung / (cast(sitzKontingente as float) + (SELECT factor from paddedSitze) -
                                sign((SELECT factor from paddedSitze))))                            as divisor1,
               (bevoelkerung / (cast(sitzKontingente as float) + (SELECT factor from paddedSitze))) as divisor2
        FROM Oberverteilung)
        SELECT kurzbezeichnung, bevoelkerung, cast(round(bevoelkerung / (select min(divisor1) from intermediateIteration)) as Integer)  as sitzKontingente
        FROM Oberverteilung)
    )

SELECT *
FROM Oberverteilung
*/


WITH RECURSIVE Oberverteilung AS (
    (SELECT kurzbezeichnung, bevoelkerung, cast(round(bevoelkerung * 598.0 / total.t) as Integer) AS sitzKontingente
        FROM "BundeslandStruktur", (SELECT sum(bevoelkerung) as t
                                    FROM "BundeslandStruktur"
                                    WHERE jahr = 2021) AS total
        WHERE jahr = 2021)
        UNION
    (WITH paddedSitze AS (
        SELECT (0.5) AS factor
        ), intermediateIteration AS (
        SELECT kurzbezeichnung,
               bevoelkerung,
               (bevoelkerung / (cast(sitzKontingente as float) + (SELECT factor from paddedSitze) -
                                sign((SELECT factor from paddedSitze))))                            as divisor1,
               (bevoelkerung / (cast(sitzKontingente as float) + (SELECT factor from paddedSitze))) as divisor2
        FROM Oberverteilung)
        SELECT kurzbezeichnung, bevoelkerung, cast(round(bevoelkerung / (select min(divisor1) from intermediateIteration)) as Integer)  as sitzKontingente
        FROM Oberverteilung)
    )

SELECT *
FROM Oberverteilung
