import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../lib/error";

export function RecruiterProfilePage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", contactNumber: "", bio: "" });

  const recruiterProfileQuery = useQuery({
    queryKey: ["recruiter-profile"],
    queryFn: profileApi.getRecruiterProfile,
    retry: false,
  });

  const saveProfileMutation = useMutation({
    mutationFn: profileApi.upsertRecruiterProfile,
    onSuccess: () => {
      setMessage("Recruiter profile saved");
      queryClient.invalidateQueries({ queryKey: ["recruiter-profile"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Recruiter Profile</h2>
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          const existing = recruiterProfileQuery.data;
          saveProfileMutation.mutate({
            name: profileForm.name || existing?.name || "",
            contactNumber: profileForm.contactNumber || existing?.contactNumber || "",
            bio: profileForm.bio || existing?.bio || "",
          });
        }}
      >
        <Input
          label="Name"
          value={profileForm.name || recruiterProfileQuery.data?.name || ""}
          onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Input
          label="Contact Number"
          value={profileForm.contactNumber || recruiterProfileQuery.data?.contactNumber || ""}
          onChange={(e) => setProfileForm((p) => ({ ...p, contactNumber: e.target.value }))}
        />
        <div className="md:col-span-2">
          <Textarea
            label="Bio"
            rows={3}
            value={profileForm.bio || recruiterProfileQuery.data?.bio || ""}
            onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <Button type="submit">Save profile</Button>
          {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        </div>
      </form>
    </Card>
  );
}
