import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ArrowLeft } from 'lucide-react';
import { Input } from '../components/Input';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '216635') {
      // Simple auth via localStorage to persist session briefly
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/')} 
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-700 p-3 rounded-full">
              <LockKeyhole className="text-primary w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-6">Acesso Restrito</h2>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
                <Input
                    label="Senha de Acesso"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                    }}
                    placeholder="••••••"
                    className="text-gray-100"
                    autoFocus
                />
                {error && <p className="text-red-400 text-sm mt-2 text-center">Senha incorreta.</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
