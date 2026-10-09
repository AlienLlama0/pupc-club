import type { DemoState, Task, TaskStatus } from '../types';
import { logActivity, notify } from '../store/DemoStore';
import { nowISO, uid } from './util';

/** Executives who hold an active role that grants `tasks.review`. */
export const reviewerIds = (d: DemoState) =>
  d.executives.filter(e => e.roleIds.some(r => { const ro = d.roles.find(x => x.id === r); return ro?.active && ro.permissions.includes('tasks.review'); })).map(e => e.id);

const link = (t: Task) => `/dashboard/tasks?task=${t.id}`;

export function createTask(d: DemoState, actorId: string, t: Omit<Task, 'id' | 'comments' | 'deliverables' | 'history' | 'createdBy' | 'progress' | 'status'>) {
  const task: Task = { ...t, id: uid('t'), status: 'To Do', progress: 0, comments: [], deliverables: [], createdBy: actorId, history: [{ at: nowISO(), actorId, text: 'Created the task and assigned it' }] };
  d.tasks.unshift(task);
  notify(d, task.assigneeIds, 'New task assigned', task.title, 'task', link(task));
  logActivity(d, actorId, `created task “${task.title}”`);
  return task;
}

export function editTask(d: DemoState, actorId: string, id: string, patch: Partial<Task>) {
  const t = d.tasks.find(x => x.id === id); if (!t) return;
  const added = (patch.assigneeIds ?? []).filter(a => !t.assigneeIds.includes(a));
  Object.assign(t, patch);
  t.history.push({ at: nowISO(), actorId, text: 'Edited task details' });
  if (added.length) notify(d, added, 'New task assigned', t.title, 'task', link(t));
}

export function setStatus(d: DemoState, actorId: string, id: string, status: TaskStatus, note?: string) {
  const t = d.tasks.find(x => x.id === id); if (!t || t.status === status) return;
  const prev = t.status;
  t.status = status;
  if (status === 'Completed') t.progress = 100;
  if (status === 'Under Review') {
    t.history.push({ at: nowISO(), actorId, text: 'Submitted for review' });
    const name = d.executives.find(e => e.id === actorId)?.name ?? 'Someone';
    notify(d, reviewerIds(d).filter(r => r !== actorId), 'Review requested', `${name} submitted “${t.title}”.`, 'review', link(t));
    logActivity(d, actorId, `submitted “${t.title}” for review`);
  } else if (status === 'Completed' && prev === 'Under Review') {
    t.history.push({ at: nowISO(), actorId, text: 'Approved the submission' });
    notify(d, t.assigneeIds, 'Task approved', `“${t.title}” was approved.`, 'review', link(t));
    logActivity(d, actorId, `approved “${t.title}”`);
  } else if (prev === 'Under Review' && status === 'In Progress') {
    t.history.push({ at: nowISO(), actorId, text: 'Requested changes' });
    if (note) t.comments.push({ id: uid('c'), authorId: actorId, text: note, at: nowISO(), kind: 'review' });
    notify(d, t.assigneeIds, 'Changes requested', `“${t.title}”: ${note || 'see comments'}`, 'review', link(t));
    logActivity(d, actorId, `returned “${t.title}” with changes requested`);
  } else {
    t.history.push({ at: nowISO(), actorId, text: `Moved from ${prev} to ${status}` });
    if (status === 'Completed') logActivity(d, actorId, `completed “${t.title}”`);
  }
}

export function addComment(d: DemoState, actorId: string, id: string, text: string, kind: 'comment' | 'progress' = 'comment', progress?: number) {
  const t = d.tasks.find(x => x.id === id); if (!t) return;
  t.comments.push({ id: uid('c'), authorId: actorId, text, at: nowISO(), kind });
  if (progress !== undefined) {
    t.progress = progress;
    if (t.status === 'To Do' && progress > 0) t.status = 'In Progress';
    t.history.push({ at: nowISO(), actorId, text: `Updated progress to ${progress}%` });
  }
  const others = [...t.assigneeIds, t.createdBy].filter(x => x !== actorId);
  if (others.length) notify(d, others, kind === 'progress' ? 'Progress update' : 'New comment', `${t.title}: ${text.slice(0, 80)}`, 'task', link(t));
}

export function addDeliverable(d: DemoState, actorId: string, id: string, name: string, url: string) {
  const t = d.tasks.find(x => x.id === id); if (!t) return;
  t.deliverables.push({ id: uid('dl'), name, url, at: nowISO(), by: actorId });
  t.history.push({ at: nowISO(), actorId, text: `Added deliverable “${name}”` });
}

export function deleteTask(d: DemoState, actorId: string, id: string) {
  const t = d.tasks.find(x => x.id === id);
  d.tasks = d.tasks.filter(x => x.id !== id);
  if (t) logActivity(d, actorId, `deleted task “${t.title}”`);
}
