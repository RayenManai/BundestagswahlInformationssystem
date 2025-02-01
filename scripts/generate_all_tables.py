from csv_to_sql import *
from data_cleaning import *
from stimm_generator import refresh_einzelstimmen
from insert_all_kandidat_info import *

if __name__ == '__main__':
    create_partei()
    create_bundesland()
    create_bundesland_struktur()
    create_wahlkreis()
    create_zweitstimmeErgebnisse_2017()
    create_zweitstimmeErgebnisse_2021()
    clean_kandidaten_2017()
    clean_kandidaten_2021()
    merge_kandidaten_2017_2021()
    insert_candidates()
    insert_partei_listen()
    create_direkt_kandidaturen_2017()
    create_direkt_kandidaturen_2021()
    create_wahlkreisinfo_2021()
    create_wahlkreisinfo_2017()
    update_wahlkreisinfo_2021()
    update_wahlkreisinfo_2017()
    #os.remove('kandidaten_2017_v1.csv')
    #os.remove('kandidaten_2021_v1.csv')
    #os.remove('merged_kandidaten.csv')
    refresh_einzelstimmen()