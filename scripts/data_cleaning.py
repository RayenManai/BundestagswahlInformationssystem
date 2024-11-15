import pandas as pd
import re

def unique_kandidaten_2021():
    # Load the CSV file
    df = pd.read_csv("../csv_data/kandidaturen_2021.csv", delimiter=";")

    # Remove duplicates based on a combination of three columns
    df = df.drop_duplicates(subset=["Nachname", "Vornamen", "Geburtsjahr"], keep="first")

    df.to_csv("unique_kandidaten_2021.csv", index=False)


def clean_kandidaten_2021():
    # Load the data from the CSV file
    df = pd.read_csv("../csv_data/kandidaturen_2021.csv", delimiter=";")

    # Process the "WahlkreisNr", "LandId", and "Listenplatz" columns
    for i in range(len(df)):
        df.loc[i, "WahlkreisNr"] = df.loc[i, "Gebietsnummer"] if df.loc[i, "Gebietsart"] == "Wahlkreis" else None
        df.loc[i, "LandId"] = df.loc[i, "GebietLandAbk"] if df.loc[i, "Gebietsart"] == "Land" else None
        df.loc[i, "Listenplatz"] = df.loc[i, "Listenplatz"] if df.loc[i, "Gebietsart"] == "Land" else None

    # Identify duplicates based on "Nachnamen", "Vornamen", and "Geburtsjahr"
    df_duplicates = df[df.duplicated(subset=["Nachname", "Vornamen", "Geburtsjahr"], keep=False)]

    # Iterate over the duplicates and merge values
    for _, group in df_duplicates.groupby(["Nachname", "Vornamen", "Geburtsjahr"]):
        if len(group) > 1:
            # Merge values for "WahlkreisNr", "LandId", "Listenplatz" across the duplicates
            merged_values = {
                "WahlkreisNr": group["WahlkreisNr"].combine_first(group["WahlkreisNr"].shift(-1)).iloc[0],
                "LandId": group["LandId"].combine_first(group["LandId"].shift(-1)).iloc[0],
                "Listenplatz": group["Listenplatz"].combine_first(group["Listenplatz"].shift(-1)).iloc[0]
            }

            # Update the first row with the merged values
            df.loc[group.index[0], ["WahlkreisNr", "LandId", "Listenplatz"]] = \
                [merged_values["WahlkreisNr"], merged_values["LandId"], merged_values["Listenplatz"]]

            # Remove the subsequent duplicates (keeping the first)
            df.drop(index=group.index[1:], inplace=True)

    df.reset_index(drop=True, inplace=True)

    #add custom ids and jahr
    for i in range(len(df)):
        df.loc[i,"id"] = i
        df.loc[i, "Jahr"] = 2021

        # Selecting Specific Columns
    df = df[["id", "Titel", "Nachname", "Vornamen", "Geburtsjahr", "Gruppenname", "WahlkreisNr", "LandId", "Listenplatz","Jahr"]]
    df.to_csv("kandidaten_2021_v1.csv", index=False)


def extract_wahlkreis(value):
    match = re.search(r"Wahlkreis (\d+)", value)
    return match.group(1) if match else None

land_to_abbreviation = {
    "Baden-Württemberg": "BW",
    "Bayern": "BY",
    "Berlin": "BE",
    "Brandenburg": "BB",
    "Bremen": "HB",
    "Hamburg": "HH",
    "Hessen": "HE",
    "Mecklenburg-Vorpommern": "MV",
    "Niedersachsen": "NI",
    "Nordrhein-Westfalen": "NW",
    "Rheinland-Pfalz": "RP",
    "Saarland": "SL",
    "Sachsen": "SN",
    "Sachsen-Anhalt": "ST",
    "Schleswig-Holstein": "SH",
    "Thüringen": "TH"
}

def extract_land_then_map_it(value):
    # Extract the name of the state (Land)
    match = re.search(r"Land ([^(]+)", value)
    bundesland_name = match.group(1).strip() if match else None

    # If a name was extracted, map it to its abbreviation
    if bundesland_name:
        return land_to_abbreviation.get(bundesland_name, None)  # Return abbreviation if found, else None
    return None

