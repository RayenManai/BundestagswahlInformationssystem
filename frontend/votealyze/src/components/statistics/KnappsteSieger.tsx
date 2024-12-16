import React from "react";
import styled from "styled-components";
import { Statistik1 } from "../../models/results";

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
  if (
    !data ||
    (!data.knappsteSieger.length && !data.knappsteVerlorene.length)
  ) {
    return <div>Keine Daten verfügbar.</div>;
  }

  return (
    <Container>
      <Section>
        <Title>Knappste Sieger</Title>
        <p>
          Top 10 der knappsten Sieger: Die knappsten Sieger sind die gewählten
          Erstkandidaten, welche mit dem geringsten Vorsprung gegen- uber ihren
          Konkurrenten gewonnen haben.
        </p>
        {data.knappsteSieger.map((item, index) => (
          <Card key={index}>
            <Detail>
              <strong>Name:</strong> <span>{item.name}</span>
            </Detail>
            <Detail>
              <strong>Partei:</strong> <span>{item.partei}</span>
            </Detail>
            <Detail>
              <strong>Wahlkreis:</strong> <span>{item.wahlkreis}</span>
            </Detail>
            <Detail>
              <strong>Gewonnene Stimmen:</strong>{" "}
              <span>{item.gewonnene_stimmen}</span>
            </Detail>
            <Detail>
              <strong>Abstand:</strong> <span>{item.sprung} Stimmen</span>
            </Detail>
            <Detail>
              <strong>Vorgaenger Name:</strong> <span>{item.vorg_name}</span>
            </Detail>
            <Detail>
              <strong>Partei:</strong> <span>{item.vorg_partei}</span>
            </Detail>
          </Card>
        ))}
      </Section>

      <Section>
        <Title>Knappste Verlierer</Title>
        <p>
          Sollte eine Partei keinen Wahlkreis gewonnen haben, sollen stattdessen
          die Wahlkreise ausgegeben werden, in denen sie am knappsten verloren
          hat.
        </p>
        {data.knappsteVerlorene.map((item, index) => (
          <Card key={index}>
            <Detail>
              <strong>Name:</strong> <span>{item.name}</span>
            </Detail>
            <Detail>
              <strong>Partei:</strong> <span>{item.partei}</span>
            </Detail>
            <Detail>
              <strong>Wahlkreis:</strong> <span>{item.wahlkreis}</span>
            </Detail>
            <Detail>
              <strong>Gewonnene Stimmen:</strong>{" "}
              <span>{item.gewonnene_stimmen}</span>
            </Detail>
            <Detail>
              <strong>Abstand:</strong> <span>{item.sprung} Stimmen</span>
            </Detail>
            <Detail>
              <strong>Vorgaenger Name:</strong> <span>{item.vorg_name}</span>
            </Detail>
            <Detail>
              <strong>Partei:</strong> <span>{item.vorg_partei}</span>
            </Detail>
          </Card>
        ))}
      </Section>
    </Container>
  );
};

export default KnappsteSieger;
