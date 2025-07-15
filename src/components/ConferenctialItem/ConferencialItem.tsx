import React, { useState } from 'react';
import request from '../../utils/request';

export type Conference = {
  id: number;
  title: string;
  description: string;
  speakerName: string;
  speakerBio: string;
  date: string;
  conferentialSize: number;
  slotNumber: number;
  startDateTime: string;
  endDateTime: string;
};

type ConferenceItemProps = {
  conference: Conference;
  onDelete?: (id: number) => void;
};

export default function ConferenceItem({ conference, onDelete }: ConferenceItemProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Voulez-vous vraiment supprimer la conférence "${conference.title}" ?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await request(`conferences/${conference.id}`, 'DELETE');
      if (res.ok || res.status === 204) {

        if (!onDelete) {
          return;
        }
        onDelete(conference.id);
      } else {
        setError(`Erreur ${res.status} : ${res.message}`);
      }
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="conference-item">
      <h2>{conference.title}</h2>
      <p><strong>Orateur :</strong> {conference.speakerName}</p>
      <p><strong>Date :</strong> {new Date(conference.startDateTime).toLocaleDateString()}</p>
      <p>
        <strong>Heure :</strong> {new Date(conference.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(conference.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </p>
      <p>{conference.description}</p>
      <p><em>{conference.speakerBio}</em></p>
      <button onClick={handleDelete} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Suppression...' : 'Supprimer'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <hr />
    </li>
  );
}
