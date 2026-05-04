import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAppSelector } from "../hooks/redux";

export function HomePage() {
  const { user, token } = useAppSelector((state) => state.auth);

  if (token && user) {
    const profileLink = user.type === "candidate" ? "/candidate/profile" : "/recruiter/profile";
    const jobsLink = user.type === "candidate" ? "/candidate/jobs" : "/recruiter/jobs";

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <h1 className="mb-2">Welcome back</h1>
          <p className="mb-4 text-sm text-slate-600">
            You are logged in as <span className="font-semibold">{user.type}</span> ({user.email})
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to={profileLink}>
              <Button>Go to profile</Button>
            </Link>
            <Link to={jobsLink}>
              <Button variant="secondary">Go to jobs</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="mb-2 text-xl font-semibold">Candidate</h2>
        <p className="mb-3 text-sm text-slate-600">
          Create your profile, browse jobs, and apply with motivation letter.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/register">
            <Button>Register</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>
        </div>
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-semibold">Recruiter</h2>
        <p className="mb-3 text-sm text-slate-600">
          Create jobs, review applications, rate candidates, and run TOPSIS ranking.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/register">
            <Button>Register</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
