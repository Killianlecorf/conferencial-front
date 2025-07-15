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
    const [filterTime, setFilterTime] = useState<string | null>(null);
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
                // Ajout de la propriété isJoined pour chaque conf selon l'user connecté
                const confsWithJoinStatus = res.data.map((conf: Conference) => {
                    const isJoined = user ? conf.conferentialUser.some(u => u.id === user.id) : false;
                    return { ...conf, isJoined };
                });
                setConferences(confsWithJoinStatus);
            } else {
                setConferences([]);
            }
            setLoading(false);
        }
        fetchConferencesByDay();
    }, [selectedDay, user]);

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
            setConferences(prev => [...prev, { ...newConf, isJoined: false }]);
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

    const handleJoin = async (conf: Conference) => {
        try {
            const response = await request(`conferences/${conf.id}/user`, 'PUT', {});
            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Erreur lors de l’inscription');
                return;
            }
            alert('Inscription réussie !');
            setConferences(prev =>
                prev.map(c =>
                    c.id === conf.id
                        ? {
                            ...c,
                            isJoined: true,
                            conferentialUser: user ? [...c.conferentialUser, user] : c.conferentialUser,
                        }
                        : c
                )
            );
        } catch (err) {
            console.error(err);
            alert('Une erreur est survenue');
        }
    };

    const handleLeave = async (conf: Conference) => {
        try {
            const response = await request(`conferences/${conf.id}/user`, 'DELETE', {});
            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Erreur lors du retrait');
                return;
            }
            alert('Retrait réussi !');

            setConferences(prev =>
                prev.map(c =>
                    c.id === conf.id
                        ? {
                            ...c,
                            isJoined: false,
                            conferentialUser: user
                                ? c.conferentialUser.filter(u => u.id !== user.id)
                                : c.conferentialUser,
                        }
                        : c
                )
            );
        } catch (err) {
            console.error(err);
            alert('Une erreur est survenue');
        }
    };

    const groupedConferences = conferences.reduce((acc, conf) => {
        const startTime = new Date(conf.startDateTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (!acc[startTime]) {
            acc[startTime] = [];
        }
        acc[startTime].push(conf);
        return acc;
    }, {} as Record<string, Conference[]>);

    const sortedTimeSlots = Object.keys(groupedConferences).sort((a, b) => {
        const dateA = new Date(`${selectedDay}T${a}`);
        const dateB = new Date(`${selectedDay}T${b}`);
        return dateA.getTime() - dateB.getTime();
    });

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

            {user && (
                <button className="add-conf-button" onClick={() => navigate('/profile')} style={{ marginLeft: 10 }}>
                    Mon Profil
                </button>
            )}

            <div className="time-filter" style={{ marginBottom: 20 }}>
                <span>Filtrer par heure : </span>
                <button
                    onClick={() => setFilterTime(null)}
                    style={{
                        marginRight: 8,
                        padding: '6px 12px',
                        backgroundColor: filterTime === null ? '#007bff' : '#eee',
                        color: filterTime === null ? 'white' : 'black',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                    }}
                >
                    Toutes
                </button>
                {sortedTimeSlots.map(time => (
                    <button
                        key={time}
                        onClick={() => setFilterTime(time)}
                        style={{
                            marginRight: 8,
                            padding: '6px 12px',
                            backgroundColor: filterTime === time ? '#007bff' : '#eee',
                            color: filterTime === time ? 'white' : 'black',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        {time}
                    </button>
                ))}
            </div>


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
                <div className="conference-list">
                    {conferences.length === 0 ? (
                        <p>Aucune conférence pour ce jour.</p>
                    ) : (
                        (filterTime ? [filterTime] : sortedTimeSlots).map(time => (
                            <div key={time} className="time-group">
                                <h3 className="time-header">{time}</h3>
                                <ul className="conference-items">
                                    {groupedConferences[time].map(conf => (
                                        <li key={conf.id}>
                                            <ConferenceItem
                                                conf={conf}
                                                isAdmin={!!user?.isAdmin}
                                                isSponsor={!!user?.isSponsor}
                                                onDelete={handleDeleteConference}
                                                onEdit={handleEditConference}
                                                onJoin={() => handleJoin(conf)}
                                                onLeave={() => handleLeave(conf)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
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
