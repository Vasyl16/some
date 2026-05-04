import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import type { UserType } from "../../types/api";

interface Props {
  role?: UserType;
}

export function ProtectedRoute({ role, children }: PropsWithChildren<Props>) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.type !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
