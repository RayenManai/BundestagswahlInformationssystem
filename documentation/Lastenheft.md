## Lastenheft für das Wahlinformationssystem

#### Einleitung
>Das Wahlinformationssystem dient der Speicherung, Analyse und Darstellung von Wahldaten. Es ermöglicht die elektronische Stimmabgabe im Wahllokal und bietet außerdem eine Übersicht und Vergleichsmöglichkeit der Ergebnisse der Bundestagswahlen 2017 und 2021. Das Ziel ist es, die Effizienz und Transparenz von Wahlanalysen zu verbessern und später eine elektronische Stimmabgabe zu unterstützen.

#### Benutzer-Schnittstellen
Das Wahlinformationssystem verfügt über zwei zentrale Benutzer-Schnittstellen:
- **Ergebnis- und Vergleichsanalyse-Schnittstelle:**
Diese Schnittstelle dient zur Darstellung der Wahlergebnisse der Bundestagswahlen 2017 und 2021 und ermöglicht den Vergleich beider Wahlen. Die Benutzer können durch visuelle Darstellungen, Filter und Interaktionsmöglichkeiten detaillierte Einblicke in die Ergebnisse und Trends gewinnen.

- **Stimmabgabe-Schnittstelle:**
Die zweite Schnittstelle ermöglicht die elektronische Stimmabgabe im Wahllokal. Benutzer, die zur Wahl berechtigt sind, können ihre Erst- und Zweitstimmen einfach und sicher abgeben.
#### Funktionale Anforderungen

- **Speicherung der Einzelstimmen:**
Das System soll Einzelstimmen abspeichern und zwischen Erst- und Zweitstimmen unterscheiden. 

- **Berechnung der Bundestagsverteilung:**
Das System muss die Berechnung der Sitzverteilung im Bundestag gemäß den geltenden gesetzlichen Regelungen durchführen. Die Berechnung berücksichtigt die 5%-Sperrklausel,Überhangsmandate sowie die Verteilung auf Minderheitsparteien. Juristische Ausnahmefälle, die über diese Regelungen hinausgehen und bei den Bundestagswahlen 2017 und 2021 nicht relevant waren, sind nicht zu berücksichtigen.

- **Unterstützung für Wahlanalysen und Vergleichsfunktionen:**
Das System soll die Wahlergebnisse der Bundestagswahlen 2017 und 2021 darstellen und vergleichend analysieren können.

- **Backend-Funktionalität für die elektronische Stimmabgabe im Wahllokal:**
Das System dient als Backend für die elektronische Stimmabgabe und ermöglicht somit die sichere und nachvollziehbare Speicherung der abgegebenen Stimmen.


#### Nicht-funktionale Anforderungen
- **Leistungsanforderungen:**
Das System soll auch auf universellen Datenbanksystemen und Consumer-Hardware effektiv funktionieren. Um die Anfragen effizient zu bearbeiten, wird eine Redundanz an den aggregierten Stimmkreisergebnissen zugelassen.

- **Datenschutz und Sicherheit:**
Das System muss den aktuellen Datenschutzbestimmungen entsprechen, insbesondere der DSGVO. Die Einzelstimmen müssen verschlüsselt und sicher gespeichert werden, um die Integrität und Anonymität der Wähler zu gewährleisten.

- **Zuverlässigkeit und Verfügbarkeit:**
Das System soll eine hohe Verfügbarkeit bieten und mindestens 99,9 % der Zeit zugänglich sein, besonders an Wahltagen und für Analysen nach der Wahl.

- **Benutzerfreundlichkeit:**
Die Benutzeroberfläche soll einfach und intuitiv zu bedienen sein.

- **Konsistenz bei gleichzeitigen Zugriffen:**
Das Datenbanksystem muss sicherstellen, dass alle gleichzeitigen Zugriffe auf Wahldaten konsistent mit isolierten Transaktionen verarbeitet werden.

#### Erweiterte Anforderungen (Nice-to-Have-Features)
- **Echtzeit-Analyse und Prognose:**
Das System könnte mit einer Funktion erweitert werden, die es ermöglicht, in Echtzeit Prognosen und Trends während der Stimmabgabe darzustellen. Diese Funktion bietet tiefere Einblicke in mögliche Endergebnisse basierend auf bereits abgegebenen Stimmen.

- **Erweiterte Visualisierungsoptionen:**
Zusätzliche interaktive Grafiken, z. B. Heatmaps oder geografische Darstellungen der Ergebnisse nach Region oder Stimmkreis, könnten hinzugefügt werden, um die Datenanalyse zu verbessern.

- **Mehrsprachige Unterstützung:**
Das System könnte neben Deutsch auch in anderen Sprachen verfügbar sein, um die Benutzerfreundlichkeit für ein breiteres Publikum zu erhöhen.

#### Abnahmekriterien

- **Erfolgreiche funktionale Tests:**
Das System wird abgenommen, wenn die Hauptfunktionen, insbesondere die Erfassung und Speicherung von Einzelstimmen sowie die Vergleichsanalyse der Bundestagswahlen 2017 und 2021, erfolgreich getestet wurden.

- **Erfüllung der funktionalen und nicht-funktionalen Anforderungen:**
Alle im Lastenheft spezifizierten funktionalen und nicht-funktionalen Anforderungen wurden vollständig umgesetzt und erfolgreich getestet.
