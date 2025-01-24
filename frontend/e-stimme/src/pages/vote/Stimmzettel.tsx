import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import { Stimmzettel as StimmzettelType } from "../../models/StimmzettelType";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 5rem;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Text = styled.p`
  font-size: 18px;
  margin: 0;
  margin-top: 0.5rem;
`;

const VoteContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 900px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ColumnHeader = styled.h2`
  text-align: center;
  margin: 0 0 1rem 0;
  font-size: 20px;
  font-weight: bold;
`;

const Card = styled.div<{ paddingLeft?: string }>`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 120px;
  ${({ paddingLeft }) => paddingLeft && `padding-left: ${paddingLeft};`}
`;

const CardTitle = styled.h2`
  font-size: 18px;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #555;
  margin: 0;
`;

const CheckboxWrapper = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  ${({ position }) => (position === "right" ? "right: 1rem;" : "left: 1rem;")}
  top: 50%;
  transform: translateY(-50%);
`;

const SubmitButton = styled(Button)`
  margin-top: 2rem !important;
  align-self: center;
`;

const Stimmzettel: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [wahlkreis, setWahlkreis] = useState<string | null>(null);

  const { token, data }: { token: string; data: StimmzettelType } =
    location.state || {};

  const storedData = sessionStorage.getItem("stimmzettelData");
  const parsedStoredData = storedData ? JSON.parse(storedData) : null;

  const finalData = data || parsedStoredData;

  const [selectedFirstVotes, setSelectedFirstVotes] = useState<
    Record<string, boolean>
  >({});
  const [selectedSecondVotes, setSelectedSecondVotes] = useState<
    Record<string, boolean>
  >({});

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedWahlkreis = sessionStorage.getItem("wahlkreis");
    setWahlkreis(storedWahlkreis);
  }, []);

  const handleFirstVoteChange = (id: string) => {
    setSelectedFirstVotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSecondVoteChange = (id: string) => {
    setSelectedSecondVotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Collect selected vote IDs
  const getSelectedVoteIds = (votes: Record<string, boolean>) => {
    return Object.entries(votes)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
  };

  const handleVoteSubmit = async () => {
    const firstVoteIds = getSelectedVoteIds(selectedFirstVotes);
    const secondVoteIds = getSelectedVoteIds(selectedSecondVotes);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          firstVote: firstVoteIds,
          secondVote: secondVoteIds,
        }),
      });

      if (response.ok) {
        // Show success dialog
        setSuccessDialogOpen(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Fehler beim Absenden der Stimme."
        );
      }
    } catch (error) {
      setErrorMessage(
        "Es gab ein Problem beim Absenden Ihrer Stimme. Bitte versuchen Sie es später erneut."
      );
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>STIMMZETTEL</Title>
        <Text>
          für die Wahl zum Deutschen Bundestag im Wahlkreis {wahlkreis || "—"}{" "}
          am 23. Februar 2025
        </Text>
      </Header>
      <VoteContainer>
        <Column>
          <ColumnHeader>Erststimme</ColumnHeader>{" "}
          {finalData.firstVote.map((candidate) => (
            <Card key={candidate.id}>
              <div>
                <CardTitle>
                  {candidate.titel} {candidate.vorname} {candidate.name}
                </CardTitle>
                {candidate.partei && (
                  <Subtitle>
                    {candidate.partei} ({candidate.parteiKurz})
                  </Subtitle>
                )}
              </div>
              <CheckboxWrapper position="right">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFirstVotes[candidate.id] || false}
                      onChange={() => handleFirstVoteChange(candidate.id)}
                    />
                  }
                  label=""
                />
              </CheckboxWrapper>
            </Card>
          ))}
        </Column>

        <Column>
          <ColumnHeader>Zweitstimme</ColumnHeader>{" "}
          {finalData.secondVote.map((party) => (
            <Card key={party.id} paddingLeft="4rem">
              <CheckboxWrapper position="left">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSecondVotes[party.id] || false}
                      onChange={() => handleSecondVoteChange(party.id)}
                    />
                  }
                  label=""
                />
              </CheckboxWrapper>
              <div>
                <CardTitle>
                  {party.name} ({party.kurzbezeichnung})
                </CardTitle>
                <Subtitle>
                  {party.parteiListe.map((kandidat, index) => (
                    <span key={index}>
                      {kandidat.titel} {kandidat.vorname} {kandidat.name}
                      {index < party.parteiListe.length - 1 && ", "}
                    </span>
                  ))}
                </Subtitle>
              </div>
            </Card>
          ))}
        </Column>
      </VoteContainer>
      <SubmitButton
        variant="contained"
        color="primary"
        onClick={() => setDialogOpen(true)}
        style={{ marginTop: "2rem" }}
      >
        STIMME ABGEBEN
      </SubmitButton>

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Bestätigung Ihrer Stimmabgabe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie Ihre Stimme jetzt abgeben möchten? Dies
            kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Nein, zurück
          </Button>
          <Button
            onClick={() => {
              setDialogOpen(false);
              handleVoteSubmit();
            }}
            color="primary"
            autoFocus
          >
            Ja, Stimme abgeben
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isSuccessDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          sessionStorage.clear();
          navigate("/vote");
        }}
      >
        <DialogTitle>Erfolgreiche Stimmabgabe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ihre Stimme wurde erfolgreich gespeichert. Vielen Dank für Ihre
            Teilnahme an der Wahl.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              sessionStorage.clear();
              navigate("/vote");
            }}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {errorMessage && (
        <Dialog
          open={Boolean(errorMessage)}
          onClose={() => setErrorMessage(null)}
        >
          <DialogTitle>Fehler</DialogTitle>
          <DialogContent>
            <DialogContentText>{errorMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setErrorMessage(null)} color="primary">
              Schließen
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </PageContainer>
  );
};
export default Stimmzettel;
