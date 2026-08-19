import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import values from "../json/values.json";

// Versioned metadata keeps downloaded files identifiable and forward-compatible.
const PROJECT_DATA_KEY = "motionEditor";
const PROJECT_FORMAT = "motion-editor";
const PROJECT_VERSION = 1;
const puppetModelUrl = `${import.meta.env.BASE_URL}models/puppet_skeleton.gltf`;

// Only persist controls that are still supported by the editor.
const limbValueKeys = [
  "shoulderAbductionAdduction",
  "shoulderFlexionExtension",
  "shoulderLateralRotationMedialRotation",
  "elbowRotation",
  "wristAbductionAdduction",
  "wristFlexionExtension",
  "wristLateralRotationMedialRotation",
];

// Fill missing values from defaults when opening older or incomplete projects.
const normalizeLimbValues = (inputValues) =>
  Object.fromEntries(
    limbValueKeys.map((key) => [
      key,
      inputValues?.[key] ?? values.default[key],
    ]),
  );

const normalizeDuration = (duration) => {
  const parsedDuration = Number(duration);

  if (!Number.isFinite(parsedDuration)) return values.default.duration;

  return Math.min(
    values.max.duration,
    Math.max(values.min.duration, parsedDuration),
  );
};

// Convert Three.js quaternion instances into plain JSON-safe objects.
const serializeKeyframes = (keyframes) =>
  keyframes.map((keyframe) => ({
    id: keyframe.id,
    value: keyframe.value,
    isManuallySet:
      keyframe.isManuallySet ?? keyframe.quaternions.length > 1,
    inputValuesLeft: normalizeLimbValues(keyframe.inputValuesLeft),
    inputValuesRight: normalizeLimbValues(keyframe.inputValuesRight),
    quaternions: keyframe.quaternions.map(({ name, quaternion }) => ({
      name,
      quaternion: {
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
      },
    })),
  }));

const createFileName = (name) => {
  const safeName = name
    .trim()
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/[. ]+$/g, "");

  return `${safeName || "Untitled"}.gltf`;
};

// Use a temporary object URL to start a browser-managed local download.
const triggerDownload = (gltf, fileName) => {
  const blob = new Blob([JSON.stringify(gltf)], {
    type: "model/gltf+json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Export both the playable animation and editable project data into one GLTF.
const downloadEditorProject = ({
  animation,
  duration,
  keyframes,
  mode,
  name,
}) =>
  new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    const loader = new GLTFLoader();

    loader.load(
      puppetModelUrl,
      ({ scene }) => {
        exporter.parse(
          scene,
          (gltf) => {
            try {
              // Store editor-only data in GLTF extras without changing the model scene.
              gltf.extras = {
                ...gltf.extras,
                [PROJECT_DATA_KEY]: {
                  format: PROJECT_FORMAT,
                  version: PROJECT_VERSION,
                  name: name.trim(),
                  duration: normalizeDuration(duration),
                  mode,
                  keyframes: serializeKeyframes(keyframes),
                },
              };

              const fileName = createFileName(name);
              triggerDownload(gltf, fileName);
              resolve(fileName);
            } catch (error) {
              reject(error);
            }
          },
          reject,
          {
            animations: [animation],
            binary: false,
            includeCustomExtensions: true,
          },
        );
      },
      undefined,
      reject,
    );
  });

// Parse and validate an uploaded project before it reaches React state.
const readEditorProject = async (file) => {
  let gltf;

  try {
    gltf = JSON.parse(await file.text());
  } catch {
    throw new Error("The selected file is not a valid JSON-based GLTF file.");
  }

  const project = gltf?.extras?.[PROJECT_DATA_KEY];

  if (
    project?.format !== PROJECT_FORMAT ||
    project?.version !== PROJECT_VERSION
  ) {
    throw new Error("The GLTF file does not contain editable Motion Editor data.");
  }

  if (
    !Array.isArray(project.keyframes) ||
    project.keyframes.length < 2 ||
    !project.keyframes.every(
      (keyframe) =>
        Number.isInteger(keyframe?.id) &&
        typeof keyframe?.value === "string" &&
        Array.isArray(keyframe?.quaternions) &&
        keyframe?.inputValuesLeft &&
        keyframe?.inputValuesRight,
    )
  ) {
    throw new Error("The GLTF file contains invalid Motion Editor keyframe data.");
  }

  return {
    name: typeof project.name === "string" ? project.name : "Untitled",
    duration: normalizeDuration(project.duration),
    mode: ["left", "right", "mirror"].includes(project.mode)
      ? project.mode
      : "mirror",
    keyframes: project.keyframes.map((keyframe) => ({
      id: keyframe.id,
      value: keyframe.value,
      // Older project files predate this flag, so their saved poses are manual.
      isManuallySet:
        typeof keyframe.isManuallySet === "boolean"
          ? keyframe.isManuallySet
          : keyframe.quaternions.length > 1,
      quaternions: keyframe.quaternions,
      inputValuesLeft: normalizeLimbValues(keyframe.inputValuesLeft),
      inputValuesRight: normalizeLimbValues(keyframe.inputValuesRight),
    })),
  };
};

export { downloadEditorProject, readEditorProject };
