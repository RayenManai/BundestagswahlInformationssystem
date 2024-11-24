import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import styled from "styled-components";

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

const MainContent = styled.main`
    flex: 1;
    padding: 1rem;
    text-align: center;
`;

const App: React.FC = () => {
    return (
        <PageContainer>
            <Header />
            <MainContent>
                <h2>Votealyze react frontend template</h2>
                <p>This is the first page of this React project.</p>
            </MainContent>
            <Footer />
        </PageContainer>
    );
};

export default App;
