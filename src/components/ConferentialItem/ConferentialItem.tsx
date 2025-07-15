import type { Conference } from '../../types/conference.type';
import './ConferentialItem.scss';

type Props = {
  conf: Conference;
  isAdmin: boolean;
  onDelete: (id: number) => void;
  onEdit: (conf: Conference) => void;
};

export default function ConferenceItem({ conf, isAdmin, onDelete, onEdit }: Props) {
  return (
    <li className="conference-item">
      <div className="conf-info">
        <h3>{conf.title}</h3>
        <p>{conf.description}</p>
        <p>Orateur : <strong>{conf.speakerName}</strong></p>
        <p>
          Début : {new Date(conf.startDateTime).toLocaleString()}<br />
          Fin : {new Date(conf.endDateTime).toLocaleString()}
        </p>
        {conf.speakerBio && <p className="speaker-bio">Bio : {conf.speakerBio}</p>}
        <p>Slot n°: {conf.slotNumber}</p>
      </div>
      {isAdmin && (
        <div className="admin-buttons">
          <button className="edit-button" onClick={() => onEdit(conf)}>
            Modifier
          </button>
          <button className="delete-button" onClick={() => onDelete(conf.id)}>
            Supprimer
          </button>
        </div>
      )}
    </li>
  );
}
