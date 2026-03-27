import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const renderNavLinks = () => {
    if (isLoading) {
      return null;
    }

    if (!user) {
      return (
        <>
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
        </>
      );
    }

    switch (user.role) {
      case 'admin':
        return (
          <>
            <Button variant="ghost" asChild>
              <Link to="/admin/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/admin/users">Users</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/admin/doctors">Doctors</Link>
            </Button>
          </>
        );
      case 'doctor':
        return (
          <>
            <Button variant="ghost" asChild>
              <Link to="/doctor/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/doctor/patients">Patients</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/doctor/appointments">Appointments</Link>
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/mental-health">Mental Health</Link>
            </Button>
            <Button variant="ghost" asChild>
            <Link to="/food-info">Food Info</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/community-forum">Community Forum</Link>
            </Button>
          </>
        );
    }
  };

  React.useEffect(() => {
    document.documentElement.lang = 'en';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">MediBridge</span>
          </Link>
          {/* Hamburger for mobile */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="24" y2="12"/><line x1="4" y1="6" x2="24" y2="6"/><line x1="4" y1="18" x2="24" y2="18"/></svg>
            </Button>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center space-x-2" aria-label="Main navigation">
            {renderNavLinks()}
          </nav>
          <div className="hidden md:flex items-center space-x-2">
            <ModeToggle />
            {!isLoading && user && (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button variant="ghost" onClick={logout} aria-label="Logout">
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Mobile nav dropdown */}
        <div
          className={`fixed inset-0 z-40 transition-all duration-300 ${mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ background: mobileNavOpen ? 'rgba(20,20,20,0.7)' : 'transparent', backdropFilter: mobileNavOpen ? 'blur(4px)' : 'none' }}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={`fixed left-1/2 top-0 z-50 w-[92vw] max-w-sm -translate-x-1/2 mt-4 bg-background/95 border border-border shadow-2xl rounded-2xl transition-transform duration-300 ${mobileNavOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
          style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflowY: 'auto' }}
        >
          {/* Sticky header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background/95 sticky top-0 z-10">
            <span className="font-bold text-lg text-primary">Menu</span>
            <Button variant="ghost" size="icon" aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
          </div>
          {/* Nav links */}
          <nav className="flex flex-col gap-3 px-6 py-6 flex-1 overflow-y-auto" aria-label="Mobile navigation">
            {React.Children.map(renderNavLinks(), (child, idx) => (
              <div key={idx} className="">
                <div className="w-full">
                  {React.isValidElement(child) && typeof child.type !== 'string' && child.props ?
                    React.cloneElement(child as React.ReactElement<any>, {
                      className: `${((child.props && typeof child.props === 'object' && 'className' in (child.props as object) && (child.props as any).className) ? (child.props as any).className : '')} w-full py-3 px-4 text-base rounded-xl bg-muted hover:bg-primary hover:text-white transition-colors font-semibold shadow-sm text-left active:scale-95` ,
                    }) : child}
                </div>
              </div>
            ))}
          </nav>
          {/* User info and logout at bottom */}
          <div className="px-6 py-4 border-t border-border bg-background/95 flex items-center gap-3 rounded-b-2xl">
            <ModeToggle />
            {!isLoading && user && (
              <>
                <span className="text-base text-muted-foreground flex-1 truncate font-semibold">{user.name}</span>
                <Button variant="ghost" onClick={logout} aria-label="Logout" className="text-red-600 font-bold">Logout</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
} 