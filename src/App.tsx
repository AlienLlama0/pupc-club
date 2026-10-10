import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import DashboardLayout, { RequirePerm } from './components/DashboardLayout';
import Home from './pages/public/Home';
import { About, Contact, Executives, NotFound } from './pages/public/Pages';
import { Verify } from './pages/public/Verify';
import Join from './pages/public/Join';
import { EventDetail, Events } from './pages/public/Events';
import Login from './pages/public/Login';
import Overview from './pages/dashboard/Overview';
import { MyTasks, TaskBoard } from './pages/dashboard/Tasks';
import Members from './pages/dashboard/Members';
import ExecutivesAdmin from './pages/dashboard/ExecutivesAdmin';
import EventsAdmin from './pages/dashboard/EventsAdmin';
import Finance from './pages/dashboard/Finance';
import Secretariat from './pages/dashboard/Secretariat';
import Competitions from './pages/dashboard/Competitions';
import Roles from './pages/dashboard/Roles';
import { Documents, Notifications, SearchResults, Settings } from './pages/dashboard/Misc';

// HashRouter keeps the demo working on any static host (or a single HTML file) without server rewrites.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="join" element={<Join />} />
          <Route path="executives" element={<Executives />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="verify" element={<Verify />} />
          {/* <Route path="contact" element={<Contact />} /> */}
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="my-tasks" element={<RequirePerm p="tasks.view"><MyTasks /></RequirePerm>} />
          <Route path="tasks" element={<RequirePerm p="tasks.view"><TaskBoard /></RequirePerm>} />
          <Route path="members" element={<RequirePerm p="members.manage"><Members /></RequirePerm>} />
          <Route path="executives" element={<RequirePerm p="executives.manage"><ExecutivesAdmin /></RequirePerm>} />
          <Route path="events" element={<RequirePerm p="events.manage"><EventsAdmin /></RequirePerm>} />
          <Route path="finance" element={<RequirePerm p="finance.view"><Finance /></RequirePerm>} />
          <Route path="secretariat" element={<RequirePerm p="secretariat.manage"><Secretariat /></RequirePerm>} />
          <Route path="competitions" element={<RequirePerm p="competitions.manage"><Competitions /></RequirePerm>} />
          <Route path="roles" element={<RequirePerm p="roles.manage"><Roles /></RequirePerm>} />
          <Route path="settings" element={<RequirePerm p="settings.manage"><Settings /></RequirePerm>} />
          <Route path="documents" element={<Documents />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
