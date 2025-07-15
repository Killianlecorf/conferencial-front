import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import type { User } from '../../types/user.type';
import type { Conference } from '../../types/conference.type';

import './ScheduleViewer.scss';

function ScheduleViewer() {
    const [user, setUser] = useState<User | null>(null);
    const [joinedConferences, setJoinedConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const userRes = await request('users/current', 'GET');
                if (!userRes.ok) {
                    navigate('/auth');
                    return;
                }

                const currentUser: User = userRes.data;
                setUser(currentUser);

                const confRes = await request('users/conferences/join', 'GET');
                if (confRes.ok) {
                    const joined: Conference[] = confRes.data;
                    setJoinedConferences(joined);
                } else {
                    setJoinedConferences([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [navigate]);

    const handleBackToPlanning = () => {
        navigate('/');
    };

    return (
        <div className="profile-container">
            <h1>Profil utilisateur</h1>

            {user ? (
                <div className="profile-content">
                    <p><strong>Nom complet :</strong> {user.fullName}</p>
                    <p><strong>Email :</strong> {user.email}</p>
                    <p><strong>Rôle :</strong> {user.isAdmin ? 'Administrateur' : user.isSponsor ? 'Sponsor' : 'Utilisateur'}</p>

                    <h2>Mes conférences inscrites</h2>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : (
                        <>
                            {joinedConferences.length === 0 ? (
                                <p>Vous n'êtes inscrit à aucune conférence.</p>
                            ) : (
                                <ul>
                                    {joinedConferences.map(conf => (
                                        <li key={conf.id}>
                                            <strong>{conf.title}</strong> —{' '}
                                            {new Date(conf.startDateTime).toLocaleString('fr-FR', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <p>Chargement du profil...</p>
            )}

            <button onClick={handleBackToPlanning} className="return-button">
                Retour au planning
            </button>
        </div>
    );
}

export default ScheduleViewer;
