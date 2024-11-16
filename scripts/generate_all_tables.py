from csv_to_sql import *
from data_cleaning import *
from stimm_generator import erstimme_generator, zweitstimme_generator
from insert_all_kandidat_info import *
import os

if __name__ == '__main__':
    #create_partei()
    #create_bundesland()
    #create_wahlkreis()
    #create_zweitstimmeErgebnisse_2017()
    #create_zweitstimmeErgebnisse_2021()
    #clean_kandidaten_2017()
    #clean_kandidaten_2021()
    #merge_kandidaten_2017_2021()
    #insert_candidates()
    #insert_partei_listen()
    create_direkt_kandidaturen_2017()
    create_direkt_kandidaturen_2021()
    #os.remove('kandidaten_2017_v1.csv')
    #os.remove('kandidaten_2021_v1.csv')
    #os.remove('merged_kandidaten.csv')
    for i in range(1, 250, 50):
        erstimme_generator(wahlkreisId=i, jahr=2017, until=min(i+50, 299))
        erstimme_generator(wahlkreisId=i, jahr=2021, until=min(i+50, 299))
        zweitstimme_generator(wahlkreisId=i, jahr=2017, until=min(i+50, 299))
        zweitstimme_generator(wahlkreisId=i, jahr=2021, until=min(i+50, 299))
    # TODO: Try bulk insert