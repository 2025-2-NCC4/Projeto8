import React, { useState, useEffect } from 'react';
// 1. Importamos 'useProfile' E as constantes 'PROFILES'
import { useProfile, PROFILES } from '../context/ProfileContext'; 
import api from '../services/api';
import './AlertsPanel.css'; 

// Ícones simples para severidade
const AlertIcon = ({ severity }) => {
  const emoji = {
    high: '🔥',
    medium: '⚠️',
    low: 'ℹ️',
  };
  return <span className={`alert-icon ${severity}`}>{emoji[severity] || '🔔'}</span>;
};

const AlertsPanel = ({ isOpen }) => {
  const [allAlerts, setAllAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pega o perfil atual (ex: PROFILES.CEO)
  const { currentProfile } = useProfile(); 

  // --- NOVA LÓGICA DE CORREÇÃO ---
  // Precisamos "traduzir" a constante do contexto (PROFILES.CEO) 
  // para a string que vem do backend ("CEO"), assim como seu Header faz.
  const profilesList = [
    { value: PROFILES.CEO, label: 'CEO' },
    { value: PROFILES.CFO, label: 'CFO' },
    { value: PROFILES.CTO, label: 'CTO' },
  ];

  // Encontra o 'label' (a string "CEO", "CFO", ou "CTO")
  const currentProfileLabel = profilesList.find(
    (p) => p.value === currentProfile
  )?.label;
  // --- FIM DA NOVA LÓGICA ---


  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/alerts'); // Chama o backend
        setAllAlerts(response.data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []); // Roda apenas uma vez quando o componente é montado

  // --- FILTRO CORRIGIDO ---
  // Agora comparamos a string do backend (alert.profile)
  // com a string que encontramos (currentProfileLabel)
  const filteredAlerts = allAlerts.filter(
    (alert) => alert.profile === currentProfileLabel || alert.profile === 'all'
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="alerts-panel-overlay">
      <div className="alerts-panel">
        {/* Usamos o label para o título */}
        <h3>Alertas Inteligentes ({currentProfileLabel})</h3>
        <div className="alerts-list">
          {isLoading ? (
            <p>Carregando alertas...</p>
          ) : filteredAlerts.length === 0 ? (
            <p>Nenhum alerta para o seu perfil.</p>
          ) : (
            // Agora o map usará a lista filtrada corretamente
            filteredAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <AlertIcon severity={alert.severity} />
                <div className="alert-content">
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;