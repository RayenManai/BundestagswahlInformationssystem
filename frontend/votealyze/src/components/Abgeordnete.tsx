import React, { useState, useEffect } from "react";
import styled from "styled-components";
import FilterPanel from "./FilterPanel";
import { Abgeordneter } from "../models/results";

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MemberCard = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const Abgeordnete: React.FC = () => {
  const [year, setYear] = useState<number>(2021);
  const [bundesland, setBundesland] = useState<string | null>(null);
  const [wahlkreis, setWahlkreis] = useState<string | null>(null);
  const [members, setMembers] = useState<Abgeordneter[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members");
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  return (
    <PageContainer>
      <FilterPanel
        year={year}
        bundesland={bundesland}
        wahlkreis={wahlkreis}
        setYear={setYear}
        setBundesland={setBundesland}
        setWahlkreis={setWahlkreis}
      />
      <Title>Mitglieder des Bundestages</Title>
      <MembersList>
        {members.map((member) => (
          <MemberCard key={member.name}>
            <h2>{member.name}</h2>
            <p>Partei: {member.party}</p>
            <p>Wahlkreis: {member.wahlkreis}</p>
          </MemberCard>
        ))}
      </MembersList>
    </PageContainer>
  );
};

export default Abgeordnete;
