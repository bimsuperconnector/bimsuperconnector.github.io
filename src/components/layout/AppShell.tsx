import { Link, NavLink, Outlet } from 'react-router-dom';
import { Container } from '../ui/Container';
import { useAuth } from '../../context/AuthContext';
import { useUserRecord } from '../../context/UserRecordContext';

const navItems = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/profile', label: 'Profile' },
  { to: '/app/directory', label: 'Directory' },
  { to: '/app/superconnector', label: 'SuperConnector' },
  { to: '/app/jobs', label: 'Jobs' },
  { to: '/app/open-to-work', label: 'Open to Work' },
  { to: '/app/events', label: 'Events' },
  { to: '/app/entrepreneurship', label: 'Entrepreneurship' },
  { to: '/app/notifications', label: 'Notifications' },
];

export function AppShell() {
  const { user, signOutUser } = useAuth();
  const { record } = useUserRecord();

  const items = record?.isAdmin
    ? [...navItems, { to: '/app/admin', label: 'Admin', end: false }]
    : navItems;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="h-16 border-b border-hairline">
        <Container className="flex h-16 items-center justify-between">
          <Link to="/app" className="text-title-sm font-haas-disp text-ink">
            SuperConnector
          </Link>
          <div className="flex items-center gap-sm text-body-md text-body">
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
            )}
            <span>{user?.displayName ?? user?.email}</span>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="text-link hover:text-link-active"
            >
              Sign out
            </button>
          </div>
        </Container>
      </header>

      <div className="flex flex-1">
        <nav className="hidden w-[220px] shrink-0 border-r border-hairline p-lg md:block">
          <ul className="space-y-xs">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-sm px-sm py-xs text-body-md ${
                      isActive ? 'bg-surface-soft text-ink' : 'text-body hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-lg md:p-xxl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
