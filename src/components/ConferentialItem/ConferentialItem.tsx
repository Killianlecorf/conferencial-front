import type { Conference } from '../../types/conference.type';
import './ConferentialItem.scss';

type Props = {
    conf: Conference & { isJoined?: boolean };
    isAdmin: boolean;
    isSponsor: boolean;
    onDelete: (id: number) => void;
    onEdit: (conf: Conference) => void;
    onJoin: (conf: Conference) => void;
    onLeave: (conf: Conference) => void;
};

export default function ConferenceItem({ conf, isAdmin, onDelete, onEdit, onJoin, onLeave }: Props) {

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
                <p>{conf.conferentialUser.length} participant(s)</p>
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


            {!isAdmin && (
                <div className="join-button-container">
                    {conf.conferentialUser.length >= 10 ? (
                        <p className="conference-full">Salle pleine</p>
                    ) : conf.isJoined ? (
                        <button
                            className="leave-button"
                            onClick={() => onLeave(conf)}
                        >
                            Se retirer de la conférence
                        </button>
                    ) : (
                        <button
                            className="join-button"
                            onClick={() => onJoin(conf)}
                        >
                            Rejoindre la conférence
                        </button>
                    )}
                </div>
            )}


        </li>
    );
}
