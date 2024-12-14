import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Abgeordneter } from "../models/results";
import {
  MRT_Table,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { MRT_Localization_DE } from "material-react-table/locales/de";

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const FilterPanelContainer = styled.div`
  padding: 1rem;
  background-color: rgba(202, 221, 255, 0.8);
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  font-size: 1rem;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Abgeordnete: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [members, setMembers] = useState<Abgeordneter[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/delegates/?year=${year}`);
        const data: Abgeordneter[] = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching delegates:", error);
      }
    };

    fetchMembers();
  }, [year]);

  const columns = useMemo<MRT_ColumnDef<Abgeordneter>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "party",
        header: "Partei",
        filterVariant: "select",
        filterSelectOptions: Array.from(new Set(members.map((m) => m.party))),
      },
      {
        accessorKey: "bundesland",
        header: "Bundesland",
        filterVariant: "select",
        filterSelectOptions: Array.from(
          new Set(members.map((m) => m.bundesland))
        ),
      },
      {
        accessorKey: "direktMandat",
        header: "Direktmandat",
        filterVariant: "checkbox",
        Cell: ({ cell }) => (cell.getValue() ? "Ja" : "Nein"),
      },
      {
        accessorKey: "UberhangMandat",
        header: "Überhangmandat",
        filterVariant: "checkbox",
        Cell: ({ cell }) => (cell.getValue() ? "Ja" : "Nein"),
      },
    ],
    [members]
  );

  const table = useMaterialReactTable({
    columns,
    data: members,
    initialState: { showColumnFilters: true },
    enableKeyboardShortcuts: false,

    enableColumnActions: false,

    enableColumnFilters: true,

    enablePagination: false,

    enableSorting: false,

    localization: MRT_Localization_DE,
  });

  return (
    <PageContainer>
      <FilterPanelContainer>
        <Title>Bundestag {year}</Title>
        <Label>
          Jahr:
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            <option value={2021}>2021</option>
            <option value={2017}>2017</option>
          </Select>
        </Label>
      </FilterPanelContainer>
      <MRT_Table table={table} />
    </PageContainer>
  );
};

export default Abgeordnete;
