import "../styles/Save.css";

const Save = ({
  visible,
  setSaveOpen,
  setName,
  setSave,
  setMessage,
  message,
  name,
}) => {
  // Validate and normalize the name before asking the model to create a file.
  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage("Please name the exercise.");
      return;
    }

    setName(trimmedName);
    setSave(true);
  };

  if (!visible) return null;

  // Render as a modal so downloading remains a focused, explicit action.
  return (
    <div className="save_overlay">
      <section
        className="save_container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-title"
      >
        <h1 id="download-title">Download exercise</h1>
        <p className="save_message" role="status">
          {message}
        </p>
        <div className="save_field">
          <label htmlFor="exercise-name">Exercise name</label>
          <input
            id="exercise-name"
            type="text"
            className="save_input"
            placeholder="Exercise name"
            maxLength="30"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </div>
        <div className="save_button_container">
          <button
            type="button"
            className="save_button"
            onClick={() => {
              setSave(false);
              setMessage("");
              setSaveOpen(false);
            }}
          >
            Back
          </button>
          <button type="button" className="save_button" onClick={handleSave}>
            Download
          </button>
        </div>
      </section>
    </div>
  );
};

export default Save;
