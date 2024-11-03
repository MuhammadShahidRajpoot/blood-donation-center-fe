export const CallJobStatusEnum = {
  SCHEDULED: 'scheduled', // the call job has been assigned to agents but calling has not yet been started
  COMPLETE: 'complete', // the system has attempted to dial each number on all segments for this call job at least one time, has posted a call outcome on all records, and all agents have clicked "FINISH" on this particular call job.
  CANCELLED: 'cancelled', // Cancelled before being in progress either after pending or assigned
  IN_PROGRESS: 'in-progress', // calling for this call job has begun; at least one agent is actively engaged in calling for this call job.
  IN_COMPLETE: 'in-complete', // the call job has been started by one or more agents, but no agent is currently actively engaged in calling for this call job, all records in the call job segment(s) do not have an outcome, and no agent has clicked the "FINISH" CTA (this status will also appear if these conditions apply and the end date has passed).
  PENDING: 'pending',
  IN_ACTIVE: 'Inactive',
  ASSIGNED: 'assigned',
};
