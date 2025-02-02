import React from "react";
import styled from "styled-components";
import { Statistik1 } from "../../models/results";
import { useTranslation } from "react-i18next";
import { WAHLKREISE } from "../../models/wahlkreise";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  width: 60%;
  margin: 0 auto;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #fff;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  padding: 1rem;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Card = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  background-color: #f7f7f7;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Detail = styled.div`
  font-size: 1rem;
  color: #555;
  display: flex;
  justify-content: space-between;
`;

interface KnappsteSiegerProps {
  data: Statistik1;
}

const KnappsteSieger: React.FC<KnappsteSiegerProps> = ({ data }) => {
  const { t } = useTranslation();

  const getWahlkreisName = (id: number): string => {
    for (const bundesland in WAHLKREISE) {
      const found = WAHLKREISE[bundesland as keyof typeof WAHLKREISE].find(
        (wahlkreis: { id: number }) => wahlkreis.id === id
      );
      if (found) return found.name;
    }
    return `Wahlkreis ${id}`;
  };

  if (
    !data ||
    (!data.knappsteSieger.length && !data.knappsteVerlorene.length)
  ) {
    return <div>Keine Daten verfügbar.</div>;
  }

  return (
    <Container>
      <Section>
        <Title>{t("Knappste Sieger")}</Title>
        <Paragraph>{t("knap_sieger")}</Paragraph>
        {data.knappsteSieger.map((item, index) => (
          <Card key={index}>
            <Detail>
              <strong>{t("Name")}:</strong> <span>{item.name}</span>
            </Detail>
            <Detail>
              <strong>{t("Partei")}:</strong> <span>{item.partei}</span>
            </Detail>
            <Detail>
              <strong>{t("Wahlkreis")}:</strong>{" "}
              <span>{getWahlkreisName(Number(item.wahlkreis))}</span>
            </Detail>
            <Detail>
              <strong>{t("Gewonnene Stimmen")}:</strong>{" "}
              <span>{item.gewonnene_stimmen}</span>
            </Detail>
            <Detail>
              <strong>{t("Abstand")}:</strong>{" "}
              <span>
                {item.sprung} {t("Stimmen")}
              </span>
            </Detail>
            <Detail>
              <strong>{t("Vorgänger Name")}:</strong>{" "}
              <span>{item.vorg_name}</span>
            </Detail>
            <Detail>
              <strong>{t("Partei")}:</strong> <span>{item.vorg_partei}</span>
            </Detail>
          </Card>
        ))}
      </Section>

      <Section>
        <Title>{t("Knappste Verlierer")}</Title>
        <Paragraph>{t("knap_verlierer")}</Paragraph>
        {data.knappsteVerlorene.map((item, index) => (
          <Card key={index}>
            <Detail>
              <strong>{t("Name")}:</strong> <span>{item.name}</span>
            </Detail>
            <Detail>
              <strong>{t("Partei")}:</strong> <span>{item.partei}</span>
            </Detail>
            <Detail>
              <strong>{t("Wahlkreis")}:</strong>{" "}
              <span>{getWahlkreisName(Number(item.wahlkreis))}</span>
            </Detail>
            <Detail>
              <strong>{t("Gewonnene Stimmen")}:</strong>{" "}
              <span>{item.gewonnene_stimmen}</span>
            </Detail>
            <Detail>
              <strong>{t("Abstand")}:</strong>{" "}
              <span>
                {item.sprung} {t("Stimmen")}
              </span>
            </Detail>
            <Detail>
              <strong>{t("Vorgänger Name")}:</strong>{" "}
              <span>{item.vorg_name}</span>
            </Detail>
            <Detail>
              <strong>{t("Partei")}:</strong> <span>{item.vorg_partei}</span>
            </Detail>
          </Card>
        ))}
      </Section>
    </Container>
  );
};

export default KnappsteSieger;
