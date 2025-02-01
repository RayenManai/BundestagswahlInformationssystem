TRUNCATE TABLE "Erststimme";

TRUNCATE  TABLE "Zweitstimme";

DROP INDEX IF EXISTS idx_erstimme;

DROP INDEX IF EXISTS idx_zweitstimme;

ALTER TABLE "Erststimme" set UNLOGGED ;

ALTER TABLE "Erststimme" DISABLE TRIGGER ALL;

INSERT INTO "Erststimme" ("kanditaturId")
SELECT d."kandidaturId"
FROM "DirektKandidatur" d, LATERAL generate_series(1, d.anzahlstimmen); -- 5min

ALTER TABLE "Erststimme" ENABLE TRIGGER ALL;

ALTER TABLE "Erststimme" SET LOGGED; -- 35sec

CREATE INDEX idx_erstimme ON "Erststimme" ("kanditaturId"); -- 11 sec

-- Step 5: Optimize Table Performance for Future Inserts
VACUUM ANALYZE "Erststimme"; -- 3sec

ALTER TABLE "Zweitstimme" set UNLOGGED ;

ALTER TABLE "Zweitstimme" DISABLE TRIGGER ALL;

INSERT INTO "Zweitstimme" ("ZSErgebnisId")
SELECT z.id
FROM "ZweitstimmeErgebnisse" z, LATERAL generate_series(1, z.anzahlstimmen); -- 5min

ALTER TABLE "Zweitstimme" DISABLE TRIGGER ALL;

ALTER TABLE "Zweitstimme" SET LOGGED; -- 35sec

CREATE INDEX idx_zweitstimme ON "Zweitstimme" ("ZSErgebnisId"); -- 11 sec

-- Step 5: Optimize Table Performance for Future Inserts
VACUUM ANALYZE "Zweitstimme"; -- 3sec