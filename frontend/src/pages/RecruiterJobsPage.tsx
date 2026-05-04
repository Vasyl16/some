import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { jobsApi } from "../api/jobsApi";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { getErrorMessage, getFieldErrors, type FieldErrors } from "../lib/error";
import { useAppSelector } from "../hooks/redux";

export function RecruiterJobsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((state) => state.auth.user);
  const initialJobForm = {
    title: "",
    skills: "",
    jobType: "",
    salary: 0,
    duration: 1,
    maxApplicants: 10,
    maxPositions: 1,
    deadline: "",
  };
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [jobForm, setJobForm] = useState(initialJobForm);

  const jobsQuery = useQuery({ queryKey: ["jobs", 1, 50], queryFn: () => jobsApi.getAll({ page: 1, limit: 50 }) });

  const createJobMutation = useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      setMessage("Job created");
      setJobForm(initialJobForm);
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
      setFieldErrors(getFieldErrors(error));
    },
  });

  const recruiterJobs = (jobsQuery.data?.items ?? []).filter((job) => job.userId === currentUser?._id);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Create Job</h2>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            setFieldErrors({});
            createJobMutation.mutate({
              ...jobForm,
              skills: jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
            });
          }}
        >
          <Input
            label="Title"
            value={jobForm.title}
            error={fieldErrors.title}
            onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="Job Type"
            value={jobForm.jobType}
            error={fieldErrors.jobType}
            onChange={(e) => setJobForm((p) => ({ ...p, jobType: e.target.value }))}
          />
          <Input
            label="Skills (comma separated)"
            value={jobForm.skills}
            error={fieldErrors.skills}
            onChange={(e) => setJobForm((p) => ({ ...p, skills: e.target.value }))}
          />
          <Input
            label="Deadline (YYYY-MM-DD)"
            value={jobForm.deadline}
            error={fieldErrors.deadline}
            onChange={(e) => setJobForm((p) => ({ ...p, deadline: e.target.value }))}
          />
          <Input
            label="Salary"
            type="number"
            value={jobForm.salary}
            error={fieldErrors.salary}
            onChange={(e) => setJobForm((p) => ({ ...p, salary: Number(e.target.value) }))}
          />
          <Input
            label="Duration (months)"
            type="number"
            value={jobForm.duration}
            error={fieldErrors.duration}
            onChange={(e) => setJobForm((p) => ({ ...p, duration: Number(e.target.value) }))}
          />
          <Input
            label="Max Applicants"
            type="number"
            value={jobForm.maxApplicants}
            error={fieldErrors.maxApplicants}
            onChange={(e) => setJobForm((p) => ({ ...p, maxApplicants: Number(e.target.value) }))}
          />
          <Input
            label="Max Positions"
            type="number"
            value={jobForm.maxPositions}
            error={fieldErrors.maxPositions}
            onChange={(e) => setJobForm((p) => ({ ...p, maxPositions: Number(e.target.value) }))}
          />
          <div className="md:col-span-2">
            <Button type="submit">Create job</Button>
          </div>
        </form>
        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
      </Card>

      <Card>
        <h2 className="mb-3 text-xl font-semibold">My Jobs</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {recruiterJobs.map((job) => (
            <div key={job._id} className="rounded-xl border bg-white/60 p-3">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-slate-600">
                Applicants: {job.activeApplications} | Accepted: {job.acceptedCandidates}
              </p>
              <div className="mt-2">
                <Link to={`/recruiter/jobs/${job._id}`}>
                  <Button variant="secondary">View</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
