import { Navigate } from "react-router-dom";
import { ADMIN_ROUTES } from "@/constants/routes";

const Index = () => {
  return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />;
};

export default Index;
