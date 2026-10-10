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

    { id: 'e-mod', name: 'Arko Sikder',term: '2026-2027',photo:'/public/Arko Sir1.jpeg',  designation: 'Moderator', bio: '🔹 Codeforces Expert with a max rating of 1621 🔹 3-time National BdMO Medalist 🔹 Multiple Top 10 Positions in IUPCs 🔹 Dean’s List Recipient', roleIds: ['r-mod'], phone: '+880 1700-000002', hue: 45, order: 1, showOnSite: true },
    { id: 'e-co-mod', name: 'Ahmmad Nur Swapnil',term:'2026-2027',photo:'/public/Sopnil Sir.jpg',  designation: 'Co-Moderator', bio: '🔹 ICPC Asia Regional Dhaka Participant 🔹Expert in Codeforces 🔹 Dean’s List 1st Runner-Up, 🔹Eco-Tech Hackathon 2026 ', roleIds: ['r-gs'], hue: 265, order: 2, showOnSite: true },
    { id: 'e-co-moda', name: 'Md. Owaliur Rahman',term:'2026-2027',photo:'/public/fihad sir1.jpg',  designation: 'Co-Moderator', bio: '🔹 Specialist (Max Rating: 1535) on Codeforces 🔹Honorable Mention, ICPC Asia Dhaka Regional Onsite Contest 2025 🔹 Rank 29, ICPC Asia Dhaka Regional Preliminary Contest 2025 ', roleIds: ['r-gs'], hue: 265, order: 2, showOnSite: true },
    { id: 'e-pres', name: 'Shakhaoath Hossain Pappu',term:'2026-2027',photo:'/public/Shakhaoath Hossain Paapu.jpeg',  designation: 'President', roleIds: ['r-pres'],department: 'CSE', batch: '231', hue: 265, order: 4, showOnSite: true },
    { id: 'e-vp', name: 'Mohima Akter',term:'2026-2027',photo:'/public/Mohima Akter.jpeg',  designation: 'Vice-President', roleIds: ['r-vp'],department: 'CSE', batch: '231', hue: 265, order: 4, showOnSite: true },
    { id: 'e-gs', name: 'Ifat Khalil Fahim',term:'2026-2027',photo:'/public/Ifat Khalil Fahim.jpeg',  designation: 'General Secretary', roleIds: ['r-gs'],department: 'CSE', batch: '242', hue: 265, order: 4, showOnSite: true },
    { id: 'e-tres', name: 'Alok Chandra Sutradhar',term:'2026-2027',photo:'/public/Alok Chandra Sutradhar.jpeg',  designation: 'Treasurer', roleIds: ['r-treas'],department: 'CSE', batch: '251', hue: 265, order: 4, showOnSite: true },
    { id: 'e-social', name: 'Rafiul Haque Rafi',term:'2026-2027',photo:'/public/Rafiul Haque Rafi.jpeg',  designation: 'TMedia & Communication Secretary', roleIds: ['r-media'],department: 'CSE', batch: '251', hue: 265, order: 4, showOnSite: true },
    { id: 'e-mangement', name: 'Md Rakibul Islam',term:'2026-2027',photo:'/public/Rakibul Hasan.jpeg',  designation: 'Management Secretary', roleIds: ['r-manage'],department: 'CSE', batch: '242', hue: 265, order: 4, showOnSite: true },
    { id: 'e-technical', name: 'Rahat Rahman Rumi',term:'2026-2027',photo:'/public/Rahat Rumi.jpeg',  designation: 'Technical Director', roleIds: ['r-tech'],department: 'CSE', batch: '253', hue: 265, order: 4, showOnSite: true },
    { id: 'e-organize', name: 'Tanvir Mahmud Mahi',term:'2026-2027',photo:'',  designation: 'Organizing Secretary', roleIds: ['r-organize'],department: 'CSE', batch: '251', hue: 265, order: 4, showOnSite: true },
    { id: 'public-real', name: 'Md Hasan Ali',term:'2026-2027',photo:'/public/Hasan.jpeg',  designation: 'Public Relations Secretary', roleIds: ['r-publicrel'],department: 'CSE', batch: '251', hue: 265, order: 4, showOnSite: true },
    { id: 'public-event', name: 'Md. Abidullah',term:'2026-2027',photo:'/public/Abid.jpg',  designation: 'Event Secretary', roleIds: ['r-event'],department: 'CSE', batch: '251', hue: 265, order: 4, showOnSite: true },


    { id: 'ager-presi', name: '404',term:'2024-2025',photo:'',  designation: '404', roleIds: ['r-nothing'], hue: 265, order: 4, showOnSite: true },






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
    { id: 'ev-code-sprint-1.0', 
      title: 'PUPC CodeSprint 1.0 - A Pathway To Competitive Programming', type: 'Workshop' as const, date: day(3), time: '10:00 AM', venue: 'Lab 115 (Ground Floor)', summary: 'The workshop will focus on essential programming concepts, problem-solving techniques, and commonly used tools required to begin a structured journey in Competitive Programming.', description: 'PUPC CodeSprint 1.0 is a six-day (13-15 and 17-19 October ) introductory workshop designed to help students build a strong foundation in Competitive Programming. The workshop will focus on essential programming concepts, problem-solving techniques, and commonly used tools required to begin a structured journey in Competitive Programming.', 
      schedule: [
        { time: '9:30 AM', item: 'Reporting time', day: 'Day 1 · 13 Oct' }, { time: '10:00 AM', item: 'Class start — C++ Basic 1', day: 'Day 1 · 13 Oct' }, { time: '11:30 AM', item: 'Snacks break',day: 'Day 1 · 13 Oct' }, { time: '2:00 PM', item: 'Q&A and conclusion',day: 'Day 1 · 13 Oct'},
        { time: '9:30 AM', item: 'Reporting time', day: 'Day 2 · 14 Oct' }, { time: '10:00 AM', item: 'Class start — C++ Basic 2', day: 'Day 2 · 14 Oct' }, { time: '11:30 AM', item: 'Snacks break',day: 'Day 2 · 14 Oct' }, { time: '2:00 PM', item: 'Q&A and conclusion',day: 'Day 2 · 14 Oct'},
        { time: '9:30 AM', item: 'Reporting time', day: 'Day 3 · 15 Oct' }, { time: '10:00 AM', item: 'Class start — Problem Solving Basics', day: 'Day 3 · 15 Oct' }, { time: '11:30 AM', item: 'Snacks break',day: 'Day 3 · 15 Oct' }, { time: '2:00 PM', item: 'Q&A and conclusion',day: 'Day 3 · 15 Oct'},
        { time: '9:30 AM', item: 'Reporting time', day: 'Day 4 · 17 Oct' }, { time: '10:00 AM', item: 'Class start — Greedy', day: 'Day 4 · 17 Oct' }, { time: '11:30 AM', item: 'Snacks break',day: 'Day 4 · 17 Oct' }, { time: '2:00 PM', item: 'Q&A and conclusion',day: 'Day 4 · 17 Oct'},
        { time: '9:30 AM', item: 'Reporting time', day: 'Day 5 · 18 Oct' }, { time: '10:00 AM', item: 'Class start — Math And Geometry', day: 'Day 5 · 18 Oct' }, { time: '11:30 AM', item: 'Snacks break',day: 'Day 5 · 18 Oct' }, { time: '2:00 PM', item: 'Q&A and conclusion',day: 'Day 5 · 18 Oct'},
        { time: '9:30 AM', item: 'Reporting time', day: 'Day 6 · 19 Oct' }, { time: '10:00 AM', item: 'Class start — STL', day: 'Day 6 · 19 Oct' }, { time: '11:30 AM', item: 'Snacks break',day: 'Day 6 · 19 Oct' }, { time: '2:00 PM', item: 'Q&A and conclusion',day: 'Day 6 · 19 Oct'}

      ], status: 'Published' as const, registrationUrl: 'https://forms.gle/LF4wRPN8rQhQHeB6A', image:'/public/codesprint cover.jpg', hue: 200, capacity: 30, registered: 10, featured: true },

    { id: 'ev-git', title: 'ICPC Preliminary Contest 2026', type: 'Contest' as const, date: day(5), time: 'TBA', venue: 'TBA', summary: 'Presidency University is organizing an internal registration process for students interested in participating in the ICPC 2026 Asia Dhaka Regional Contest Preliminary Contest.', description: 'Presidency University is organizing an internal registration process for students interested in participating in the ICPC 2026 Asia Dhaka Regional Contest Preliminary Contest.', schedule: [{ time: 'TBA', item: 'TBA' }], status: 'Published' as const, registrationUrl: 'https://forms.gle/zoSrjzGRFtv2AGrFA', image:'/public/icpc cover.jpg', hue: 260, capacity: 30, registered: 5, featured: true },
    { id: 'ev-web', title: '6 Day Web Development Workshop', type: 'Workshop' as const, date: day(-81), time: '10:00 AM', venue: 'Lab 115', summary: 'Full-stack web development fundamentals, from fronted and backedn to databases and deploying you first web application.', description: 'A 6-day intensive workshop covering the fundamentals of full-stack web development, from building interactive user interfaces to developing backend systems and managing databases . Gain hands-on experience by building and delopying a complete web application using modern web terchnologies.', schedule: [{ time: '9:30 -10:00 AM', item: 'Reporting Time And Opening' }, { time: '11:00 AM', item: 'Snacks' }, { time: '12:00 AM', item: 'QA and Closing'  }], status: 'Published' as const, registrationUrl: 'https://forms.gle/9unPY3U6CxF7BbZb7', image:'/public/web-workshop.jpg', hue: 280, capacity: 30, registered: 35, featured: true },
    { id: 'ev-ai', title: 'Bybeat Junior Programming Contest 2026 ', type: 'Contest' as const, date: day(-147), time: '10:00 - 12:30 PM', venue: '115 , 501 , 502 Lab', summary: 'A competitive programming contest to challenge your coding skills, logical thinking, and problem-solving abilities in the AI era.', description: 'Open to batches 251, 252, 253, 261, and 262, featuring a hands-on competitive programming experience with medals and certificates for the top 2 programmers from each batch.', schedule: [{ time: '9:30 AM', item: 'Reporting Time' }, { time: '10:00 AM', item: 'Contest Start' }], status: 'Published' as const, registrationUrl: '',image:'/public/byte-beat.jpg', hue: 300, capacity: 70, registered: 60, featured: true },
    { id: 'ev-summer', title: 'Intra University Programming Contest', type: 'Contest' as const, date: day(-315), time: '10:00 -12:00 PM', venue: '115 , 501 , 502 Lab', summary: 'An intra-university programming contest at PU CSE Fest 2025, designed to challenge coding skills, algorithmic thinking, and problem-solving abilities.', description: 'Compete with fellow students in coding challenges that test algorithmic thinking and problem-solving. Showcase your programming skills and gain competitive programming experience.', schedule: [{ time: '9:30 AM', item: 'Reporting Time' }, { time: '10:00 AM', item: 'Contest Start' }], status: 'Published' as const, registrationUrl: '', image:'/public/intra-uni.jpg', hue: 300, capacity: 70, registered: 60, featured: true },
  ];

  const gallery = [
    { id: 'g-1', title: 'Bangladesh Innovation Fair 2026', eventId: 'ev-fiesta', image:'/public/Innovation Fair.jpeg', hue: 170, at: day(-25) },
    { id: 'g-2', title: 'Bybeat Junior Programming Contest', eventId: 'ev-summer',image:'/public/beatbeat.jpg', hue: 330, at: day(-95) },
    { id: 'g-3', title: 'Icpc Dhaka Asia Regional Participation',image:'/public/icpc.jpg', eventId: 'ev-ai', hue: 300, at: day(-48) },
    { id: 'g-4', title: 'Web Development Workshop', eventId: 'ev-fiesta',image:'/public/web-development.jpg', hue: 200, at: day(-26) },
    { id: 'g-5', title: 'National Competiton',image:'/public/Project Showcase In Shanta Morium.jpg', hue: 240, at: day(-60) },
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
    version:2,
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
      email: 'pupc@pu.edu.bd',
      phone: '',
      address: 'Presidency University, Gulshan 2, Dhaka, Bangladesh',
      socials: [
        { label: 'Discord', url: 'https://discord.gg/sKRpJBPu2' },
        { label: 'Facebook Group', url: 'https://www.facebook.com/groups/1409815747599534' },
        { label: 'Facebook Page', url: 'https://www.facebook.com/profile.php?id=61555818638807' },
      ],
    },
    roles, executives, members, applications, tasks, events, gallery, transactions, budgets, reimbursements,
    meetings, notices, competitions, notifications, documents, activity, messages: [],
  };
}
