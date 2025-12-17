import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../services/storageService';
import { Input } from '../components/Input';
import { Presentation, ArrowRight, ShieldCheck } from 'lucide-react';

export const Home: React.FC = () => {
  const [meetingName, setMeetingName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingName.trim()) return;

    setLoading(true);
    try {
      const meeting = await createMeeting(meetingName);
      // Navigate to admin dashboard to see the link (simulating auth flow usually)
      // or directly to the meeting page. Let's go to Admin flow for management.
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar reunião');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Presentation className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Presença</h1>
          <p className="text-gray-500 text-sm mt-2">Crie uma lista de presença online para sua reunião em segundos.</p>
        </div>

        <form onSubmit={handleCreate}>
          <Input
            label="Nome da Reunião"
            placeholder="Ex: Assembleia Geral Extraordinária"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            required
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Nova Reunião'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <button 
                onClick={() => navigate('/admin')}
                className="text-gray-400 hover:text-primary transition-colors flex items-center text-xs gap-1"
            >
                <ShieldCheck size={14} />
                <span>Área Administrativa</span>
            </button>
        </div>
      </div>
    </div>
  );
};
