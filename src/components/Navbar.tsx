import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useWallet } from '@solana/wallet-adapter-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate('/');
    }

    // Save the connection status to localStorage whenever it changes
    localStorage.setItem('walletConnected', connected);
  }, [connected, navigate]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prevState => !prevState);
  }, []);

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img
              className="h-8 w-8 flex-shrink-0"
              src="/logo.png"
              alt="Logo"
            />
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavLink to="/home">Home</NavLink>
              <NavLink to="/explore">Explore</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/play">Play</NavLink>
              <WalletMultiButton/>
              <Link to="/avatar" className="hover:bg-purple-700 p-1 rounded-full">
                <img
                  className="h-8 w-8 border-2 border-white rounded-full"
                  src="/avatar.png"
                  alt="Avatar"
                />
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-800 focus:ring-white"
              aria-label={isOpen ? "Close main menu" : "Open main menu"}
            >
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <NavLink to="/play">Play</NavLink>
            <WalletMultiButton/>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
