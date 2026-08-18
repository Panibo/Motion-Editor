import { useEffect, useState } from "react";
import Keyframe from "./Keyframe";
import { MinusIcon, PlusIcon } from "./Icons";
import "../styles/Keyframes.css";
const KeyframeBox = ({
  keyframes,
  setKeyframes,
  selectedKeyframe,
  setSelectedKeyframe,
  setInputValuesLeft,
  setInputValuesRight,
}) => {
  const keyFrameMaxCount = 5;

  // Restore the saved slider values when selecting a completed keyframe.
  useEffect(() => {
    if (
      keyframes.find((keyframe) => keyframe.id === selectedKeyframe) ===
      undefined
    )
      return;

    if (
      selectedKeyframe !== null &&
      keyframes.find((keyframe) => keyframe.id === selectedKeyframe).quaternions
        .length > 1
    ) {
      const keyframe = keyframes.find(
        (keyframe) => keyframe.id === selectedKeyframe
      );
      setInputValuesLeft(keyframe.inputValuesLeft);
      setInputValuesRight(keyframe.inputValuesRight);
    }
  }, [selectedKeyframe]);

  // Append a new frame and reuse the first available display number.
  const handleAddKeyframe = () => {
    if (keyframes.length >= keyFrameMaxCount) return;

    let valueset = new Set(keyframes.map((keyframe) => keyframe.value));
    let nextValue = 1;
    while (valueset.has(nextValue.toString())) {
      nextValue++;
    }

    const randomId = Math.floor(Math.random() * 10000000);

    setKeyframes((prevKeyframes) => [
      ...prevKeyframes,
      {
        id: randomId,
        value: nextValue.toString(),
        quaternions: [],
        inputValuesLeft: {
          x: 0,
          y: 0,
          z: 0,
          w: 0,
        },
        inputValuesRight: {
          x: 0,
          y: 0,
          z: 0,
          w: 0,
        },
      },
    ]);
  };

  const handleDragStart = (e, sourceId) => {
    e.dataTransfer.setData("id", sourceId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    setSelectedKeyframe(null);
    const sourceId = e.dataTransfer.getData("id");

    const sourceIndex = keyframes.findIndex(
      (kf) => kf.id === parseInt(sourceId)
    );
    const targetIndex = keyframes.findIndex(
      (kf) => kf.id === parseInt(targetId)
    );

    if (sourceIndex === -1 || targetIndex === -1) return; // Ensure valid indexes

    const updatedKeyframes = [...keyframes];

    // Swap frames so their order also updates their animation timing.
    [updatedKeyframes[sourceIndex], updatedKeyframes[targetIndex]] = [
      updatedKeyframes[targetIndex],
      updatedKeyframes[sourceIndex],
    ];

    setKeyframes(updatedKeyframes);

    setTimeout(() => {
      setSelectedKeyframe(parseInt(sourceId));
    }, 0);
  };

  const [deleteEnabled, setDeleteEnabled] = useState(false);

  // At least two frames are required to build an animation.
  useEffect(() => {
    if (keyframes.length <= 2) {
      setDeleteEnabled(false);
    }
  }, [keyframes, deleteEnabled]);

  return (
    <div className="keyframe_container">
      <button
        type="button"
        className={`add_keyframe ${deleteEnabled ? "delete_selected" : ""}`}
        aria-label="Toggle keyframe deletion"
        aria-pressed={deleteEnabled}
        disabled={keyframes.length <= 2}
        onClick={() => {
          setDeleteEnabled(!deleteEnabled);
        }}
      >
        <MinusIcon />
      </button>

      <div className="line">
        {keyframes.map((keyframe) => (
          <div
            key={keyframe.id}
            draggable
            onDragStart={(e) => handleDragStart(e, keyframe.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, keyframe.id)}
          >
            <Keyframe
              keyframe={keyframe}
              selectedKeyframe={selectedKeyframe}
              setSelectedKeyframe={setSelectedKeyframe}
              keyframes={keyframes}
              setKeyframes={setKeyframes}
              deleteEnabled={deleteEnabled}
            ></Keyframe>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="add_keyframe"
        aria-label="Add keyframe"
        disabled={keyframes.length >= keyFrameMaxCount}
        onClick={handleAddKeyframe}
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default KeyframeBox;
