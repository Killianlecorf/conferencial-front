import { useEffect, useState } from 'react';
import request from './utils/request';
import './App.scss';
import { useNavigate } from 'react-router-dom';

export type User = {
    id: number;
    fullName: string;
    email: string;
    isSponsor: boolean;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

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


    async function handleLogout() {
    try {
        const response = await request('logout', 'POST', {});
        if (response.ok) {
            setUser(null);
            navigate('/auth');
        } else {
            const errorData = await response.json();
            console.error('Erreur logout:', errorData.message || response.statusText);
        }
    } catch (error) {
        console.error('Erreur logout:', error);
    }
}


    return (
        <div className="planning-container">
            <h1>Planning des conférences</h1>

            {user && (
                <div style={{ marginBottom: 16 }}>
                    <span>Bonjour, {user.fullName}</span>
                    <button onClick={handleLogout} style={{ marginLeft: 8 }}>
                        Déconnexion
                    </button>
                </div>
            )}

        </div>
    );
}

export default App;
