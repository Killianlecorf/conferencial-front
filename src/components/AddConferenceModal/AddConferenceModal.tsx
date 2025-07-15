import React, { useState } from 'react';
import request from '../../utils/request';
import type { Conference } from '../ConferenctialItem/ConferencialItem';

type AddConferenceModalProps = {
  onClose: () => void;
  onAdded: (newConf: Conference) => void;
};

export default function AddConferenceModal({ onClose, onAdded }: AddConferenceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerBio, setSpeakerBio] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [slotNumber, setSlotNumber] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !description || !speakerName || !startDateTime || !endDateTime) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setError('La date de début doit être avant la date de fin.');
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
        startDateTime,
        endDateTime,
        slotNumber,
      });

      if (res.ok) {
        onAdded(res.data);
      } else {
        setError(`Erreur ${res.status} : ${res.message}`);
      }
    } catch {
      setError('Erreur lors de l\'ajout de la conférence');
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
            Date et heure de début*:
            <input type="datetime-local" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} required />
          </label>

          <label>
            Date et heure de fin*:
            <input type="datetime-local" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} required />
          </label>

          <label>
            Numéro de slot:
            <input
              type="number"
              value={slotNumber}
              onChange={e => setSlotNumber(Number(e.target.value))}
              min={0}
            />
          </label>

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
