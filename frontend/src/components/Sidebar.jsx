import React, { useRef, useEffect } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_TABS = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard', route: '/dashboard' },
  { key: 'home', icon: '🏠', label: 'Home', route: '/homepage' },
  { key: 'history', icon: '🕘', label: 'History', route: '/history' },
  { key: 'tweets', icon: '🐦', label: 'Tweets', route: '/tweets' },
  { key: 'liked-videos', icon: '💖', label: 'Liked Videos', route: '/liked-videos' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Close sidebar on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, setIsOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleTabClick = (tab) => {
    navigate(tab.route);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" />}
      <nav
        ref={sidebarRef}
        className={`sidebar${isOpen ? ' open' : ' collapsed'}`}
        aria-label="Sidebar navigation"
      >
        <button className="sidebar-toggle" onClick={handleToggle} aria-label="Toggle sidebar">
          <span className="sidebar-hamburger">☰</span>
        </button>
        <ul className="sidebar-tabs">
          {SIDEBAR_TABS.map((tab) => (
            <li
              key={tab.key}
              className={`sidebar-tab`}
              onClick={() => handleTabClick(tab)}
              tabIndex={0}
              title={!isOpen ? tab.label : undefined}
            >
              <span className="sidebar-icon">{tab.icon}</span>
              {isOpen && <span className="sidebar-label">{tab.label}</span>}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar; 