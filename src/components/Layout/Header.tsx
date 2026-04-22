import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User, Satellite } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50 shadow-lg">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
          <Satellite className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
          Satellite<span className="text-cyan-400">Pro</span>
        </h1>
      </Link>

      {/* Navigazione o Profilo */}
      <nav className="flex items-center gap-6">
        {!user ? (
          <>
            <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
              Accedi
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-full font-semibold shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
            >
              Registrati
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">
              Dashboard
            </Link>
            
            {/* Dropdown Abbonamento Analyst Pro */}
            <div className="group relative block w-32 cursor-pointer text-center">
              <span
                className="block bg-gradient-to-tr from-blue-500/80 via-blue-600 to-blue-500 text-gray-100 rounded-md px-4 py-2 z-20 drop-shadow-md hover:from-blue-600 hover:to-blue-500 transition-colors duration-300 font-semibold text-sm shadow-lg shadow-blue-500/20"
              >
                Analyst Pro
              </span>
              <div
                className="absolute pointer-events-none block w-[150%] -top-28 left-1/2 -translate-x-1/2 z-50"
              >
                <div
                  className="flex flex-col items-center opacity-0 transition-all ease-in duration-300 translate-y-1/2 group-hover:opacity-100 group-hover:-translate-y-1/4"
                >
                  <div
                    className="flex flex-col justify-start text-left w-full bg-slate-800 border border-slate-700 rounded-md p-3 drop-shadow-xl backdrop-blur-sm shadow-2xl"
                  >
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Abbonamento annuale</span>
                    
                    <div
                      className="inline-flex justify-between items-center opacity-0 translate-y-1 transition-all ease-in delay-100 duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <span className="text-2xl font-bold tracking-wide text-white">$150</span>
                      <div className="inline-flex items-center bg-green-900/30 px-2 py-1 rounded-full ml-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 fill-green-400 mr-1"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-bold text-green-400">SAVE 50%</span>
                      </div>
                    </div>
                    
                    <div className="border-b border-slate-600 mx-4 my-2"></div>
                    
                    <div
                      className="inline-flex justify-between items-center text-xs font-normal leading-tight opacity-0 translate-y-1 transition-all ease-in delay-200 duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <span className="text-slate-400">Analyst PRO:</span>
                      <span className="text-slate-200 font-medium">$15/mese</span>
                    </div>
                    
                    <div
                      className="inline-flex justify-between items-center text-xs font-normal leading-tight opacity-0 translate-y-1 transition-all ease-in delay-300 duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <span className="text-slate-400">Analyst Base:</span>
                      <span className="text-slate-200 font-medium">$29/mese</span>
                    </div>
                  </div>
                  
                  {/* Freccia triangolare in basso */}
                  <div
                    className="h-0 w-fit border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-800 -mt-2 filter drop-shadow-lg"
                  ></div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors"
              title="Esci"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
