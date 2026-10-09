// Central data model. Every entity here maps 1:1 to a future backend table / API resource.

export type Permission =
  | 'dashboard.view'
  | 'tasks.view'
  | 'tasks.create'
  | 'tasks.review'
  | 'members.manage'
  | 'events.manage'
  | 'roles.manage'
  | 'finance.view'
  | 'finance.approve'
  | 'secretariat.manage'
  | 'competitions.manage'
  | 'documents.manage'
  | 'executives.manage'
  | 'settings.manage';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  active: boolean;
  color: string; // hex accent for badges
}

export interface Executive {
  id: string;
  name: string;
  email: string;
  password?: string; // DEMO ONLY — never store passwords client-side in production
  designation: string;
  bio: string;
  roleIds: string[];
  department: string;
  batch: string;
  phone: string;
  hue: number;
  photo?: string;
  order: number;
  showOnSite: boolean;
}

export interface Member {
  id: string; // public member ID e.g. PUPC-2025-014
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
  interests: string[];
  status: 'Active' | 'Inactive';
  joinedAt: string;
}

export type AppStatus = 'Pending' | 'Approved' | 'Rejected';
export interface Application {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
  interests: string[];
  reason: string;
  submittedAt: string;
  status: AppStatus;
  memberId?: string;
  reviewedBy?: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskComment { id: string; authorId: string; text: string; at: string; kind: 'comment' | 'progress' | 'review' }
export interface Deliverable { id: string; name: string; url: string; at: string; by: string }
export interface HistoryItem { at: string; actorId: string; text: string }

export interface Task {
  id: string;
  title: string;
  description: string;
  roleId: string;
  assigneeIds: string[];
  priority: Priority;
  startDate: string;
  deadline: string;
  status: TaskStatus;
  progress: number;
  related: string; // free label: event or project name
  comments: TaskComment[];
  deliverables: Deliverable[];
  history: HistoryItem[];
  createdBy: string;
}

export type EventType = 'Workshop' | 'Contest' | 'Hackathon' | 'Seminar' | 'Social';
export type EventStatus = 'Draft' | 'Published' | 'Archived';
export interface ClubEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  venue: string;
  summary: string;
  description: string;
  schedule: { time: string; item: string }[];
  status: EventStatus;
  registrationUrl: string;
  hue: number;
  capacity: number;
  registered: number;
  featured: boolean;
}

export interface GalleryItem { id: string; title: string; eventId?: string; hue: number; image?: string; at: string }

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'Income' | 'Expense';
  amount: number;
  budgetId?: string;
  receipt?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  recordedBy: string;
}

export interface Budget { id: string; name: string; kind: 'Event' | 'Project'; allocated: number }

export interface Reimbursement {
  id: string;
  requesterId: string;
  description: string;
  amount: number;
  date: string;
  budgetId: string;
  receiptName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  note?: string;
}

export type Attendance = 'Present' | 'Absent' | 'Excused';
export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  type: 'Executive' | 'General' | 'Emergency';
  agenda: string[];
  minutes: string;
  attendance: Record<string, Attendance>;
  decisions: string[];
  status: 'Scheduled' | 'Completed';
}

export interface Notice { id: string; title: string; body: string; date: string; authorId: string; pinned: boolean; audience: 'Executives' | 'Members' | 'Public' }

export interface Competition {
  id: string;
  name: string;
  organizer: string;
  date: string;
  registrationDeadline: string;
  status: 'Planning' | 'Registered' | 'Preparing' | 'Completed';
  teams: { id: string; name: string; leader: string; members: string[] }[];
  practice: { id: string; day: string; time: string; topic: string }[];
  milestones: { id: string; title: string; due: string; done: boolean }[];
  resources: { id: string; title: string; url: string }[];
  result: string;
  report: string;
}

export type NotifType = 'task' | 'deadline' | 'meeting' | 'event' | 'review' | 'system';
export interface Notification { id: string; userId: string; title: string; body: string; at: string; read: boolean; readBy?: string[]; type: NotifType; link?: string }

export interface DocFile {
  id: string;
  name: string;
  folder: string;
  category: string;
  tags: string[];
  size: number;
  ext: string;
  uploadedBy: string;
  at: string;
  dataUrl?: string;
  content?: string; // sample text for preview
}

export interface Activity { id: string; at: string; actorId: string; text: string }
export interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; at: string }

export interface ClubInfo {
  name: string;
  short: string;
  year: string;
  heroTitle: string;
  slogan: string;
  intro: string;
  mission: string;
  vision: string;
  history: string;
  goals: string[];
  email: string;
  phone: string;
  address: string;
  socials: { label: string; url: string }[];
}

export interface DemoState {
  version: number;
  club: ClubInfo;
  roles: Role[];
  executives: Executive[];
  members: Member[];
  applications: Application[];
  tasks: Task[];
  events: ClubEvent[];
  gallery: GalleryItem[];
  transactions: Transaction[];
  budgets: Budget[];
  reimbursements: Reimbursement[];
  meetings: Meeting[];
  notices: Notice[];
  competitions: Competition[];
  notifications: Notification[];
  documents: DocFile[];
  activity: Activity[];
  messages: ContactMessage[];
}
