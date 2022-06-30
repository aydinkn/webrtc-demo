import './ice-candidate.css';

const IceCandidate = ({ isLocal, iceCandidates }) => {
    return (
        <div className="ice-candidate">
            <label>{isLocal ? 'Local' : 'Remote'} Ice Candidates</label>
            <textarea disabled value={iceCandidates.map(ice => ice.candidate).join('\n\n')}></textarea>
        </div>
    );
};

export default IceCandidate;
