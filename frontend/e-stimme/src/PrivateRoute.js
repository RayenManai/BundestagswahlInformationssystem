import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    if (initialized) {
      console.log("Keycloak initialized");
    }
  }, [initialized, keycloak]);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  const isLoggedIn = keycloak?.authenticated;
  return isLoggedIn ? children : keycloak?.login();
};

export default PrivateRoute;
