import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import '../styles/themeToggle.css';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="theme-toggle-inner">
        <FaSun className="sun-icon" />
        <FaMoon className="moon-icon" />
      </div>
      <div className={`theme-toggle-slider ${isDark ? 'active' : ''}`}></div>
    </button>
  );
};

export default ThemeToggle;
