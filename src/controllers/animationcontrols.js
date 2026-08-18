import * as THREE from "three";

// Capture the current skeleton pose and slider values into the selected frame.
const animationControls = (
  nodes,
  keyframes,
  selectedKeyframe,
  setKeyFrames,
  inputValuesLeft,
  inputValuesRight,
) => {
  if (selectedKeyframe === null) return;

  // Replace the previous pose instead of accumulating duplicate bone values.
  const updatedKeyframes = keyframes.map((frame) => {
    if (frame.id === selectedKeyframe) {
      return { ...frame, quaternions: [] };
    }
    return frame;
  });
  const selectedFrame = updatedKeyframes.find(
    (frame) => frame.id === selectedKeyframe,
  );

  if (!selectedFrame) return;

  // Store every bone quaternion so the complete pose can be reconstructed.
  Object.keys(nodes).forEach((nodeName) => {
    const boneNode = nodes[nodeName];

    if (boneNode.isBone) {
      const quaternionToAdd = boneNode.quaternion.clone();
      selectedFrame.quaternions.push({
        name: boneNode.name,
        quaternion: quaternionToAdd,
      });
    }
  });

  selectedFrame.inputValuesLeft = { ...inputValuesLeft };
  selectedFrame.inputValuesRight = { ...inputValuesRight };
  setKeyFrames(updatedKeyframes);
};

// Convert completed editor frames into Three.js quaternion animation tracks.
const createAnimationTracks = (keyframes, duration) => {
  const hasCompleteKeyframes =
    keyframes.length >= 2 &&
    keyframes.every((frame) => frame.quaternions.length > 1);

  if (!hasCompleteKeyframes) return [];

  const parsedDuration = Number(duration);
  const totalDuration =
    Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 1;
  const lastFrameIndex = keyframes.length - 1;
  const boneQuaternions = {};

  keyframes.forEach((frame, frameIndex) => {
    // Distribute frames evenly across the user-defined total duration.
    const keyframeTime = (frameIndex / lastFrameIndex) * totalDuration;

    frame.quaternions.forEach((quaternion) => {
      const { quaternion: boneQuaternion, name: boneName } = quaternion;

      if (!boneQuaternions[boneName]) {
        boneQuaternions[boneName] = {
          times: [],
          values: [],
        };
      }

      boneQuaternions[boneName].times.push(keyframeTime);
      boneQuaternions[boneName].values.push(
        boneQuaternion.x,
        boneQuaternion.y,
        boneQuaternion.z,
        boneQuaternion.w
      );
    });
  });

  return Object.entries(boneQuaternions).map(([boneName, data]) => {
    const trackName = `${boneName}.quaternion`;
    return new THREE.QuaternionKeyframeTrack(
      trackName,
      data.times,
      data.values,
    );
  });
};

export { animationControls, createAnimationTracks };
