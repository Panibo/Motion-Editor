import Save from "../components/Save";
import values from "../json/values.json";
import JointControlSection from "../components/JointControlSection";
import ConfirmationBox from "../components/ConfirmationBox";
import KeyframeBox from "../components/KeyframeBox";
import {
  DownloadIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  UploadIcon,
} from "../components/Icons";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { PuppetModel } from "../components/PuppetModel";
import { readEditorProject } from "../controllers/projectfilecontrols";
import { OrbitControls } from "@react-three/drei";
import "../styles/JointControls.css";
import "../styles/Editor.css";

// Coordinate the editor UI, pose values, keyframes, and local project files.
const Editor = () => {
  // State to manage the message
  const [message, setMessage] = useState("");
  // State to manage the mode
  const [mode, setMode] = useState("mirror");
  // State to manage the save overlay
  const [saveOpen, setSaveOpen] = useState(false);
  // State to manage the total animation duration in seconds
  const [duration, setDuration] = useState(values.default.duration);
  // State to manage the selected keyframe
  const [selectedKeyframe, setSelectedKeyframe] = useState(null);
  // States to manage the play of the animation
  const [play, setPlay] = useState(false);
  // State to manage the save toggle
  const [save, setSave] = useState(false);
  // State to manage the save name
  const [name, setName] = useState("");

  // Right input values
  const [inputValuesRight, setInputValuesRight] = useState({
    shoulderAbductionAdduction: values.default.shoulderAbductionAdduction,
    shoulderFlexionExtension: values.default.shoulderFlexionExtension,
    shoulderLateralRotationMedialRotation:
      values.default.shoulderLateralRotationMedialRotation,
    elbowRotation: values.default.elbowRotation,
    wristAbductionAdduction: values.default.wristAbductionAdduction,
    wristFlexionExtension: values.default.wristFlexionExtension,
    wristLateralRotationMedialRotation:
      values.default.wristLateralRotationMedialRotation,
  });

  // Left input values
  const [inputValuesLeft, setInputValuesLeft] = useState({
    shoulderAbductionAdduction: values.default.shoulderAbductionAdduction,
    shoulderFlexionExtension: values.default.shoulderFlexionExtension,
    shoulderLateralRotationMedialRotation:
      values.default.shoulderLateralRotationMedialRotation,
    elbowRotation: values.default.elbowRotation,
    wristAbductionAdduction: values.default.wristAbductionAdduction,
    wristFlexionExtension: values.default.wristFlexionExtension,
    wristLateralRotationMedialRotation:
      values.default.wristLateralRotationMedialRotation,
  });

  // Handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // A frame only stops inheriting its predecessor after the user edits its pose.
    if (selectedKeyframe !== null) {
      setKeyframes((currentKeyframes) => {
        const selectedFrame = currentKeyframes.find(
          (frame) => frame.id === selectedKeyframe,
        );

        if (!selectedFrame || selectedFrame.isManuallySet) {
          return currentKeyframes;
        }

        return currentKeyframes.map((frame) =>
          frame.id === selectedKeyframe
            ? { ...frame, isManuallySet: true }
            : frame,
        );
      });
    }

    // Set the input values based on the mode
    if (mode === "mirror" || mode === "right") {
      setInputValuesRight((prevInputValues) => ({
        ...prevInputValues,
        [name]: value,
      }));
    }
    if (mode === "mirror" || mode === "left") {
      setInputValuesLeft((prevInputValues) => ({
        ...prevInputValues,
        [name]: value,
      }));
    }
  };

  // Set input values to equal if mirror is selected
  useEffect(() => {
    if (mode === "mirror") {
      setInputValuesLeft(inputValuesRight);
    }
  }, [mode]);

  // Keyframes
  // Initialized with 3 keyframes

  const [keyframes, setKeyframes] = useState([
    {
      id: 2523629,
      value: "1",
      quaternions: [{ name: "", quaternion: "" }],
      inputValuesLeft: {},
      inputValuesRight: {},
      isManuallySet: false,
    },
    {
      id: 5797054,
      value: "2",
      quaternions: [{ name: "", quaternion: "" }],
      inputValuesLeft: {},
      inputValuesRight: {},
      isManuallySet: false,
    },
    {
      id: 2122420,
      value: "3",
      quaternions: [{ name: "", quaternion: "" }],
      inputValuesLeft: {},
      inputValuesRight: {},
      isManuallySet: false,
    },
  ]);

  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleReset = () => {
    window.location.reload();
  };

  const [trackCount, setTrackCount] = useState(0);
  const projectFileInput = useRef(null);

  // Restore all editable state from a previously downloaded GLTF project.
  const handleProjectUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("Opening exercise...");

    try {
      const project = await readEditorProject(file);
      const firstKeyframe = project.keyframes[0];

      setPlay(false);
      setSave(false);
      setSaveOpen(false);
      setSelectedKeyframe(firstKeyframe.id);
      setName(project.name);
      setDuration(project.duration);
      setMode(project.mode);
      setKeyframes(project.keyframes);
      setInputValuesLeft(firstKeyframe.inputValuesLeft);
      setInputValuesRight(firstKeyframe.inputValuesRight);
      setMessage(`${file.name} opened for editing.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not open the selected exercise file.",
      );
    } finally {
      event.target.value = "";
    }
  };

  // Return the JSX for the Editor component
  return (
    <div className="editor_container">
      {confirmationOpen && (
        <ConfirmationBox
          onCancel={() => {
            setConfirmationOpen(false);
          }}
          onConfirm={handleReset}
        >
          Are you sure you want to reset?
        </ConfirmationBox>
      )}
      <Save
        visible={saveOpen}
        setSaveOpen={setSaveOpen}
        setName={setName}
        name={name}
        setSave={setSave}
        message={message}
        setMessage={setMessage}
      />
      <div className="editor_workspace">
        {/* The canvas fills the workspace so overlays can sit directly on the 3D view. */}
        <div className="editor_canvas_container">
          <Canvas camera={{ position: [0, 0, 2.5] }} shadows>
            <ambientLight intensity={1.5} />
            <directionalLight
              position={[-5, 5, 5]}
              intensity={2.5}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              castShadow
            />
            <OrbitControls />
            <PuppetModel
              keyframes={keyframes}
              selectedKeyframe={selectedKeyframe}
              setKeyframes={setKeyframes}
              inputValuesRight={inputValuesRight}
              inputValuesLeft={inputValuesLeft}
              play={play}
              setPlay={setPlay}
              duration={duration}
              save={save}
              setSave={setSave}
              name={name}
              mode={mode}
              setMessage={setMessage}
              setTrackCount={setTrackCount}
            />
          </Canvas>
          {/* Keep keyframes fixed at the top without covering them with a panel. */}
          <section className="editor_keyframe_overlay" aria-label="Keyframes">
            <KeyframeBox
              keyframes={keyframes}
              setKeyframes={setKeyframes}
              selectedKeyframe={selectedKeyframe}
              setSelectedKeyframe={setSelectedKeyframe}
              setInputValuesLeft={setInputValuesLeft}
              setInputValuesRight={setInputValuesRight}
            />
          </section>
          {/* Frequently used animation settings remain accessible over the canvas. */}
          <div className="editor_canvas_settings" aria-label="Animation settings">
            <div className="editor_side_control">
              <span className="editor_side_label">Side</span>
              <div className="editor_side_buttons" role="group" aria-label="Side">
                <button
                  type="button"
                  className={
                    "editor_menu_item_button editor_side_button" +
                    (mode === "left"
                      ? " editor_menu_item_button_selected"
                      : "")
                  }
                  aria-pressed={mode === "left"}
                  onClick={() => setMode("left")}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={
                    "editor_menu_item_button editor_side_button" +
                    (mode === "mirror"
                      ? " editor_menu_item_button_selected"
                      : "")
                  }
                  aria-pressed={mode === "mirror"}
                  onClick={() => setMode("mirror")}
                >
                  Both
                </button>
                <button
                  type="button"
                  className={
                    "editor_menu_item_button editor_side_button" +
                    (mode === "right"
                      ? " editor_menu_item_button_selected"
                      : "")
                  }
                  aria-pressed={mode === "right"}
                  onClick={() => setMode("right")}
                >
                  Right
                </button>
              </div>
            </div>
            <label
              className="editor_duration_control"
              htmlFor="animation-duration"
            >
              <span>Duration</span>
              <span className="editor_duration_input">
                <input
                  id="animation-duration"
                  type="number"
                  min={values.min.duration}
                  max={values.max.duration}
                  step="0.5"
                  value={duration}
                  aria-label="Animation duration in seconds"
                  onChange={(event) => {
                    const nextDuration = event.target.valueAsNumber;

                    if (Number.isFinite(nextDuration)) {
                      setDuration(
                        Math.min(
                          values.max.duration,
                          Math.max(values.min.duration, nextDuration),
                        ),
                      );
                    }
                  }}
                />
                <span aria-hidden="true">sec</span>
              </span>
            </label>
          </div>
          <button
            type="button"
            className="play_button"
            aria-label={play ? "Pause animation" : "Play animation"}
            disabled={!play && trackCount === 0}
            onClick={() => setPlay((currentPlay) => !currentPlay)}
          >
            {play ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      {/* Joint controls stay visible instead of using collapsible menus. */}
      <div className="editor_menu_container">
        <div className="editor_menu" aria-label="Joint controls">
          <div className="editor_joint_controls">
            {/* Shoulder */}
            <JointControlSection title="Shoulder">
              <label htmlFor="shoulder-abduction-adduction">
                Abduction - Adduction
              </label>
              <input
                id="shoulder-abduction-adduction"
                type="range"
                min={values.min.shoulderAbductionAdduction}
                max={values.max.shoulderAbductionAdduction}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.shoulderAbductionAdduction
                    : inputValuesLeft.shoulderAbductionAdduction
                }
                onChange={(e) => handleInputChange(e)}
                name="shoulderAbductionAdduction"
                className="editor_menu_item_slider"
              />

              <label htmlFor="shoulder-flexion-extension">
                Flexion - Extension
              </label>
              <input
                id="shoulder-flexion-extension"
                type="range"
                min={values.min.shoulderFlexionExtension}
                max={values.max.shoulderFlexionExtension}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.shoulderFlexionExtension
                    : inputValuesLeft.shoulderFlexionExtension
                }
                onChange={(e) => handleInputChange(e)}
                name="shoulderFlexionExtension"
                className="editor_menu_item_slider"
              />

              <label htmlFor="shoulder-lateral-medial-rotation">
                Lateral Rotation - Medial Rotation
              </label>
              <input
                id="shoulder-lateral-medial-rotation"
                type="range"
                min={values.min.shoulderLateralRotationMedialRotation}
                max={values.max.shoulderLateralRotationMedialRotation}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.shoulderLateralRotationMedialRotation
                    : inputValuesLeft.shoulderLateralRotationMedialRotation
                }
                onChange={(e) => handleInputChange(e)}
                name="shoulderLateralRotationMedialRotation"
                className="editor_menu_item_slider"
              />
            </JointControlSection>
            {/* Elbow */}
            <JointControlSection title="Elbow">
              <label htmlFor="elbow-extension-flexion">
                Extension - Flexion
              </label>
              <input
                id="elbow-extension-flexion"
                type="range"
                min={values.min.elbowRotation}
                max={values.max.elbowRotation}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.elbowRotation
                    : inputValuesLeft.elbowRotation
                }
                onChange={(e) => handleInputChange(e)}
                name="elbowRotation"
                className="editor_menu_item_slider"
              />
            </JointControlSection>
            {/* Wrist */}
            <JointControlSection title="Wrist">
              <label htmlFor="wrist-abduction-adduction">
                Abduction - Adduction
              </label>
              <input
                id="wrist-abduction-adduction"
                type="range"
                min={values.min.wristAbductionAdduction}
                max={values.max.wristAbductionAdduction}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.wristAbductionAdduction
                    : inputValuesLeft.wristAbductionAdduction
                }
                onChange={(e) => handleInputChange(e)}
                name="wristAbductionAdduction"
                className="editor_menu_item_slider"
              />
              <label htmlFor="wrist-flexion-extension">
                Flexion - Extension
              </label>
              <input
                id="wrist-flexion-extension"
                type="range"
                min={values.min.wristFlexionExtension}
                max={values.max.wristFlexionExtension}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.wristFlexionExtension
                    : inputValuesLeft.wristFlexionExtension
                }
                onChange={(e) => handleInputChange(e)}
                name="wristFlexionExtension"
                className="editor_menu_item_slider"
              />
              <label htmlFor="wrist-lateral-medial-rotation">
                Lateral Rotation - Medial Rotation
              </label>
              <input
                id="wrist-lateral-medial-rotation"
                type="range"
                min={values.min.wristLateralRotationMedialRotation}
                max={values.max.wristLateralRotationMedialRotation}
                value={
                  mode === "right" || mode === "mirror"
                    ? inputValuesRight.wristLateralRotationMedialRotation
                    : inputValuesLeft.wristLateralRotationMedialRotation
                }
                onChange={(e) => handleInputChange(e)}
                name="wristLateralRotationMedialRotation"
                className="editor_menu_item_slider"
              />
            </JointControlSection>
          </div>
          {/* Project actions operate entirely through local browser files. */}
          <div className="editor_actions_panel">
            <div className="editor_actions">
              <span className="editor_actions_label">Actions</span>
              <div className="editor_action_buttons">
                <button
                  className="editor_menu_item_button editor_action_button--danger"
                  onClick={() => {
                    setConfirmationOpen(true);
                  }}
                >
                  <ResetIcon />
                  <span>Reset</span>
                </button>
                <button
                  className="editor_menu_item_button"
                  onClick={() => projectFileInput.current?.click()}
                >
                  <UploadIcon />
                  <span>Upload</span>
                </button>
                <label className="project_upload_label" htmlFor="project-upload">
                  Upload exercise file
                </label>
                <input
                  id="project-upload"
                  ref={projectFileInput}
                  className="project_upload_input"
                  type="file"
                  accept=".gltf,model/gltf+json,application/json"
                  onChange={handleProjectUpload}
                />
                <button
                  className="editor_menu_item_button editor_action_button--primary"
                  onClick={() => {
                    setMessage("");
                    setSaveOpen(true);
                  }}
                >
                  <DownloadIcon />
                  <span>Download</span>
                </button>
              </div>
            </div>
            {message && (
              <p className="project_file_message" role="status">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
