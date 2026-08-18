// Display a blocking confirmation dialog before a destructive editor action.

import "../styles/ConfirmationBox.css";
const ConfirmationBox = ({ children, onConfirm, onCancel }) => {
  return (
    <div className="confirmationbox_overlay">
      <section
        className="confirmationbox popup"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <h2 id="confirmation-title">{children}</h2>
        <div className="confirmationbox_buttons">
          <button type="button" onClick={onConfirm}>
            Yes
          </button>
          <button type="button" onClick={onCancel}>
            No
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfirmationBox;
