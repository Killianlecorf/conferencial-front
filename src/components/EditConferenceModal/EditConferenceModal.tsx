import React, { useState } from 'react';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import type { Conference } from '../../types/conference.type';

type EditConferenceModalProps = {
  conference: Conference;
  onClose: () => void;
  onUpdated: (updatedConf: Conference) => void;
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

export default function EditConferenceModal({ conference, onClose, onUpdated }: EditConferenceModalProps) {
  const [title, setTitle] = useState(conference.title);
  const [description, setDescription] = useState(conference.description);
  const [speakerName, setSpeakerName] = useState(conference.speakerName);
  const [speakerBio, setSpeakerBio] = useState(conference.speakerBio || '');
  const [date, setDate] = useState(conference.startDateTime.split('T')[0]);
  const [slotNumber, setSlotNumber] = useState(conference.slotNumber);
  const conferencer = {
        title,
        description,
        speakerName,
        speakerBio,
        date,
        slotNumber
    };
  

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await request(`conferences/${conference.id}`, 'PUT' , conferencer)
        
      
        window.location.reload();
      if (response.ok) {
        console.log('Conférence mise à jour avec succès');
        
      } else {
        console.log(`Erreur ${response.status} : ${response.message}`);
        
      }
    } catch {
      setError('Erreur réseau lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Modifier la conférence</h2>
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
              {loading ? 'Mise à jour en cours...' : 'Enregistrer'}
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
