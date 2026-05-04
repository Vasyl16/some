import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../lib/error";
import { api } from "../api/client";

export function CandidateProfilePage() {
  const queryClient = useQueryClient();
  const [profileMessage, setProfileMessage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResumePath, setUploadedResumePath] = useState("");
  const [isProfileInitialized, setIsProfileInitialized] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    skills: "",
    education: "",
    resume: "",
    expectedSalary: 0,
    yearsOfExperience: 0,
  });

  const profileQuery = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: profileApi.getCandidateProfile,
    retry: false,
  });

  useEffect(() => {
    if (!profileQuery.data || isProfileInitialized) {
      return;
    }

    setProfileForm({
      name: profileQuery.data.name ?? "",
      skills: (profileQuery.data.skills ?? []).join(", "),
      education: profileQuery.data.education ?? "",
      resume: profileQuery.data.resume ?? "",
      expectedSalary: profileQuery.data.expectedSalary ?? 0,
      yearsOfExperience: profileQuery.data.yearsOfExperience ?? 0,
    });
    setUploadedResumePath(profileQuery.data.resume ?? "");
    setIsProfileInitialized(true);
  }, [isProfileInitialized, profileQuery.data]);

  const buildCandidatePayload = (resumeOverride?: string) => {
    const existing = profileQuery.data;
    const mergedSkillsSource = profileForm.skills || (existing?.skills ?? []).join(", ");
    return {
      name: profileForm.name || existing?.name || "",
      skills: mergedSkillsSource
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      education: profileForm.education || existing?.education || "",
      resume: resumeOverride || uploadedResumePath || profileForm.resume || existing?.resume || "",
      expectedSalary: Number(profileForm.expectedSalary || existing?.expectedSalary || 0),
      yearsOfExperience: Number(profileForm.yearsOfExperience || existing?.yearsOfExperience || 0),
    };
  };

  const saveProfileMutation = useMutation({
    mutationFn: profileApi.upsertCandidateProfile,
    onSuccess: () => {
      setProfileMessage("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
    onError: (error) => setProfileMessage(getErrorMessage(error)),
  });

  const uploadResumeMutation = useMutation({
    mutationFn: profileApi.uploadResume,
    onSuccess: (data) => {
      setUploadedResumePath(data.filePath);
      setProfileForm((prev) => ({ ...prev, resume: data.filePath }));
      saveProfileMutation.mutate(buildCandidatePayload(data.filePath));
    },
    onError: (error) => setProfileMessage(getErrorMessage(error)),
  });

  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Candidate Profile</h2>
      {(profileQuery.data?.resume || uploadedResumePath) ? (
        <div className="mb-3 flex items-center justify-between rounded-xl border bg-white/60 p-3 text-sm">
          <p className="text-slate-700">Resume is uploaded</p>
          <a
            className="font-semibold text-indigo-700 underline"
            href={`${(api.defaults.baseURL ?? "http://localhost:5000/api").replace("/api", "")}${uploadedResumePath || profileQuery.data?.resume}`}
            target="_blank"
            rel="noreferrer"
          >
            View PDF
          </a>
        </div>
      ) : null}
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setProfileMessage("");
          saveProfileMutation.mutate(buildCandidatePayload());
        }}
      >
        <Input
          label="Name"
          value={profileForm.name || profileQuery.data?.name || ""}
          onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Input
          label="Skills (comma separated)"
          value={profileForm.skills || (profileQuery.data?.skills ?? []).join(", ")}
          onChange={(e) => setProfileForm((p) => ({ ...p, skills: e.target.value }))}
        />
        <Input
          label="Expected Salary"
          type="number"
          value={profileForm.expectedSalary}
          onChange={(e) => setProfileForm((p) => ({ ...p, expectedSalary: Number(e.target.value) }))}
        />
        <Input
          label="Years of Experience"
          type="number"
          value={profileForm.yearsOfExperience}
          onChange={(e) =>
            setProfileForm((p) => ({ ...p, yearsOfExperience: Number(e.target.value) }))
          }
        />
        <div className="md:col-span-2">
          <Textarea
            label="Education"
            rows={3}
            value={profileForm.education || profileQuery.data?.education || ""}
            onChange={(e) => setProfileForm((p) => ({ ...p, education: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Resume PDF</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setProfileMessage("");
                if (!resumeFile) {
                  setProfileMessage("Choose a PDF file first");
                  return;
                }
                uploadResumeMutation.mutate(resumeFile);
              }}
              disabled={uploadResumeMutation.isPending}
            >
              {uploadResumeMutation.isPending ? "Uploading..." : "Upload PDF"}
            </Button>
            {uploadedResumePath ? (
              <span className="text-xs text-slate-600">Uploaded: {uploadedResumePath}</span>
            ) : null}
          </div>
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={saveProfileMutation.isPending}>
            Save profile
          </Button>
          {profileMessage ? <p className="text-sm text-slate-700">{profileMessage}</p> : null}
        </div>
      </form>
    </Card>
  );
}
