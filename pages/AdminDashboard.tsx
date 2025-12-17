import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMeetings, deleteMeeting } from '../services/storageService';
import { analyzeAttendance } from '../services/geminiService';
import { Meeting } from '../types';
import { 
  LogOut, 
  Users, 
  FileSpreadsheet, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // Auth Check
  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (!isAuth) navigate('/admin');
  }, [navigate]);

  // Load Data
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    const data = await getAllMeetings();
    setMeetings(data);
    if (data.length > 0 && !selectedMeeting) {
      setSelectedMeeting(data[0]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta reunião e todos os dados?')) {
      await deleteMeeting(id);
      setSelectedMeeting(null);
      loadMeetings();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedMeeting) return;
    setAnalyzing(true);
    setAiAnalysis('');
    const result = await analyzeAttendance(selectedMeeting.name, selectedMeeting.participants);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/#/meeting/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-primary h-6 w-6" />
            <span className="text-xl font-bold text-gray-900">Dashboard Administrativo</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar List */}
        <aside className="w-full md:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[80vh]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Reuniões Recentes</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {meetings.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">Nenhuma reunião criada.</p>
            ) : (
              meetings.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMeeting(m);
                    setAiAnalysis('');
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between group ${
                    selectedMeeting?.id === m.id 
                    ? 'bg-blue-50 text-primary border border-blue-100' 
                    : 'hover:bg-gray-50 text-gray-600 border border-transparent'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedMeeting?.id === m.id ? 'opacity-100' : ''}`} />
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-100 bg-gray-50">
             <button 
                onClick={() => navigate('/')}
                className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
             >
                + Nova Reunião
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[80vh] overflow-hidden">
          {selectedMeeting ? (
            <>
              {/* Meeting Header */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users size={14} /> {selectedMeeting.participants.length} Participantes</span>
                      <span className="hidden md:inline">|</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">ID: {selectedMeeting.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyLink(selectedMeeting.id)}
                      className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                      title="Copiar Link para Participantes"
                    >
                      <ExternalLink size={14} /> Link
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedMeeting.id)}
                      className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm"
                      title="Excluir Reunião"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Lista de Presença</h3>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing || selectedMeeting.participants.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <Sparkles size={14} />
                    {analyzing ? 'Analisando...' : 'Gerar Relatório IA'}
                </button>
              </div>

              {/* AI Analysis Panel */}
              {aiAnalysis && (
                <div className="mx-6 mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in text-sm text-gray-800 shadow-inner overflow-y-auto max-h-48">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold border-b border-indigo-200 pb-2">
                    <Sparkles size={16} />
                    <span>Análise Inteligente (Gemini)</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-auto flex-1 p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-0">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidade</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedMeeting.participants.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                Nenhum participante registrado ainda.
                            </td>
                        </tr>
                    ) : (
                        selectedMeeting.participants.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.entity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{p.cpf}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileSpreadsheet className="w-16 h-16 mb-4 opacity-20" />
                <p>Selecione uma reunião para visualizar os detalhes</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
