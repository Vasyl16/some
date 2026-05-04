import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { jobsApi } from "../api/jobsApi";
import { applicationsApi } from "../api/applicationsApi";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { SwiperPager } from "../components/ui/SwiperPager";
import { getErrorMessage, getFieldErrors, type FieldErrors } from "../lib/error";
import { useAppSelector } from "../hooks/redux";

export function RecruiterJobDetailsPage() {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const params = useParams();
  const jobId = useMemo(() => Number(params.id), [params.id]);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [applicationsPage, setApplicationsPage] = useState(1);
  const applicationsLimit = 6;

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsApi.getById(jobId),
    enabled: Number.isInteger(jobId) && jobId > 0,
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications", jobId, applicationsPage, applicationsLimit],
    queryFn: () => applicationsApi.getByJob(jobId, { page: applicationsPage, limit: applicationsLimit }),
    enabled: Number.isInteger(jobId) && jobId > 0,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    skills: "",
    jobType: "",
    salary: 0,
    duration: 1,
    maxApplicants: 10,
    maxPositions: 1,
    deadline: "",
  });

  const updateJobMutation = useMutation({
    mutationFn: () =>
      jobsApi.update(jobId, {
        title: editForm.title,
        skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        jobType: editForm.jobType,
        salary: editForm.salary,
        duration: editForm.duration,
        maxApplicants: editForm.maxApplicants,
        maxPositions: editForm.maxPositions,
        deadline: editForm.deadline,
      }),
    onSuccess: () => {
      setMessage("Job updated");
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      setMessage(getErrorMessage(error));
      setFieldErrors(getFieldErrors(error));
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "accepted" | "rejected" }) =>
      applicationsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  if (!Number.isInteger(jobId) || jobId <= 0) {
    return (
      <Card>
        <p>Invalid job id</p>
        <Link to="/recruiter/jobs" className="text-indigo-700 underline">
          Back to recruiter jobs
        </Link>
      </Card>
    );
  }

  const job = jobQuery.data;
  const canEdit = job && user && job.userId === user._id;

  useEffect(() => {
    if (!job) {
      return;
    }
    setEditForm({
      title: job.title,
      skills: job.skills.join(", "),
      jobType: job.jobType,
      salary: job.salary,
      duration: job.duration,
      maxApplicants: job.maxApplicants,
      maxPositions: job.maxPositions,
      deadline: job.deadline,
    });
  }, [job]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h1>{job?.title ?? "Job details"}</h1>
          <Link to="/recruiter/jobs" className="text-sm text-indigo-700 underline">
            Back
          </Link>
        </div>
        {job ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Title"
              value={editForm.title}
              error={fieldErrors.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              label="Job Type"
              value={editForm.jobType}
              error={fieldErrors.jobType}
              onChange={(e) => setEditForm((p) => ({ ...p, jobType: e.target.value }))}
            />
            <Input
              label="Skills"
              value={editForm.skills}
              error={fieldErrors.skills}
              onChange={(e) => setEditForm((p) => ({ ...p, skills: e.target.value }))}
            />
            <Input
              label="Deadline"
              value={editForm.deadline}
              error={fieldErrors.deadline}
              onChange={(e) => setEditForm((p) => ({ ...p, deadline: e.target.value }))}
            />
            <Input
              label="Salary"
              type="number"
              value={editForm.salary}
              error={fieldErrors.salary}
              onChange={(e) => setEditForm((p) => ({ ...p, salary: Number(e.target.value) }))}
            />
            <Input
              label="Duration"
              type="number"
              value={editForm.duration}
              error={fieldErrors.duration}
              onChange={(e) => setEditForm((p) => ({ ...p, duration: Number(e.target.value) }))}
            />
            <Input
              label="Max Applicants"
              type="number"
              value={editForm.maxApplicants}
              error={fieldErrors.maxApplicants}
              onChange={(e) => setEditForm((p) => ({ ...p, maxApplicants: Number(e.target.value) }))}
            />
            <Input
              label="Max Positions"
              type="number"
              value={editForm.maxPositions}
              error={fieldErrors.maxPositions}
              onChange={(e) => setEditForm((p) => ({ ...p, maxPositions: Number(e.target.value) }))}
            />
            <div className="md:col-span-2">
              <Button
                onClick={() => {
                  setFieldErrors({});
                  setMessage("");
                  updateJobMutation.mutate();
                }}
                disabled={!canEdit || updateJobMutation.isPending}
              >
                Save changes
              </Button>
            </div>
          </div>
        ) : null}
        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
      </Card>

      <Card>
        <h2 className="mb-3 text-xl font-semibold">Applications</h2>
        <div className="space-y-2">
          {applicationsQuery.data?.items.map((app) => (
            <div key={app._id} className="rounded border p-3 text-sm">
              <p>Candidate: {app.candidateName || `User #${app.userId}`}</p>
              <p>Candidate ID: {app.userId}</p>
              <p>Status: {app.status}</p>
              <p className="mb-2">SOP: {app.sop || "(empty)"}</p>
              {app.status === "pending" ? (
                <div className="flex gap-2">
                  <Button onClick={() => updateApplicationMutation.mutate({ id: app._id, status: "accepted" })}>
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => updateApplicationMutation.mutate({ id: app._id, status: "rejected" })}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <SwiperPager
          page={applicationsQuery.data?.page ?? applicationsPage}
          totalPages={applicationsQuery.data?.totalPages ?? 1}
          onChange={setApplicationsPage}
        />
      </Card>
    </div>
  );
}

