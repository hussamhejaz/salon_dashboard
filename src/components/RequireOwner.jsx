// src/components/RequireOwner.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function RequireOwner({ children }) {
  // this is what we set after successful login
  const token = localStorage.getItem("auth_token");

  const location = useLocation();

  if (!token) {
    // not logged in → send to /login
    // we also remember where they were going, so after login we can send them back
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // logged in → allow dashboard to render
  return children;
}
