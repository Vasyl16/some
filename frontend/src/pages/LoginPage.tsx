import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAppDispatch } from "../hooks/redux";
import { setSession } from "../features/auth/authSlice";
import { getErrorMessage } from "../lib/error";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(setSession(data));
      navigate(data.user.type === "candidate" ? "/candidate" : "/recruiter");
    },
    onError: (error) => setErrorText(getErrorMessage(error)),
  });

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setErrorText("");
          mutation.mutate({ email, password });
        }}
      >
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorText ? <p className="text-sm text-rose-600">{errorText}</p> : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Loading..." : "Login"}
        </Button>
        <p className="text-sm text-slate-600">
          No account yet?{" "}
          <Link to="/register" className="font-medium text-indigo-700 underline underline-offset-2">
            Register
          </Link>
        </p>
      </form>
    </Card>
  );
}
