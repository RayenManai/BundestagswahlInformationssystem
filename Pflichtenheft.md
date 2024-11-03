## Pflichtenheft für das Wahlinformationssystem

### Zielsetzung

#### Muss-Kriterien
- **Speicherung und Analyse der Wahldaten:**
Das System muss in der Lage sein, Einzelstimmen sicher zu speichern und Wahlergebnisse der Bundestagswahlen 2017 und 2021 darzustellen.
Nach dem Ende des Wahltages sollte das System die neuen Wahlergebnisse integrieren und Vergleiche zwischen den unterschiedlichen Jahren mittels Graphen und Tabllen durchführen. 

- **Berechnung der Sitzverteilung:**
Das System berechnet die Bundestagssitzverteilung gemäß der 5%-Sperrklausel, inklusive Überhangsmandaten.

- **Elektronische Stimmabgabe im Wahllokal:**
Das System ermöglicht nach den aktuellen Datenschutzbestimmungen sichere, anonyme und nachvollziehbare Stimmabgabe für berechtigte Benutzer im Wahllokal.

#### Soll-Kriterien
- **Benutzerfreundliche Oberfläche:**
Einfache und intuitive GUI für Wähler und Analysen.

- **Konsistenz bei gleichzeitigen Zugriffen:**
Die Datenbank muss isolierte Transaktionen gewährleisten, um Datenkonsistenz zu wahren.

- **Sehr hohe Verfügbarkeit:** insbesondere an Wahltagen.

#### Kann-Kriterien
- **Mehrsprachige Unterstützung:**
Optionales Angebot einer Benutzeroberfläche in weiteren Sprachen neben Deutsch.

- **Erweiterte Visualisierungsoptionen:**
bspw. Heatmaps oder geografische Darstellungen der Ergebnisse nach Region oder Stimmkreis, könnten hinzugefügt werden, um die Datenanalyse zu verbessern.

#### Abgrenzungskriterien
- **Tracking der individuellen Stimmabgaben:** Das System kann nicht nachverfolgen, welche Personen abgestimmt haben, und kann nicht auf individuelle Stimmabgaben zugreifen. Dies gewährleistet die Anonymität der Wähler.
- **Zugriffsrestriktionen auf Stimmabgaben während Wahltagen:** Das System hat nur Lesezugriff auf die veröffentlichten Wahlergebnisse. Die Stimmabgabe-Schnittstelle ist nur in Wahllokalen verfügbar und kann außerhalb der Wahllokale während der Wahltage nicht aufgerufen werden.


### Technische Umsetzung

#### Architekturüberblick
- **Datenbankmanagementsystem (DBMS):**
Zur Speicherung der Einzelstimmen und Wahldaten. Die Datenbank wird verschlüsselt, um die Sicherheit und Anonymität der Daten zu gewährleisten.
Das Datenmodell besteht aus den folgenden Entitäten und Relationen:
![UML Diagramm](./resources/wahlen.png)
- **Backend (Application Server):**
verarbeitet Anfragen der Benutzeroberfläche und steuert die Speicherung und Verarbeitung der Stimmen.
- **Frontend (Web-Client):**
bietet eine benutzerfreundliche Schnittstelle für die Ergebnisanalyse und Stimmabgabe.

#### Komponenten-Interaktion
- Das Frontend kommuniziert über eine API mit dem Backend, um Wahldaten anzufordern und die Benutzerinteraktion zu ermöglichen.
- Das Backend verarbeitet die Anfragen und interagiert mit dem DBMS, um Daten sicher zu speichern und Abfragen zu beantworten.

#### Benutzer-Oberfläche 
Ein Überblick ist auf [Figma](https://www.figma.com/proto/gGm4p1eNUpWRlI9xZu1wLC/votealyze?node-id=6-3776&node-type=canvas&t=tFTFJENVSNoyepIA-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1) verfügbar.

### Glossar
