import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Abgeordnete, Abgeordneter } from "../../models/results";
import {
  MRT_Table,
  MRT_TablePagination,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { MRT_Localization_DE } from "material-react-table/locales/de";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import CustomSnackbar from "../utils/CustomSnackbar";
import Loader from "../loader";
import { BUNDESLAENDER } from "../../models/bundeslaender";
import { useTranslation } from "react-i18next";

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const FilterPanelContainer = styled.div`
  padding: 1rem;
  width: 30%;
  margin: 0 auto 1rem;
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

const TableContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  width: 80%;
`;

const AbgeordneteListe: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [members, setMembers] = useState<Abgeordneter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setError(false);
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/delegates?year=${year}`);
        const data: Abgeordnete = await response.json();
        setMembers(data.abgeordnete);
      } catch (error) {
        console.error("Error fetching delegates:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [year]);

  const columns = useMemo<MRT_ColumnDef<Abgeordneter>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("Name"),
      },
      {
        accessorKey: "party",
        header: t("Partei"),
        filterVariant: "select",
        filterSelectOptions: Array.from(new Set(members.map((m) => m.party))),
      },
      {
        accessorKey: "bundesland",
        header: t("Bundesland"),
        filterVariant: "select",
        filterSelectOptions: Array.from(
          new Set(members.map((m) => m.bundesland))
        ).map((abbreviation) => ({
          value: abbreviation,
          label:
            BUNDESLAENDER.find((b) => b.abbreviation === abbreviation)?.name ||
            abbreviation,
        })),
        Cell: ({ cell }) =>
          BUNDESLAENDER.find((b) => b.abbreviation === cell.getValue())!.name,
      },
      {
        accessorKey: "direktMandat",
        header: t("Direktmandat"),
        filterVariant: "checkbox",
        Cell: ({ cell }) => (cell.getValue() === true ? "✔️" : "❌"),
      },
      {
        accessorKey: "UberhangMandat",
        header: t("Überhangmandat"),
        filterVariant: "checkbox",
        Cell: ({ cell }) => (cell.getValue() === true ? "✔️" : "❌"),
      },
    ],
    [members, t]
  );

  const getLocalization = () => {
    switch (i18n.language) {
      case "de":
        return MRT_Localization_DE;
      case "en":
        return MRT_Localization_EN;
      default:
        return MRT_Localization_EN; // Fallback to English
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: members,
    initialState: { showColumnFilters: true },
    enableKeyboardShortcuts: false,

    enableColumnActions: false,

    enableColumnFilters: true,

    enablePagination: true,

    paginationDisplayMode: "pages",

    enableSorting: false,

    localization: useMemo(() => getLocalization(), [i18n.language]),
  });

  return (
    <PageContainer>
      <FilterPanelContainer>
        <Title>
          {t("Bundestag")} {year}
        </Title>
        <Label>
          {t("Jahr")}:
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            <option value={2021}>2021</option>
            <option value={2017}>2017</option>
          </Select>
        </Label>
      </FilterPanelContainer>
      {error && !loading && (
        <CustomSnackbar
          backgroundColor={"#ff656c"}
          color={"white"}
          message={t("Fehler beim Laden, bitte später erneut versuchen")}
        />
      )}

      {!loading && !error && members.length > 0 && (
        <TableContainer>
          <MRT_Table table={table} />
          <MRT_TablePagination table={table} />
        </TableContainer>
      )}

      {loading && <Loader />}
    </PageContainer>
  );
};

export default AbgeordneteListe;
