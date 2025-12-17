import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMeeting, addParticipant } from '../services/storageService';
import { Meeting } from '../types';
import { Input } from '../components/Input';
import { CheckCircle2, AlertCircle, Building2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AttendanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    entity: ''
  });

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;
      try {
        const data = await getMeeting(id);
        if (data) {
          setMeeting(data);
        } else {
          setError('Reunião não encontrada ou expirada.');
        }
      } catch (err) {
        setError('Erro ao carregar dados da reunião.');
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove non-digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // Capture max length
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !meeting) return;

    if (formData.cpf.length < 14) {
      alert("Por favor, preencha o CPF corretamente.");
      return;
    }

    setSubmitting(true);
    try {
      await addParticipant(id, formData);
      setSuccess(true);
    } catch (err) {
      alert('Erro ao registrar presença. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">{error || 'Erro desconhecido'}</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
          Voltar para Início
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-green-100 animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Presença Confirmada!</h2>
          <p className="text-gray-600 mb-6">
            Seus dados foram registrados com sucesso na reunião <br />
            <span className="font-semibold text-gray-800">{meeting.name}</span>.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-gray-500 hover:text-primary underline"
          >
            Registrar outro participante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-lg w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-primary px-6 py-4">
            <div className="flex items-center gap-2 text-blue-100 mb-1">
               <Building2 size={16} />
               <span className="text-xs uppercase tracking-wider font-semibold">Registro de Presença</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {meeting.name}
            </h1>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              name="fullName"
              placeholder="Digite seu nome completo"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            
            <Input
              label="CPF"
              name="cpf"
              placeholder="999.999.999-99"
              value={formData.cpf}
              onChange={handleChange}
              maxLength={14}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Entidade / Representação"
              name="entity"
              placeholder="Ex: Secretaria de Educação, Empresa X..."
              value={formData.entity}
              onChange={handleChange}
              required
            />

            <div className="pt-4">
                <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                >
                {submitting ? 'Registrando...' : 'Confirmar Presença'}
                </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => navigate('/admin')}
          className="text-gray-300 hover:text-gray-500 transition-colors p-2"
          aria-label="Acesso Administrativo"
        >
          <Lock size={20} />
        </button>
      </div>
    </div>
  );
};
