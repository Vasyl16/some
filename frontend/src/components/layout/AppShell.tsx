import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../features/auth/authSlice";
import { Button } from "../ui/Button";

export function AppShell() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 transition ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-indigo-50 to-violet-100">
      <header className="sticky top-0 z-10 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-bold tracking-tight text-indigo-700">
            Candidate Selection System
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {user?.type === "candidate" ? (
              <>
                <NavLink to="/candidate/profile" className={navClassName}>
                  Candidate Profile
                </NavLink>
                <NavLink to="/candidate/jobs" className={navClassName}>
                  Candidate Jobs
                </NavLink>
                <NavLink to="/candidate/applications" className={navClassName}>
                  My Applications
                </NavLink>
              </>
            ) : null}
            {user?.type === "recruiter" ? (
              <>
                <NavLink to="/recruiter/profile" className={navClassName}>
                  Recruiter Profile
                </NavLink>
                <NavLink to="/recruiter/jobs" className={navClassName}>
                  Recruiter Jobs
                </NavLink>
                <NavLink to="/recruiter/topsis" className={navClassName}>
                  TOPSIS
                </NavLink>
              </>
            ) : null}
            {user ? (
              <>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
                  title={user.email}
                >
                  {user.type === "recruiter" ? "R" : "C"}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    dispatch(logout());
                    navigate("/login");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClassName}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navClassName}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
