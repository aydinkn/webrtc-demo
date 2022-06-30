import './session-description.css';

const SessionDescription = ({ isLocal, sdp }) => {
    return (
        <div className="session-description">
            <label>{isLocal ? 'Local' : 'Remote'} Session Description</label>
            <textarea disabled value={sdp}></textarea>
        </div>
    );
};

export default SessionDescription;
