import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Satellite } from 'lucide-react';

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
            
            {/* --- INIZIO MENU A TENDINA ANALYST PRO (CSS ORIGINALE) --- */}
            <div className="group relative block w-32 cursor-pointer text-center">
              <span
                className="block bg-gradient-to-tr from-blue-500/80 via-blue-600 to-blue-500 text-gray-100 rounded-md px-4 py-2 z-20 drop-shadow-md hover:from-blue-600 hover:to-blue-500"
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
                    className="flex flex-col justify-start text-left w-full bg-gray-700 rounded-md p-3 drop-shadow"
                  >
                    <span className="text-sm font-normal text-gray-100 leading-3">Abbonamento annuale</span>
                    <div
                      className="inline-flex justify-between items-center opacity-0 translate-y-1 transition-all ease-in delay-300 duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <span className="text-2xl font-bold tracking-wide text-gray-100"
                        >US$150</span
                      >
                      <div className="inline-flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6 fill-green-400"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                        <span className="text-sm font-normal text-gray-100 leading-3">up to 50% save</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-500 mx-6 my-2"></div>
                    <div
                      className="inline-flex justify-between items-center text-sm font-normal leading-3 opacity-0 translate-y-1 transition-all ease-in delay-500 duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <span className="text-gray-400 mt-2">Analist PRO:</span>
                      <span className="text-gray-100 mt-2">15$ almese</span>
                    </div>
                    <div
                      className="inline-flex justify-between items-center text-sm font-normal leading-3 opacity-0 translate-y-1 transition-all ease-in delay-500 duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <span className="text-gray-400 mt-2">Analist base:</span>
                      <span className="text-gray-100 mt-2">29$/mese</span>
                    </div>
                  </div>
                  <div
                    className="h-0 w-fit border-x-[1em] border-t-[0.85em] border-transparent border-t-gray-800 -mt-[0.1em] -z-10"
                  ></div>
                </div>
              </div>
            </div>
            {/* --- FINE MENU A TENDINA --- */}

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