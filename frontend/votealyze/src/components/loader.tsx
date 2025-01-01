import React from "react";
import styled, { keyframes } from "styled-components";

const growBar = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(202, 221, 255, 0.1);
  gap: 1rem;
`;

const Title = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 50%;
`;

const Bar = styled.div`
  height: 20px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ color: string; delay: number }>`
  height: 100%;
  width: 100%;
  background-color: ${(props) => props.color};
  animation: ${growBar} 1.5s ease-in-out infinite;
  animation-delay: ${(props) => props.delay}s;
`;

const Loader: React.FC = () => {
  const bars = [
    { color: "#004B76", delay: 0 },
    { color: "#008549", delay: 0.3 },
    { color: "#c0003d", delay: 0.6 },
    { color: "#f7bc3d", delay: 0.9 },
    { color: "#5f316e", delay: 1.2 },
  ];

  return (
    <LoadingWrapper>
      <Title>Ergebnisse werden geladen...</Title>
      <BarContainer>
        {bars.map((bar, index) => (
          <Bar key={index}>
            <BarFill color={bar.color} delay={bar.delay} />
          </Bar>
        ))}
      </BarContainer>
    </LoadingWrapper>
  );
};

export default Loader;
