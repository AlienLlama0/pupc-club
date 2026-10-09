import type { DemoState, Permission, Task, TaskStatus, Priority } from '../types';
import { ago, day } from '../lib/util';

// ---------------------------------------------------------------------------
// SAMPLE DATA ONLY. Names, IDs, figures and organisations are fictional demo
// content. Edit freely, or replace with API calls in a production version.
// ---------------------------------------------------------------------------

const ALL: Permission[] = [
  'dashboard.view', 'tasks.view', 'tasks.create', 'tasks.review', 'members.manage', 'executives.manage', 'events.manage',
  'finance.view', 'finance.approve', 'secretariat.manage', 'competitions.manage', 'documents.manage', 'roles.manage', 'settings.manage',
];

export function buildSeed(): DemoState {
  const roles = [
    { id: 'r-super', name: 'Super Admin', description: 'Full access to every module, role management and demo settings.', permissions: ALL, active: true, color: '#ff6b6b' },
    { id: 'r-pres', name: 'President / Club Administrator', description: 'Leads the club, oversees all workspaces and approves key decisions.', permissions: ALL.filter(p => !['roles.manage', 'settings.manage'].includes(p)), active: true, color: '#f4c95d' },
    { id: 'r-mod', name: 'Moderator / Task Coordinator', description: 'Creates, assigns and reviews tasks across the executive committee.', permissions: ['dashboard.view', 'tasks.view', 'tasks.create', 'tasks.review', 'documents.manage'] as Permission[], active: true, color: '#ff5a5f' },
    { id: 'r-gs', name: 'General Secretary (GS)', description: 'Runs meetings, minutes, notices, official letters and the archive.', permissions: ['dashboard.view', 'tasks.view', 'tasks.create', 'members.manage', 'secretariat.manage', 'documents.manage', 'executives.manage'] as Permission[], active: true, color: '#ff8a65' },
    { id: 'r-tre', name: 'Treasurer', description: 'Maintains the ledger, budgets and reimbursement approvals.', permissions: ['dashboard.view', 'tasks.view', 'finance.view', 'finance.approve', 'documents.manage'] as Permission[], active: true, color: '#4ade80' },
    { id: 'r-evt', name: 'Event Coordinator', description: 'Plans, publishes and documents workshops, contests and socials.', permissions: ['dashboard.view', 'tasks.view', 'events.manage', 'documents.manage'] as Permission[], active: true, color: '#fb923c' },
    { id: 'r-lead', name: 'Competition / Project Lead', description: 'Manages competition teams, practice plans and project milestones.', permissions: ['dashboard.view', 'tasks.view', 'tasks.create', 'competitions.manage', 'documents.manage'] as Permission[], active: true, color: '#f472b6' },
    { id: 'r-exec', name: 'Executive Member', description: 'Works on assigned tasks and contributes to club activities.', permissions: ['dashboard.view', 'tasks.view'] as Permission[], active: true, color: '#94a3b8' },
  ];

  const executives = [
    { id: 'e-admin', name: 'Rakib Hasan', email: 'admin@club.demo', password: 'Admin123!', designation: 'Technical Advisor & Platform Admin', bio: 'Final-year CSE student who maintains the club platform and mentors the web team. Loves clean architecture and strong coffee.', roleIds: ['r-super'], department: 'CSE', batch: '2022', phone: '+880 1700-000001', hue: 205, order: 9, showOnSite: true },
    { id: 'e-pres', name: 'Nusrat Jahan', email: 'president@club.demo', password: 'President123!', designation: 'President', bio: 'ICPC regionalist and two-time IUPC finalist. Focused on growing a welcoming, competitive coding culture on campus.', roleIds: ['r-pres'], department: 'CSE', batch: '2022', phone: '+880 1700-000002', hue: 45, order: 1, showOnSite: true },
    { id: 'e-mod', name: 'Tanvir Ahmed', email: 'moderator@club.demo', password: 'Moderator123!', designation: 'Moderator & Task Coordinator', bio: 'Keeps the committee shipping on time. Runs weekly stand-ups and the club task board.', roleIds: ['r-mod'], department: 'SWE', batch: '2023', phone: '+880 1700-000003', hue: 190, order: 4, showOnSite: true },
    { id: 'e-gs', name: 'Farhana Akter', email: 'gs@club.demo', password: 'GS123456!', designation: 'General Secretary', bio: 'Organised, calm and precise. Owns meeting minutes, official correspondence and the club archive.', roleIds: ['r-gs'], department: 'CSE', batch: '2023', phone: '+880 1700-000004', hue: 265, order: 2, showOnSite: true },
    { id: 'e-tre', name: 'Mahmudul Karim', email: 'treasurer@club.demo', password: 'Treasurer123!', designation: 'Treasurer', bio: 'Tracks every taka. Built the club’s first budget-vs-actual report and sponsorship tracker.', roleIds: ['r-tre'], department: 'EEE', batch: '2022', phone: '+880 1700-000005', hue: 140, order: 3, showOnSite: true },
    { id: 'e-evt', name: 'Sadia Rahman', email: 'events@club.demo', password: 'Events123!', designation: 'Event Coordinator', bio: 'Turns ideas into packed rooms — workshops, hackathons and the annual coding fiesta.', roleIds: ['r-evt'], department: 'CSE', batch: '2024', phone: '+880 1700-000006', hue: 25, order: 5, showOnSite: true },
    { id: 'e-lead', name: 'Arif Hossain', email: 'lead@club.demo', password: 'Lead123456!', designation: 'Competition & Project Lead', bio: 'Codeforces Expert. Coaches contest teams and leads the club’s open-source projects.', roleIds: ['r-lead'], department: 'CSE', batch: '2023', phone: '+880 1700-000007', hue: 320, order: 6, showOnSite: true },
    { id: 'e-exec', name: 'Imran Chowdhury', email: 'executive@club.demo', password: 'Executive123!', designation: 'Executive Member', bio: 'Frontend enthusiast helping with design, social media and workshop logistics.', roleIds: ['r-exec'], department: 'SWE', batch: '2024', phone: '+880 1700-000008', hue: 230, order: 7, showOnSite: true },
    { id: 'e-tasnim', name: 'Tasnim Islam', email: 'tasnim@club.demo', designation: 'Executive Member', bio: 'Assists the events team with registrations, venues and volunteers.', roleIds: ['r-exec', 'r-evt'], department: 'CSE', batch: '2024', phone: '+880 1700-000009', hue: 350, order: 8, showOnSite: true },
    { id: 'e-shafin', name: 'Shafin Alam', email: 'shafin@club.demo', designation: 'Executive Member', bio: 'Problem setter for intra-university contests. Writes editorials and test data.', roleIds: ['r-exec'], department: 'CSE', batch: '2024', phone: '+880 1700-000010', hue: 170, order: 10, showOnSite: true },
  ];

  const first = ['Ayesha', 'Fahim', 'Mehedi', 'Sumaiya', 'Rafi', 'Nadia', 'Sabbir', 'Jannat', 'Tahmid', 'Raisa', 'Zubair', 'Lamia', 'Nafis', 'Priya', 'Asif', 'Mim', 'Hasib', 'Tania', 'Rehan', 'Orin', 'Sakib', 'Faria', 'Yasin', 'Anika'];
  const last = ['Rahman', 'Islam', 'Hossain', 'Akter', 'Khan', 'Chowdhury', 'Sarker', 'Ahmed'];
  const depts = ['CSE', 'CSE', 'SWE', 'EEE', 'CSE', 'ICT'];
  const interestsPool = ['Competitive Programming', 'Web Development', 'Machine Learning', 'App Development', 'Cyber Security', 'Open Source', 'Game Dev'];
  const members = first.map((f, i) => {
    const year = 2023 + (i % 3);
    const seq = String(i + 1).padStart(3, '0');
    return {
      id: `PUPC-${year}-${seq}`,
      name: `${f} ${last[i % last.length]}`,
      studentId: `${year - 2000}${String(10 + (i % 4))}${String(1000 + i * 37).slice(-4)}`,
      email: `${f.toLowerCase()}.${i + 1}@student.demo`,
      phone: `+880 1800-${String(100000 + i * 731).slice(-6)}`,
      department: depts[i % depts.length],
      batch: String(year),
      interests: [interestsPool[i % interestsPool.length], interestsPool[(i + 2) % interestsPool.length]],
      status: (i % 7 === 6 ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
      joinedAt: `${year}-0${(i % 8) + 1}-1${i % 9}`,
    };
  });
  // Guaranteed test IDs shown on the verification page.
  members[13].id = 'PUPC-2025-014'; members[13].status = 'Active';
  members[6].id = 'PUPC-2023-007'; members[6].status = 'Inactive';

  const applications = [
    { id: 'a-1', name: 'Mahin Kabir', studentId: '26101234', email: 'mahin.kabir@student.demo', phone: '+880 1911-200301', department: 'CSE', batch: '2026', interests: ['Competitive Programming', 'Web Development'], reason: 'I solved 120 problems on Codeforces this summer and want a team to train with for IUPC.', submittedAt: ago(5), status: 'Pending' as const },
    { id: 'a-2', name: 'Riya Das', studentId: '26111877', email: 'riya.das@student.demo', phone: '+880 1911-200302', department: 'SWE', batch: '2026', interests: ['App Development', 'Open Source'], reason: 'I want to build real projects with other students and learn Flutter properly.', submittedAt: ago(20), status: 'Pending' as const },
    { id: 'a-3', name: 'Siam Hasan', studentId: '25121042', email: 'siam.h@student.demo', phone: '+880 1911-200303', department: 'EEE', batch: '2025', interests: ['Machine Learning'], reason: 'Interested in ML workshops and hackathons; I have a Python background from robotics.', submittedAt: ago(49), status: 'Pending' as const },
    { id: 'a-4', name: 'Nabila Sultana', studentId: '26101990', email: 'nabila.s@student.demo', phone: '+880 1911-200304', department: 'CSE', batch: '2026', interests: ['Cyber Security', 'Web Development'], reason: 'I want to join CTF practice sessions and help organise events.', submittedAt: ago(70), status: 'Pending' as const },
    { id: 'a-5', name: 'Faisal Mahmud', studentId: '25101555', email: 'faisal.m@student.demo', phone: '+880 1911-200305', department: 'CSE', batch: '2025', interests: ['Competitive Programming'], reason: 'Training for ICPC.', submittedAt: ago(240), status: 'Approved' as const, memberId: 'PUPC-2025-101', reviewedBy: 'e-gs' },
    { id: 'a-6', name: 'Test Spam', studentId: '00000000', email: 'spam@spam.demo', phone: '+880 1000-000000', department: 'Other', batch: '2020', interests: ['Game Dev'], reason: 'asdf', submittedAt: ago(300), status: 'Rejected' as const, reviewedBy: 'e-gs' },
  ];
  members.push({ id: 'PUPC-2025-101', name: 'Faisal Mahmud', studentId: '25101555', email: 'faisal.m@student.demo', phone: '+880 1911-200305', department: 'CSE', batch: '2025', interests: ['Competitive Programming'], status: 'Active', joinedAt: day(-10) });

  const events = [
    { id: 'ev-code-sprint-1.0', title: 'PUPC CodeSprint 1.0 - A pathway to competitive programming', type: 'Workshop' as const, date: day(3), time: '10:00 AM', venue: 'Lab 115 (Ground Floor)', summary: 'The workshop will focus on essential programming concepts, problem-solving techniques, and commonly used tools required to begin a structured journey in Competitive Programming.', description: 'PUPC CodeSprint 1.0 is a six-day introductory workshop designed to help students build a strong foundation in Competitive Programming. The workshop will focus on essential programming concepts, problem-solving techniques, and commonly used tools required to begin a structured journey in Competitive Programming.', schedule: [{ time: '9:30 AM', item: 'Reporting time' }, { time: '10:00 AM', item: 'Class starting time' }, { time: '11:30 AM', item: 'Snacks break' }, { time: '2:00 PM', item: 'Q&A and conclusion' }], status: 'Published' as const, registrationUrl: 'https://forms.gle/LF4wRPN8rQhQHeB6A', hue: 200, capacity: 30, registered: 10, featured: true },
    { id: 'ev-git', title: 'ICPC Preliminary Contest 2026', type: 'Contest' as const, date: day(5), time: 'TBA', venue: 'TBA', summary: 'Presidency University is organizing an internal registration process for students interested in participating in the ICPC 2026 Asia Dhaka Regional Contest Preliminary Contest.', description: 'Presidency University is organizing an internal registration process for students interested in participating in the ICPC 2026 Asia Dhaka Regional Contest Preliminary Contest.', schedule: [{ time: 'TBA', item: 'TBA' }], status: 'Published' as const, registrationUrl: 'https://forms.gle/zoSrjzGRFtv2AGrFA', hue: 260, capacity: 30, registered: 5, featured: true },
    { id: 'ev-iupc', title: 'Intra-University Programming Contest 2026', type: 'Contest' as const, date: day(-15), time: '9:00 AM', venue: 'Central Computer Lab', summary: 'The flagship 5-hour ICPC-style team contest. Teams of three, 10–12 problems.', description: 'Our flagship contest for all departments. ICPC rules, teams of three, one computer per team. Prizes for the top three teams and best freshers team. Problem set by club alumni and executive problem setters.', schedule: [{ time: '9:00 AM', item: 'Reporting & system check' }, { time: '10:00 AM', item: 'Contest starts' }, { time: '3:00 PM', item: 'Contest ends' }, { time: '4:00 PM', item: 'Prize giving & editorial' }], status: 'Published' as const, registrationUrl: 'https://forms.gle/9unPY3U6CxF7BbZb7', hue: 190, capacity: 150, registered: 112, featured: true },
    { id: 'ev-react', title: 'Modern Web with React', type: 'Workshop' as const, date: day(-22), time: '2:30 PM', venue: 'Lab 305', summary: 'Components, state and deploying your first React app in an afternoon.', description: 'Hands-on React workshop covering components, props, state, hooks and deployment.', schedule: [{ time: '2:30 PM', item: 'React mental model' }, { time: '3:30 PM', item: 'Build a mini app' }, { time: '5:00 PM', item: 'Deploy' }], status: 'Draft' as const, registrationUrl: 'https://forms.gle/9unPY3U6CxF7BbZb7', hue: 220, capacity: 60, registered: 0, featured: false },
    { id: 'ev-hack', title: 'Hack the Campus 2026', type: 'Hackathon' as const, date: day(-34), time: '9:00 AM', venue: 'Innovation Hub', summary: '24 hours, teams of four, real campus problems — build, pitch and win.', description: 'A 24-hour hackathon focused on solving real problems on campus: transport, canteen queues, library access and more. Mentors from industry, food all night, and prizes for the top teams.', schedule: [{ time: 'Day 1 · 9:00 AM', item: 'Opening & problem statements' }, { time: 'Day 1 · 10:00 AM', item: 'Hacking begins' }, { time: 'Day 2 · 10:00 AM', item: 'Submissions close' }, { time: 'Day 2 · 12:00 PM', item: 'Pitches & awards' }], status: 'Published' as const, registrationUrl: 'https://forms.gle/9unPY3U6CxF7BbZb7', hue: 280, capacity: 120, registered: 58, featured: true },
    { id: 'ev-fiesta', title: "Freshers' Coding Fiesta", type: 'Contest' as const, date: day(-25), time: '11:00 AM', venue: 'Central Computer Lab', summary: 'A friendly 3-hour individual contest for first-year students.', description: 'Over 140 freshers competed in our most popular beginner contest.', schedule: [{ time: '11:00 AM', item: 'Contest' }, { time: '2:30 PM', item: 'Awards' }], status: 'Published' as const, registrationUrl: '', hue: 170, capacity: 160, registered: 143, featured: false },
    { id: 'ev-ai', title: 'Tech Talk: Building with AI', type: 'Seminar' as const, date: day(-48), time: '4:00 PM', venue: 'Auditorium', summary: 'Alumni engineers on shipping AI features responsibly.', description: 'A panel of alumni engineers discussed practical AI product work.', schedule: [{ time: '4:00 PM', item: 'Panel' }, { time: '5:15 PM', item: 'Networking' }], status: 'Published' as const, registrationUrl: '', hue: 300, capacity: 250, registered: 231, featured: false },
    { id: 'ev-summer', title: 'Summer Hackathon 2026', type: 'Hackathon' as const, date: day(-95), time: '9:00 AM', venue: 'Innovation Hub', summary: '18 teams built tools for local NGOs.', description: 'Eighteen teams built tools for partner NGOs over 24 hours.', schedule: [{ time: '9:00 AM', item: 'Opening' }], status: 'Archived' as const, registrationUrl: '', hue: 330, capacity: 100, registered: 74, featured: false },
  ];

  const gallery = [
    { id: 'g-1', title: 'Fiesta winners on stage', eventId: 'ev-fiesta', hue: 170, at: day(-25) },
    { id: 'g-2', title: 'Late-night debugging', eventId: 'ev-summer', hue: 330, at: day(-95) },
    { id: 'g-3', title: 'Alumni panel Q&A', eventId: 'ev-ai', hue: 300, at: day(-48) },
    { id: 'g-4', title: 'Problem setters at work', eventId: 'ev-fiesta', hue: 200, at: day(-26) },
    { id: 'g-5', title: 'Team photo — ICPC prep camp', hue: 240, at: day(-60) },
    { id: 'g-6', title: 'Hackathon pitch round', eventId: 'ev-summer', hue: 20, at: day(-94) },
  ];

  const mkTask = (id: string, title: string, description: string, roleId: string, assigneeIds: string[], priority: Priority, startOff: number, dueOff: number, status: TaskStatus, progress: number, related: string, createdBy = 'e-mod'): Task => ({
    id, title, description, roleId, assigneeIds, priority, startDate: day(startOff), deadline: day(dueOff), status, progress, related,
    comments: [], deliverables: [], createdBy,
    history: [{ at: ago(24 * Math.max(1, -startOff)), actorId: createdBy, text: 'Created the task and assigned it' }],
  });

  const tasks: Task[] = [
    mkTask('t-1', 'Book Central Computer Lab for IUPC', 'Get written approval from the department for the lab, confirm 50 working PCs and power backup.', 'r-evt', ['e-evt'], 'High', -6, 2, 'In Progress', 60, 'Intra-University Programming Contest 2026'),
    mkTask('t-2', 'Prepare IUPC problem set (10 problems)', 'Write statements, test data and editorials. Get two independent testers per problem.', 'r-lead', ['e-lead', 'e-shafin'], 'Urgent', -14, 8, 'In Progress', 45, 'Intra-University Programming Contest 2026'),
    mkTask('t-3', 'Design IUPC poster & social banners', 'Poster (A3), Facebook cover, Instagram square and story — match the club brand.', 'r-exec', ['e-exec'], 'Medium', -5, -1, 'In Progress', 70, 'Intra-University Programming Contest 2026'),
    mkTask('t-4', 'Collect sponsorship for Hack the Campus', 'Reach out to at least 6 local tech companies with the sponsorship deck.', 'r-tre', ['e-tre'], 'High', -10, 12, 'To Do', 10, 'Hack the Campus 2026', 'e-pres'),
    mkTask('t-5', 'Publish minutes of last executive meeting', 'Clean up the draft minutes, list decisions and circulate to all executives.', 'r-gs', ['e-gs'], 'Medium', -4, -2, 'Under Review', 100, 'Executive Meeting'),
    mkTask('t-6', 'Git bootcamp slides & lab exercises', 'Slides plus 3 hands-on lab exercises with a sample repository.', 'r-exec', ['e-exec', 'e-tasnim'], 'Medium', -3, 4, 'To Do', 0, 'Git & GitHub Bootcamp'),
    mkTask('t-7', 'Weekly ICPC team practice set', 'Pick 8 problems from past regionals for this week’s mock contest.', 'r-lead', ['e-lead'], 'Medium', -2, 1, 'Completed', 100, 'ICPC Asia Dhaka Regional 2026'),
    mkTask('t-8', 'Volunteer roster for IUPC day', 'Recruit 12 volunteers and assign them to reporting, labs, food and judges desk.', 'r-evt', ['e-tasnim'], 'High', -1, 10, 'To Do', 0, 'Intra-University Programming Contest 2026'),
    mkTask('t-9', 'Reconcile September expenses', 'Match every September expense with a receipt and update the ledger.', 'r-tre', ['e-tre'], 'Low', -8, -3, 'Blocked', 40, 'Finance'),
    mkTask('t-10', 'Update club website event pages', 'Add Hack the Campus details and registration link to the website.', 'r-exec', ['e-exec'], 'Low', -2, 5, 'Under Review', 100, 'Website'),
    mkTask('t-11', 'Draft letter to Dean for hackathon venue', 'Official request letter for the Innovation Hub for 24 hours.', 'r-gs', ['e-gs'], 'High', -1, 3, 'To Do', 0, 'Hack the Campus 2026', 'e-pres'),
    mkTask('t-13', 'Review role permissions for the new semester', 'Check every role template, deactivate unused ones and create a Media & PR role if needed.', 'r-super', ['e-admin'], 'Medium', -2, 5, 'In Progress', 30, 'Club Administration', 'e-pres'),
    mkTask('t-14', 'Approve membership applications backlog', 'Review the four pending applications and issue member IDs.', 'r-pres', ['e-pres'], 'High', -1, 2, 'To Do', 0, 'Membership', 'e-mod'),
    mkTask('t-12', 'Order contest T-shirts', 'Get 3 quotes, pick one within budget, confirm sizes from registrations.', 'r-evt', ['e-evt'], 'Medium', -20, -12, 'Completed', 100, "Freshers' Coding Fiesta"),
  ];
  tasks[2].comments.push({ id: 'c-1', authorId: 'e-exec', text: 'First draft of the poster is ready, waiting on the final prize amounts.', at: ago(30), kind: 'progress' });
  tasks[4].deliverables.push({ id: 'd-1', name: 'Minutes — Executive Meeting (draft v2).pdf', url: '#', at: ago(10), by: 'e-gs' });
  tasks[4].history.push({ at: ago(10), actorId: 'e-gs', text: 'Submitted for review' });
  tasks[8].comments.push({ id: 'c-2', authorId: 'e-tre', text: 'Blocked: two receipts from the Fiesta snacks vendor are missing. Asked Sadia to follow up.', at: ago(50), kind: 'progress' });
  tasks[9].history.push({ at: ago(6), actorId: 'e-exec', text: 'Submitted for review' });
  tasks[9].deliverables.push({ id: 'd-2', name: 'Preview link', url: '#/events', at: ago(6), by: 'e-exec' });

  const budgets = [
    { id: 'b-iupc', name: 'IUPC 2026', kind: 'Event' as const, allocated: 60000 },
    { id: 'b-hack', name: 'Hack the Campus 2026', kind: 'Event' as const, allocated: 85000 },
    { id: 'b-fiesta', name: "Freshers' Coding Fiesta", kind: 'Event' as const, allocated: 25000 },
    { id: 'b-icpc', name: 'ICPC Regional Team', kind: 'Project' as const, allocated: 30000 },
    { id: 'b-web', name: 'Club Website & Tools', kind: 'Project' as const, allocated: 8000 },
  ];

  const tx = (id: string, off: number, description: string, category: string, type: 'Income' | 'Expense', amount: number, budgetId?: string, status: 'Approved' | 'Pending' | 'Rejected' = 'Approved', receipt?: string) =>
    ({ id, date: day(off), description, category, type, amount, budgetId, status, receipt, recordedBy: 'e-tre' });
  const transactions = [
    tx('tx-1', -140, 'Membership fees — spring intake', 'Membership', 'Income', 32000),
    tx('tx-2', -120, 'Department grant', 'Grant', 'Income', 50000),
    tx('tx-3', -96, 'Summer Hackathon catering', 'Food', 'Expense', 18500, 'b-hack', 'Approved', 'RCPT-0412.pdf'),
    tx('tx-4', -94, 'Hackathon prizes', 'Prizes', 'Expense', 20000, 'b-hack', 'Approved', 'RCPT-0413.pdf'),
    tx('tx-5', -90, 'Sponsor: DevCraft Ltd (sample)', 'Sponsorship', 'Income', 40000),
    tx('tx-6', -60, 'Domain & hosting renewal', 'Software', 'Expense', 3200, 'b-web', 'Approved', 'RCPT-0450.pdf'),
    tx('tx-7', -55, 'ICPC prep camp snacks', 'Food', 'Expense', 4200, 'b-icpc', 'Approved', 'RCPT-0458.pdf'),
    tx('tx-8', -48, 'Tech Talk honorarium & tokens', 'Speakers', 'Expense', 6000, undefined, 'Approved', 'RCPT-0461.pdf'),
    tx('tx-9', -40, 'Membership fees — fall intake', 'Membership', 'Income', 41500),
    tx('tx-10', -27, 'Fiesta T-shirts (160 pcs)', 'Merchandise', 'Expense', 14400, 'b-fiesta', 'Approved', 'RCPT-0477.pdf'),
    tx('tx-11', -25, 'Fiesta prizes & certificates', 'Prizes', 'Expense', 7500, 'b-fiesta', 'Approved', 'RCPT-0478.pdf'),
    tx('tx-12', -24, 'Fiesta snacks', 'Food', 'Expense', 5200, 'b-fiesta', 'Approved'),
    tx('tx-13', -18, 'Sponsor: ByteForge (sample) — IUPC', 'Sponsorship', 'Income', 30000),
    tx('tx-14', -12, 'ICPC registration fee (2 teams)', 'Registration', 'Expense', 12000, 'b-icpc', 'Approved', 'RCPT-0490.pdf'),
    tx('tx-15', -6, 'IUPC banner printing', 'Printing', 'Expense', 3800, 'b-iupc', 'Approved', 'RCPT-0496.pdf'),
    tx('tx-16', -2, 'IUPC judge kit & stationery', 'Supplies', 'Expense', 2600, 'b-iupc', 'Pending', 'RCPT-0501.pdf'),
    tx('tx-17', -1, 'Advance: hackathon venue deposit', 'Venue', 'Expense', 10000, 'b-hack', 'Pending'),
  ];

  const reimbursements = [
    { id: 'rb-1', requesterId: 'e-evt', description: 'Taxi fare for IUPC lab inspection', amount: 650, date: day(-3), budgetId: 'b-iupc', receiptName: 'uber-receipt.png', status: 'Pending' as const },
    { id: 'rb-2', requesterId: 'e-exec', description: 'Poster test prints', amount: 420, date: day(-2), budgetId: 'b-iupc', receiptName: 'print-shop.jpg', status: 'Pending' as const },
    { id: 'rb-3', requesterId: 'e-lead', description: 'Snacks for weekly practice', amount: 1100, date: day(-9), budgetId: 'b-icpc', receiptName: 'grocery.pdf', status: 'Approved' as const, note: 'Paid in cash' },
    { id: 'rb-4', requesterId: 'e-tasnim', description: 'Personal lunch', amount: 300, date: day(-15), budgetId: 'b-fiesta', receiptName: 'lunch.jpg', status: 'Rejected' as const, note: 'Not an approved club expense' },
  ];

  const execIds = executives.map(e => e.id);
  const att = (absent: string[] = [], excused: string[] = []) => Object.fromEntries(execIds.map(id => [id, absent.includes(id) ? 'Absent' : excused.includes(id) ? 'Excused' : 'Present'])) as Record<string, 'Present' | 'Absent' | 'Excused'>;
  const meetings = [
    { id: 'm-1', title: 'Executive Meeting #14', date: day(-9), time: '5:00 PM', venue: 'Club Room', type: 'Executive' as const, agenda: ['IUPC 2026 timeline', 'Hackathon sponsorship plan', 'Website refresh'], minutes: 'Meeting opened by the President at 5:05 PM. IUPC date confirmed; the Event Coordinator will secure the lab. The Treasurer presented the sponsorship pipeline (4 warm leads). Website refresh assigned to Imran with review by the Moderator.', attendance: att(['e-shafin'], ['e-tasnim']), decisions: ['IUPC 2026 confirmed for the 3rd week of the month', 'Sponsorship target set at ৳85,000', 'Registration fee for IUPC: ৳300 per team'], status: 'Completed' as const },
    { id: 'm-2', title: 'General Members Meeting', date: day(-30), time: '3:00 PM', venue: 'Auditorium', type: 'General' as const, agenda: ['Semester activity plan', 'Q&A with members'], minutes: 'Activity plan presented to 120+ members. Strong interest in ML and web workshops.', attendance: att(), decisions: ['Add a monthly ML study circle'], status: 'Completed' as const },
    { id: 'm-3', title: 'Executive Meeting #15', date: day(2), time: '5:00 PM', venue: 'Club Room', type: 'Executive' as const, agenda: ['IUPC readiness check', 'Volunteer roster', 'Budget review'], minutes: '', attendance: {}, decisions: [], status: 'Scheduled' as const },
    { id: 'm-4', title: 'Hackathon Planning Sync', date: day(9), time: '6:30 PM', venue: 'Online (Meet)', type: 'Executive' as const, agenda: ['Problem statements', 'Mentors', 'Food & logistics'], minutes: '', attendance: {}, decisions: [], status: 'Scheduled' as const },
  ];

  const notices = [
    { id: 'n-1', title: 'IUPC 2026 registration is open', body: 'Team registration closes 5 days before the contest. Share the poster in all department groups.', date: day(-1), authorId: 'e-gs', pinned: true, audience: 'Public' as const },
    { id: 'n-2', title: 'Executive meeting moved to Club Room', body: 'Executive Meeting #15 will be held in the Club Room instead of Lab 402.', date: day(-2), authorId: 'e-gs', pinned: false, audience: 'Executives' as const },
    { id: 'n-3', title: 'Submit reimbursement receipts by Friday', body: 'All pending receipts for September must reach the Treasurer by this Friday.', date: day(-4), authorId: 'e-tre', pinned: false, audience: 'Executives' as const },
    { id: 'n-4', title: 'Welcome, new members!', body: 'Orientation session for new members is scheduled after the Git bootcamp.', date: day(-8), authorId: 'e-pres', pinned: false, audience: 'Members' as const },
  ];

  const competitions = [
    { id: 'c-icpc', name: 'ICPC Asia Dhaka Regional 2026', organizer: 'ICPC Regional Committee (sample)', date: day(52), registrationDeadline: day(18), status: 'Preparing' as const,
      teams: [{ id: 'tm-1', name: 'PUPC_Recursion', leader: 'Arif Hossain', members: ['Arif Hossain', 'Shafin Alam', 'Fahim Islam'] }, { id: 'tm-2', name: 'PUPC_Overflow', leader: 'Nusrat Jahan', members: ['Nusrat Jahan', 'Sabbir Hossain', 'Raisa Ahmed'] }],
      practice: [{ id: 'p-1', day: 'Sunday', time: '6:00 PM', topic: 'Mock contest (5h)' }, { id: 'p-2', day: 'Tuesday', time: '7:00 PM', topic: 'Graphs & DP upsolve' }, { id: 'p-3', day: 'Thursday', time: '7:00 PM', topic: 'Math & geometry' }],
      milestones: [{ id: 'ms-1', title: 'Finalise team members', due: day(-20), done: true }, { id: 'ms-2', title: 'Complete 10 mock contests', due: day(25), done: false }, { id: 'ms-3', title: 'Online registration & payment', due: day(18), done: false }, { id: 'ms-4', title: 'Prepare 25-page team notebook', due: day(40), done: false }],
      resources: [{ id: 'rs-1', title: 'Team notebook template', url: 'https://github.com/' }, { id: 'rs-2', title: 'Past regional problem sets', url: 'https://codeforces.com/gyms' }],
      result: '', report: '' },
    { id: 'c-hack', name: 'National Student Hackathon 2026', organizer: 'Sample Innovation Council', date: day(70), registrationDeadline: day(30), status: 'Planning' as const,
      teams: [{ id: 'tm-3', name: 'Null Pointers', leader: 'Imran Chowdhury', members: ['Imran Chowdhury', 'Lamia Akter', 'Nafis Rahman', 'Anika Ahmed'] }],
      practice: [{ id: 'p-4', day: 'Saturday', time: '11:00 AM', topic: 'Idea validation & prototyping' }],
      milestones: [{ id: 'ms-5', title: 'Shortlist problem statement', due: day(12), done: false }, { id: 'ms-6', title: 'Clickable prototype', due: day(35), done: false }],
      resources: [{ id: 'rs-3', title: 'Pitch deck template', url: '#' }], result: '', report: '' },
    { id: 'c-iupc-spring', name: 'Inter-University Programming Contest (Spring)', organizer: 'Sample University CSE Society', date: day(-75), registrationDeadline: day(-90), status: 'Completed' as const,
      teams: [{ id: 'tm-4', name: 'PUPC_BinarySearch', leader: 'Nusrat Jahan', members: ['Nusrat Jahan', 'Arif Hossain', 'Shafin Alam'] }],
      practice: [], milestones: [{ id: 'ms-7', title: 'Registration', due: day(-90), done: true }, { id: 'ms-8', title: 'Contest', due: day(-75), done: true }],
      resources: [], result: '2nd place out of 64 teams — 8 problems solved', report: 'Strong on DP and graphs; lost time on a geometry problem. Action: add a weekly geometry session.' },
  ];

  const notifications = [
    { id: 'nt-1', userId: 'e-exec', title: 'Task deadline passed', body: '“Design IUPC poster & social banners” was due yesterday.', at: ago(3), read: false, type: 'deadline' as const, link: '/dashboard/tasks?task=t-3' },
    { id: 'nt-2', userId: 'e-mod', title: 'Review requested', body: 'Farhana submitted “Publish minutes of last executive meeting”.', at: ago(10), read: false, type: 'review' as const, link: '/dashboard/tasks?task=t-5' },
    { id: 'nt-3', userId: 'e-mod', title: 'Review requested', body: 'Imran submitted “Update club website event pages”.', at: ago(6), read: false, type: 'review' as const, link: '/dashboard/tasks?task=t-10' },
    { id: 'nt-4', userId: 'all', title: 'Executive Meeting #15', body: 'Scheduled in 2 days, 5:00 PM at the Club Room.', at: ago(20), read: false, type: 'meeting' as const, link: '/dashboard/secretariat' },
    { id: 'nt-5', userId: 'e-evt', title: 'New task assigned', body: 'Book Central Computer Lab for IUPC.', at: ago(140), read: true, type: 'task' as const, link: '/dashboard/tasks?task=t-1' },
    { id: 'nt-6', userId: 'e-tre', title: 'Reimbursement request', body: 'Sadia requested ৳650 for IUPC lab inspection.', at: ago(70), read: false, type: 'review' as const, link: '/dashboard/finance' },
    { id: 'nt-7', userId: 'all', title: 'IUPC 2026 in 15 days', body: 'Check your assigned tasks for the contest.', at: ago(26), read: false, type: 'event' as const, link: '/dashboard/events' },
    { id: 'nt-8', userId: 'e-gs', title: 'New membership applications', body: '4 applications are waiting for review.', at: ago(5), read: false, type: 'system' as const, link: '/dashboard/members' },
    { id: 'nt-9', userId: 'e-lead', title: 'ICPC registration deadline', body: 'Online registration closes in 18 days.', at: ago(30), read: false, type: 'deadline' as const, link: '/dashboard/competitions' },
  ];

  const doc = (id: string, name: string, folder: string, category: string, tags: string[], size: number, uploadedBy: string, off: number, content: string) =>
    ({ id, name, folder, category, tags, size, ext: name.split('.').pop()!.toLowerCase(), uploadedBy, at: day(off), content });
  const documents = [
    doc('doc-1', 'Club Constitution 2025.pdf', 'Official', 'Constitution', ['policy', 'official'], 482_000, 'e-gs', -200, 'Article 1 — Name. The club shall be known as the Presidency University Programming Club (sample).\nArticle 2 — Objectives. To promote programming, problem solving and collaborative software projects...'),
    doc('doc-2', 'Minutes — Executive Meeting #14.pdf', 'Meetings', 'Minutes', ['minutes', 'executive'], 128_000, 'e-gs', -8, 'Executive Meeting #14 — minutes (sample). Decisions: IUPC confirmed; sponsorship target ৳85,000; registration fee ৳300 per team.'),
    doc('doc-3', 'Notice — IUPC Registration.pdf', 'Notices', 'Notice', ['iupc', 'notice'], 96_000, 'e-gs', -1, 'NOTICE: Registration for IUPC 2026 is now open. Teams of three. Fee ৳300 per team.'),
    doc('doc-4', 'Letter — Lab booking request.docx', 'Letters', 'Official Letter', ['iupc', 'letter'], 44_000, 'e-gs', -5, 'To the Head of Department, CSE — Subject: Request for Central Computer Lab for IUPC 2026...'),
    doc('doc-5', 'Sponsorship Deck 2026.pdf', 'Finance', 'Sponsorship', ['sponsor', 'hackathon'], 2_400_000, 'e-tre', -30, 'Sponsorship packages: Title ৳40,000 · Gold ৳25,000 · Silver ৳10,000 (sample).'),
    doc('doc-6', 'Monthly Report — September.xlsx', 'Finance', 'Report', ['finance', 'monthly'], 61_000, 'e-tre', -9, 'September summary (sample): income ৳30,000; expenses ৳27,100.'),
    doc('doc-7', 'IUPC 2026 Event Plan.docx', 'Events', 'Event Documentation', ['iupc', 'plan'], 88_000, 'e-evt', -12, 'Run-of-show, room allocation, volunteer roles and contingency plan for IUPC 2026.'),
    doc('doc-8', 'ICPC 2026 Preparation Plan.pdf', 'Competitions', 'Competition Plan', ['icpc', 'training'], 152_000, 'e-lead', -21, 'Eight-week training plan: mock contests every Sunday; topic rotation; notebook deadline.'),
    doc('doc-9', 'Fiesta Post-Event Report.pdf', 'Events', 'Report', ['fiesta', 'report'], 310_000, 'e-evt', -20, '143 participants; 92% satisfaction in the survey; budget used 107% (overspent on snacks).'),
    doc('doc-10', 'Brand Guidelines.png', 'Design', 'Design', ['brand', 'logo'], 740_000, 'e-exec', -50, ''),
  ];

  const activity = [
    { id: 'ac-1', at: ago(2), actorId: 'e-tre', text: 'recorded expense “Advance: hackathon venue deposit” (৳10,000)' },
    { id: 'ac-2', at: ago(5), actorId: 'e-gs', text: 'received a new membership application from Mahin Kabir' },
    { id: 'ac-3', at: ago(6), actorId: 'e-exec', text: 'submitted “Update club website event pages” for review' },
    { id: 'ac-4', at: ago(10), actorId: 'e-gs', text: 'submitted “Publish minutes of last executive meeting” for review' },
    { id: 'ac-5', at: ago(26), actorId: 'e-lead', text: 'completed “Weekly ICPC team practice set”' },
    { id: 'ac-6', at: ago(30), actorId: 'e-evt', text: 'published “Hack the Campus 2026”' },
  ];

  return {
    version: 1,
    club: {
      name: 'Presidency University Programming Club',
      short: 'PUPC',
      year: '2026',
      heroTitle: 'Presidency University Programming Club',
      slogan: 'Coding Community at Presidency University',
      intro: 'We are a student-run community of programmers, problem solvers and builders. From your first “Hello, World” to ICPC regionals, we learn, compete and ship together.',
      mission: 'To make programming accessible to every student and to build a culture of problem solving, collaboration and real-world software craftsmanship.',
      vision: 'A campus where every student can turn ideas into working software and compete confidently at national and international level.',
      history: 'Founded in 2016 by eight CSE students who met at a late-night contest, the club has grown to over 400 members. Our teams have reached the ICPC Dhaka Regional every year since 2019, and our annual hackathon now draws participants from across the country.',
      goals: ['Run weekly practice sessions for competitive programmers', 'Host at least 8 workshops every semester', 'Send 3+ teams to ICPC regionals', 'Ship one open-source project per year', 'Mentor first-year students into confident developers'],
      email: 'pupc@club.demo',
      phone: '+880 1700-000000',
      address: 'Presidency University, Dhaka, Bangladesh',
      socials: [
        { label: 'Facebook', url: 'https://facebook.com/' },
        { label: 'GitHub', url: 'https://github.com/' },
        { label: 'LinkedIn', url: 'https://linkedin.com/' },
        { label: 'YouTube', url: 'https://youtube.com/' },
      ],
    },
    roles, executives, members, applications, tasks, events, gallery, transactions, budgets, reimbursements,
    meetings, notices, competitions, notifications, documents, activity, messages: [],
  };
}
