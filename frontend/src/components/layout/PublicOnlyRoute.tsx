import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (token && user) {
    const target = user.type === "candidate" ? "/candidate/profile" : "/recruiter/profile";
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