def extract_listenplatz(value):
    match = re.search(r"Platz\s+(\d+)", value)
    return match.group(1) if match else None


def clean_kandidaten_2017():
    df = pd.read_csv("../csv_data/kandidaten_2017.csv", delimiter=";")

    # Iterate through rows and process 'kandidiert_im'
    rows_to_drop = []
    for i in range(len(df) - 1):
        if str(df.loc[i, "kandidiert im"]).strip().endswith("und"):
            # Append next row's 'kandidiert_im' value
            df.loc[i, "kandidiert im"] = f"{df.loc[i, 'kandidiert im']} {df.loc[i + 1, 'kandidiert im']}"
            # Mark the next row for deletion
            rows_to_drop.append(i + 1)

    df.drop(index=rows_to_drop, inplace=True)

    # Reset index after deletions
    df.reset_index(drop=True, inplace=True)

    # split title, nachname and vorname / add jahr
    for i in range(len(df)):
        nachname, vornamen = str(df.loc[i,"Name, Vorname(n)"]).split(",", maxsplit=1)
        titel=None
        if nachname.__contains__("."):
            # Split from the last occurrence of "."
            titel, nachname = nachname.rsplit(".", 1)
            titel = titel.strip() + "."
        df.loc[i,"Nachname"] = nachname.strip()
        df.loc[i,"Vornamen"] = vornamen.strip()
        df.loc[i,"Titel"] = titel
        df.loc[i, "Jahr"] = 2017

    # make sure there are no duplicates:
    df = df.drop_duplicates(subset=["Nachname", "Vornamen", "Geburtsjahr"], keep="first")

    df.reset_index(drop=True, inplace=True)


    ## process landesliste and wahlkreis possibilities and custom ids
    for i in range(len(df)):
        # Apply the extraction functions to create new columns
        df.loc[i,"WahlkreisNr"] = extract_wahlkreis(df.loc[i,"kandidiert im"])
        df.loc[i,"LandId"] = extract_land_then_map_it(df.loc[i,"kandidiert im"])
        df.loc[i,"Listenplatz"] = extract_listenplatz(df.loc[i,"kandidiert im"])
        df.loc[i, "id"] = i

    #Selecting Specific Columns
    df = df[["id", "Titel", "Nachname", "Vornamen", "Geburtsjahr", "Gruppenname", "WahlkreisNr", "LandId", "Listenplatz", "Jahr"]]

    df.to_csv("kandidaten_2017_v1.csv", index=False)


def merge_kandidaten_2017_2021():
    df1 = pd.read_csv("kandidaten_2017_v1.csv")
    df2 = pd.read_csv("kandidaten_2021_v1.csv")


    # Determine the starting id for the second file to continue where the first one ends
    max_id = df1['id'].max()
    df2['id'] += max_id + 1  # Add max_id to all ids in df2 to continue the sequence

    merged_ids = []

    # Detect duplicates based on "Nachname", "Vornamen", "Geburtsjahr"
    for _, row2 in df2.iterrows():
        # Check if there's a matching row in df1
        duplicate_row = df1[(df1['Nachname'] == row2['Nachname']) &
                            (df1['Vornamen'] == row2['Vornamen']) &
                            (df1['Geburtsjahr'] == row2['Geburtsjahr'])]

        if not duplicate_row.empty:
            # If a duplicate is found, set the id of df2 to the id of the first occurrence in df1
            old_id = row2['id']
            new_id = duplicate_row['id'].iloc[0]
            df2.at[_, 'id'] = new_id  # Override the id in df2
            merged_ids.append((old_id, new_id))

    # Append df2 to df1 (after updating the ids)
    final_df = pd.concat([df1, df2], ignore_index=True)

    final_df.to_csv("merged_kandidaten.csv", index=False)


if __name__ == '__main__':
    clean_kandidaten_2017()
    clean_kandidaten_2021()
    merge_kandidaten_2017_2021()


