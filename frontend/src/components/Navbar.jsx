import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Trophy, Shield, Radio, X, Menu } from 'lucide-react';

const PIN = 'ADMIN2025';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleHostClick = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        setPinInput('');
        setPinError('');
        setShowPinModal(true);
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput === PIN) {
            setShowPinModal(false);
            setPinInput('');
            setPinError('');
            navigate('/host');
        } else {
            setPinError('Incorrect PIN. Access denied.');
            setPinInput('');
        }
    };

    const handleModalClose = () => {
        setShowPinModal(false);
        setPinInput('');
        setPinError('');
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-cyber-black/80 backdrop-blur-md border-b border-gray-800">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <Zap size={20} className="text-cyber-neonGreen group-hover:animate-pulse" />
                    <span className="font-mono font-bold text-base sm:text-lg text-white tracking-widest group-hover:text-cyber-neonGreen transition-colors">
                        BUZZER<span className="text-cyber-neonGreen">.IO</span>
                    </span>
                </Link>

                {/* Desktop Nav Links (hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold tracking-wider transition-all ${
                            isActive('/')
                                ? 'bg-cyber-neonGreen/20 text-cyber-neonGreen border border-cyber-neonGreen/50'
                                : 'text-gray-400 hover:text-cyber-neonGreen hover:bg-cyber-neonGreen/10'
                        }`}
                    >
                        <Radio size={15} />
                        BUZZER
                    </Link>

                    <Link
                        to="/leaderboard"
                        className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold tracking-wider transition-all ${
                            isActive('/leaderboard')
                                ? 'bg-cyber-neonYellow/20 text-cyber-neonYellow border border-cyber-neonYellow/50'
                                : 'text-gray-400 hover:text-cyber-neonYellow hover:bg-cyber-neonYellow/10'
                        }`}
                    >
                        <Trophy size={15} />
                        LEADERBOARD
                    </Link>

                    <button
                        onClick={handleHostClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold tracking-wider transition-all ${
                            isActive('/host')
                                ? 'bg-cyber-neonBlue/20 text-cyber-neonBlue border border-cyber-neonBlue/50'
                                : 'text-gray-400 hover:text-cyber-neonBlue hover:bg-cyber-neonBlue/10'
                        }`}
                    >
                        <Shield size={15} />
                        HOST
                    </button>
                </div>

                {/* Mobile Hamburger (visible on small screens only) */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="sm:hidden text-gray-400 hover:text-white p-1 transition-colors"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Slide-down Menu */}
            {menuOpen && (
                <div className="fixed top-[53px] left-0 right-0 z-40 sm:hidden bg-cyber-black/95 backdrop-blur-md border-b border-gray-800 animate-slideDown">
                    <div className="flex flex-col p-3 gap-1">
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded font-mono text-sm font-bold tracking-wider transition-all ${
                                isActive('/')
                                    ? 'bg-cyber-neonGreen/20 text-cyber-neonGreen border border-cyber-neonGreen/50'
                                    : 'text-gray-400 active:text-cyber-neonGreen active:bg-cyber-neonGreen/10'
                            }`}
                        >
                            <Radio size={18} />
                            BUZZER
                        </Link>

                        <Link
                            to="/leaderboard"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded font-mono text-sm font-bold tracking-wider transition-all ${
                                isActive('/leaderboard')
                                    ? 'bg-cyber-neonYellow/20 text-cyber-neonYellow border border-cyber-neonYellow/50'
                                    : 'text-gray-400 active:text-cyber-neonYellow active:bg-cyber-neonYellow/10'
                            }`}
                        >
                            <Trophy size={18} />
                            LEADERBOARD
                        </Link>

                        <button
                            onClick={handleHostClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded font-mono text-sm font-bold tracking-wider transition-all text-left ${
                                isActive('/host')
                                    ? 'bg-cyber-neonBlue/20 text-cyber-neonBlue border border-cyber-neonBlue/50'
                                    : 'text-gray-400 active:text-cyber-neonBlue active:bg-cyber-neonBlue/10'
                            }`}
                        >
                            <Shield size={18} />
                            HOST
                        </button>
                    </div>
                </div>
            )}

            {/* PIN Modal Overlay */}
            {showPinModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-sm bg-cyber-dark p-6 sm:p-8 rounded-xl border border-cyber-neonBlue/40 shadow-[0_0_40px_rgba(0,204,255,0.2)]">
                        {/* Close button */}
                        <button
                            onClick={handleModalClose}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-center mb-4">
                            <Shield size={36} className="text-cyber-neonBlue sm:w-10 sm:h-10" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-mono font-bold text-cyber-neonBlue text-center mb-1">
                            HOST ACCESS
                        </h2>
                        <p className="text-gray-500 font-mono text-xs text-center mb-6 tracking-wider">
                            ADMIN PIN REQUIRED
                        </p>

                        <form onSubmit={handlePinSubmit}>
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                                className="w-full bg-cyber-black border border-gray-700 p-3 rounded text-white text-center text-xl sm:text-2xl tracking-[0.5em] focus:border-cyber-neonBlue focus:outline-none focus:shadow-[0_0_10px_#00ccff] transition-all mb-3"
                                placeholder="••••••••"
                                autoFocus
                            />
                            {pinError && (
                                <p className="text-cyber-neonRed font-mono text-xs text-center mb-3 animate-pulse">
                                    🚫 {pinError}
                                </p>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-cyber-neonBlue text-cyber-black font-bold py-3 rounded hover:bg-blue-400 active:scale-95 transition-all font-mono tracking-wider"
                            >
                                UNLOCK
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
