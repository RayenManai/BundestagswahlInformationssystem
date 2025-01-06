import Keycloak from "keycloak-js";

export const keycloakConfig = {
  local: {
    checkLoginIframe: false,
    url: "http://localhost:8080",
    realm: "BundestagswahlInformationssystem",
    clientId: "e_stimme",
    onLoad: "login-required",
  },
  prod: {
    checkLoginIframe: false,
    url: "https://prod-keycloak-server.com",
    realm: "BundestagswahlInformationssystem",
    clientId: "e_stimme",
    onLoad: "login-required",
  },
};

export const getKeycloakConfig = () => {
  const environment = (
    process.env.REACT_APP_ENV === "prod" ? "prod" : "local"
  ) as keyof typeof keycloakConfig;
  return keycloakConfig[environment];
};

export const createKeycloak = () => {
  const config = getKeycloakConfig();
  const keycloakInstance = new Keycloak(config);
  return keycloakInstance;
};

const keycloak = createKeycloak();
export default keycloak;
