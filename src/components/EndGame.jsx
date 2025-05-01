import React from 'react';
import Modal from 'react-modal';
import '../styles/WinnerModal.css';  

Modal.setAppElement('#root');

const WinnerModal = ({ isOpen, winner, onClose, onRematch, onReturnHome }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal-content"
            overlayClassName="modal-overlay"
            closeTimeoutMS={900}  
        >
            <div className="modal-body">
                <h2>🏆 Congratulations!</h2>
                {winner ? (
                  <p>{winner} has won the game!</p>
                ) : (
                  <p>It's a draw!</p>
                )}
                <button onClick={onRematch} className="close-button">Rematch</button>
                <button onClick={onReturnHome} className="close-button" style={{marginLeft: '10px'}}>Return to Home</button>
            </div>
        </Modal>
    );
};

export default WinnerModal;
