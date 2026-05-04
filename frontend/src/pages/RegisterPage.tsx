import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { profileApi } from "../api/profileApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import type { UserType } from "../types/api";
import { useAppDispatch } from "../hooks/redux";
import { setSession } from "../features/auth/authSlice";
import { getErrorMessage, getFieldErrors, type FieldErrors } from "../lib/error";

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [type, setType] = useState<UserType>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [expectedSalary, setExpectedSalary] = useState(0);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [contactNumber, setContactNumber] = useState("");
  const [bio, setBio] = useState("");
  const [errorText, setErrorText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      dispatch(setSession(data));
      const completeProfile = async () => {
        if (data.user.type === "candidate") {
          let resumePath = "";
          if (resumeFile) {
            const uploaded = await profileApi.uploadResume(resumeFile);
            resumePath = uploaded.filePath;
          }
          const savedProfile = await profileApi.upsertCandidateProfile({
            name,
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
            education,
            resume: resumePath,
            expectedSalary: Number(expectedSalary),
            yearsOfExperience: Number(yearsOfExperience),
          });
          queryClient.setQueryData(["candidate-profile"], savedProfile);
          queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
          navigate("/candidate/profile");
          return;
        }

        const savedProfile = await profileApi.upsertRecruiterProfile({
          name,
          contactNumber,
          bio,
        });
        queryClient.setQueryData(["recruiter-profile"], savedProfile);
        queryClient.invalidateQueries({ queryKey: ["recruiter-profile"] });
        navigate("/recruiter/profile");
      };
      completeProfile().catch((error) => {
        setErrorText(getErrorMessage(error));
        setFieldErrors(getFieldErrors(error));
      });
    },
    onError: (error) => {
      setErrorText(getErrorMessage(error));
      setFieldErrors(getFieldErrors(error));
    },
  });

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-semibold">Register</h1>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setErrorText("");
          setFieldErrors({});
          if (password !== repeatPassword) {
            setErrorText("Passwords do not match");
            setFieldErrors({ repeatPassword: "Passwords do not match" });
            return;
          }
          mutation.mutate({ email, password, type });
        }}
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Role</span>
          <select
            className={`w-full rounded-md border px-3 py-2 ${
              fieldErrors.type
                ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                : "border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            }`}
            value={type}
            onChange={(e) => setType(e.target.value as UserType)}
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
          {fieldErrors.type ? <span className="text-xs text-rose-600">{fieldErrors.type}</span> : null}
        </label>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />
        <Input
          label="Retype Password"
          type="password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          error={fieldErrors.repeatPassword}
          required
        />
        {type === "candidate" ? (
          <>
            <Input
              label="Skills (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              error={fieldErrors.skills}
            />
            <Textarea
              label="Education"
              rows={3}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              error={fieldErrors.education}
            />
            <Input
              label="Expected salary"
              type="number"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(Number(e.target.value))}
              error={fieldErrors.expectedSalary}
            />
            <Input
              label="Years of experience"
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              error={fieldErrors.yearsOfExperience}
            />
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Resume PDF</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className={`block w-full rounded-md border px-3 py-2 text-sm ${
                  fieldErrors.resume
                    ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                    : "border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                }`}
              />
              {fieldErrors.resume ? <span className="text-xs text-rose-600">{fieldErrors.resume}</span> : null}
            </label>
          </>
        ) : (
          <>
            <Input
              label="Telephone"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              error={fieldErrors.contactNumber}
            />
            <Textarea
              label="Biography"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              error={fieldErrors.bio}
            />
          </>
        )}
        {errorText ? <p className="text-sm text-rose-600">{errorText}</p> : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Loading..." : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
