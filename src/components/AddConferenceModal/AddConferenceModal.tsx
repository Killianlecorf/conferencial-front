import React, { useState } from 'react';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import type { Conference } from '../../types/conference.type';

type AddConferenceModalProps = {
    onClose: () => void;
    onAdded: (newConf: Conference) => void;
};

function getWeekDates() {
    const today = new Date();
    const day = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));

    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);

    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);

    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);

    const format = (d: Date) => d.toISOString().split('T')[0];

    return [
        { label: 'Mardi', value: format(tuesday) },
        { label: 'Mercredi', value: format(wednesday) },
        { label: 'Jeudi', value: format(thursday) },
    ];
}

export default function AddConferenceModal({ onClose, onAdded }: AddConferenceModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [speakerName, setSpeakerName] = useState('');
    const [speakerBio, setSpeakerBio] = useState('');
    const [date, setDate] = useState('');
    const [slotNumber, setSlotNumber] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const weekDates = getWeekDates();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!title || !description || !speakerName || !date || slotNumber < 1) {
            setError('Merci de remplir tous les champs obligatoires.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await request('conferences', 'POST', {
                title,
                description,
                speakerName,
                speakerBio,
                date,
                slotNumber,
            });

            console.log('Response from server:', res.message);        

            if (res.ok) {
                onAdded(res.data);
                navigate('/');
            } else {
            setError(`${res.data?.error || res.message || 'Erreur inconnue'}`);
            }
        } catch {
            setError("Erreur lors de l'ajout de la conférence");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Ajouter une conférence</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Titre*:
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    </label>

                    <label>
                        Description*:
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required />
                    </label>

                    <label>
                        Nom de l'orateur*:
                        <input type="text" value={speakerName} onChange={e => setSpeakerName(e.target.value)} required />
                    </label>

                    <label>
                        Bio de l'orateur:
                        <textarea value={speakerBio} onChange={e => setSpeakerBio(e.target.value)} />
                    </label>

                    <label>
                        Date (seulement mardi à jeudi)*:
                        <select value={date} onChange={e => setDate(e.target.value)} required>
                            <option value="">-- Choisissez un jour --</option>
                            {weekDates.map(d => (
                                <option key={d.value} value={d.value}>{d.label} ({d.value})</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Numéro de slot*:
                        <input
                            type="number"
                            value={slotNumber}
                            onChange={e => setSlotNumber(Number(e.target.value))}
                            min={1}
                            max={10}
                            required
                        />
                    </label>

                    <p style={{ fontStyle: 'italic' }}>
                        Le créneau horaire sera automatiquement défini selon le slot choisi (durée : 45 min).
                    </p>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <div className="modal-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Ajout en cours...' : 'Ajouter'}
                        </button>
                        <button type="button" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
