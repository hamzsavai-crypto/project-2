import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/concepts', label: 'Concepts' },
  { to: '/simulations', label: 'Simulations' },
  { to: '/experiments', label: 'Experiments' },
  { to: '/laboratory/history', label: 'My Laboratory' },
];

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-lab-line/25 bg-lab-void/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-lab-accent/15 text-[13px] font-bold text-lab-accent ring-1 ring-lab-accent/40 transition group-hover:bg-lab-accent/25">
              V
            </span>
            <span className="leading-none">
              <span className="block text-[13px] font-semibold tracking-[0.02em] text-lab-ink">Virtual Physics Laboratory</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-lab-mute">experiment · measure · conclude</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                    isActive ? 'bg-lab-raise text-lab-ink' : 'text-lab-mute hover:text-lab-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/experiments/simple-pendulum"
            className="ml-auto rounded-lg bg-lab-accent px-3 py-1.5 text-[13px] font-medium text-lab-void transition hover:bg-lab-accent/90 md:ml-2"
          >
            Open a lab
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-lab-line/20 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('whitespace-nowrap rounded-lg px-2.5 py-1 text-[12px]', isActive ? 'bg-lab-raise text-lab-ink' : 'text-lab-mute')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-lab-line/25 bg-lab-void/60">
        <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 py-6 text-[12px] text-lab-mute sm:grid-cols-3 sm:px-6">
          <p>
            <span className="font-medium text-lab-ink">Virtual Physics Laboratory.</span> Experiments, readings, calculations and graphs in the browser -
            no installs, no account required for the bench.
          </p>
          <p>
            Physics logic adapted from{' '}
            <a href="https://github.com/IlliniOpenEdu/PhysicsSims" className="text-lab-accent hover:underline" rel="noreferrer" target="_blank">
              IlliniOpenEdu/PhysicsSims
            </a>{' '}
            (MIT), pinned in <code className="font-mono">source/physics-sims</code>. See{' '}
            <Link to="/about" className="text-lab-accent hover:underline">
              attribution
            </Link>
            .
          </p>
          <p className="sm:text-right">
            Saved work stays in this browser until accounts arrive.{' '}
            <Link to="/laboratory/history" className="text-lab-accent hover:underline">
              View history
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
