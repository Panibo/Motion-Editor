import { CloseIcon } from "./Icons";

const Keyframe = ({
  children,
  keyframe,
  keyframes,
  setKeyframes,
  selectedKeyframe,
  setSelectedKeyframe,
  deleteEnabled,
}) => {
  const imSelected = selectedKeyframe === keyframe.id;

  // Remove the frame and clear selection to avoid referencing a deleted pose.
  const handleDeleteKeyframe = () => {
    setSelectedKeyframe(null);
    const newKeyframes = keyframes.filter((kf) => kf.id !== keyframe.id);
    setKeyframes(newKeyframes);
  };

  const toggleSelected = () => {
    setSelectedKeyframe(imSelected ? null : keyframe.id);
  };

  return (
    <div
      className={`keyframe ${imSelected ? "selected" : ""}`}
      style={{
        "--keyframe-color": `var(--color-keyframe-${keyframe.value}, var(--color-primary))`,
      }}
      onClick={toggleSelected}
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Keyframe ${keyframe.value}`}
      aria-pressed={imSelected}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleSelected();
        }
      }}
    >
      {keyframes.length > 2 && deleteEnabled && (
        <div
          className="delete_keyframe"
          role="button"
          aria-label={`Delete keyframe ${keyframe.value}`}
          onClick={(e) => {
            // Prevent the parent keyframe from toggling while deleting it.
            e.stopPropagation();
            handleDeleteKeyframe();
          }}
        >
          <CloseIcon />
        </div>
      )}
      {children}
    </div>
  );
};

export default Keyframe;
