from typing import Dict, List
import xml.etree.ElementTree as ET



def quick_check():
    with open ('../xml_data/gewaehlte_01.xml', 'rb') as xml_file:
        tree = ET.parse(xml_file)
        root = tree.getroot()

    # Count the occurrences of <Kandidat> elements = Anzahl Sitze 2021
    kandidat_count = len(root.findall('.//Kandidat'))
    print(f"Number of <kandidat> elements: {kandidat_count}")

    count = 0

    for kandidat in root.findall('.//Kandidat'):
        wahldaten = kandidat.find('Wahldaten')
        
        if wahldaten is not None and wahldaten.get('Kennzeichen') == "ERSTSTIMMENBEWERBER":
            count += 1

    print(f"Number of <Kandidat> elements with <Wahldaten Kennzeichen='ERSTSTIMMENBEWERBER'>: {count}")


def xml_parser(
    xml_file: str, 
    main_element: str, 
    fields: List[Dict[str, str]],
    filter_element_path: str = None, 
    filter_attribute: str = None, 
    filter_value: str = None, 
) -> List[Dict[str, str]]:
    """
    Parses an XML file and extracts specified fields into a list of dictionaries, with optional filtering.

    :param xml_file: Path to the XML file to be parsed.
    :param main_element: The tag name of the main element to search (e.g., "Kandidat").
    :param filter_element_path: The relative path from each main element to a specific child element used for filtering.
    :param filter_attribute: The attribute of the filter_element_path element used for filtering (e.g., "Kennzeichen").
    :param filter_value: The value of filter_attribute required for inclusion in the result (e.g., "ERSTSTIMMENBEWERBER").
    :param fields: List of dictionaries specifying each field to extract. Each dictionary should contain:
                   - 'key': the key name for the output dictionary
                   - 'path': the XML path to the desired element (relative to each main element)
                   - 'attribute': the attribute to retrieve from the element (optional; defaults to element text)
    :return: List of dictionaries, each representing extracted data from one main element.
    """
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    parsed_data = []
    
    # Loop through each main element
    for element in root.findall(f'.//{main_element}'):
        # Apply the specified filter if filter parameters are provided
        if filter_element_path and filter_attribute and filter_value:
            filter_element = element.find(filter_element_path)
            if filter_element is None or filter_element.get(filter_attribute) != filter_value:
                continue  # Skip if filter condition is not met
        
        # Initialize dictionary for the current element
        element_data = {}
        
        # Populate dictionary based on provided fields
        for field in fields:
            key = field['key']
            path = field['path']
            attribute = field.get('attribute', None)
            
            # Find the specified element in the XML
            sub_element = element.find(path)
            
            # Extract the attribute or text, as specified
            if sub_element is not None:
                if attribute:
                    element_data[key] = sub_element.get(attribute)
                else:
                    element_data[key] = sub_element.text
            else:
                element_data[key] = None  # Handle missing elements
            
        parsed_data.append(element_data)
    
    return parsed_data


fields = [
    {'key': 'DKName', 'path': 'Personendaten', 'attribute': 'NameTitelVorname1'},
    {'key': 'Partei', 'path': 'Wahldaten/Direkt', 'attribute': 'Gruppenname'},
    {'key': 'wahlkreisId', 'path': 'Wahldaten/Direkt', 'attribute': 'Gebietsnummer'},
    {'key': 'Wahlkreis', 'path': 'Wahldaten/Direkt', 'attribute': 'Gebietsname'},
    {'key': 'ProzentStimmen', 'path': 'Wahldaten', 'attribute': 'Prozent'}
]

parsed_data = xml_parser(
    xml_file='../xml_data/gewaehlte_01.xml',
    main_element='Kandidat',
    fields=fields,
    filter_element_path='Wahldaten',
    filter_attribute='Kennzeichen',
    filter_value='ERSTSTIMMENBEWERBER',
)

for data in parsed_data:
    print(data)

