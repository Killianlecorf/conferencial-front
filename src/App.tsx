import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from './utils/request';

import AddConferenceModal from './components/AddConferenceModal/AddConferenceModal';
import EditConferenceModal from './components/EditConferenceModal/EditConferenceModal';
import ConferenceItem from './components/ConferentialItem/ConferentialItem';

import './App.scss';
import type { User } from './types/user.type';
import type { Conference } from './types/conference.type';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConf, setEditingConf] = useState<Conference | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('2025-07-15');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const days = [
    '2025-07-15',
    '2025-07-16',
    '2025-07-17',
  ];

  useEffect(() => {
    async function fetchUser() {
      const res = await request('users/current', 'GET');
      if (res.ok) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!selectedDay) return;

    async function fetchConferencesByDay() {
      setLoading(true);
      const res = await request(`conferences?day=${selectedDay}`, 'GET');
      if (res.ok) {
        setConferences(res.data);
      } else {
        setConferences([]);
      }
      setLoading(false);
    }
    fetchConferencesByDay();
  }, [selectedDay]);

  async function handleLogout() {
    try {
      const response = await request('logout', 'POST', {});
      if (response.ok) {
        setUser(null);
        navigate('/auth');
      } else {
        console.error('Erreur logout:', response.statusText);
      }
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  }

  function handleAddedConference(newConf: Conference) {
    if (newConf.startDateTime.startsWith(selectedDay)) {
      setConferences(prev => [...prev, newConf]);
    }
    setShowAddModal(false);
  }

  async function handleDeleteConference(id: number) {
    const confirmDelete = window.confirm('Supprimer cette conférence ?');
    if (!confirmDelete) return;

    try {
      const res = await request(`conferences/${id}`, 'DELETE', {});
      if (res.ok) {
        setConferences(prev => prev.filter(c => c.id !== id));
      } else {
        console.error('Erreur suppression:', res.statusText);
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  }

  function handleEditConference(conf: Conference) {
    setEditingConf(conf);
  }

  function handleEditModalClose() {
    setEditingConf(null);
  }

  async function handleUpdatedConference(updatedConf: Conference) {
    setConferences(prev => prev.map(c => (c.id === updatedConf.id ? updatedConf : c)));
    setEditingConf(null);
  }

  return (
    <div className="planning-container">
      <h1>Planning des conférences</h1>

      {user && (
        <div className="user-info">
          <span>Bonjour, {user.fullName}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      )}

      {user?.isAdmin && (
        <button className="add-conf-button" onClick={() => setShowAddModal(true)}>
          Ajouter une conférence
        </button>
      )}

      <div className="day-selector" style={{ marginBottom: 20 }}>
        <span>Sélectionner un jour : </span>
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              backgroundColor: selectedDay === day ? '#007bff' : '#eee',
              color: selectedDay === day ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {new Date(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </button>
        ))}
      </div>

      {loading && <p>Chargement des conférences...</p>}

      {!loading && (
        <ul className="conference-list">
          {conferences.length === 0 && <p>Aucune conférence pour ce jour.</p>}
          {conferences.map(conf => (
            <ConferenceItem
              key={conf.id}
              conf={conf}
              isAdmin={!!user?.isAdmin}
              onDelete={handleDeleteConference}
              onEdit={handleEditConference}
            />
          ))}
        </ul>
      )}

      {showAddModal && (
        <AddConferenceModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAddedConference}
        />
      )}

      {editingConf && (
        <EditConferenceModal
          conference={editingConf}
          onClose={handleEditModalClose}
          onUpdated={handleUpdatedConference}
        />
      )}
    </div>
  );
}

export default App;
