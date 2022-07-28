import React from "react";
import PropTypes from 'prop-types';
import './modal.css'

const Modal = ({ children, title, close, isOpen }) => (
  <>
  {isOpen ? (
    <div className="modal">
    <div className="modalDialogue">
      <div className="modalContent">
        <div className="modalHeader">
          <h5 className="modalTitle">{title}</h5>
          <button onClick={() => close(false)} className="close">&times;</button>
        </div>
        <div className="modalBody">
          {children}
        </div>
      </div>
    </div>
  </div>
  ) : null}
  </>
);

Modal.propTypes = {
  title: PropTypes.string,
  close: PropTypes.func,
  isOpen: PropTypes.bool,
}

Modal.defaultProps = {
  title: 'Title',
  close: () => {},
  isOpen: false
}
export default Modal