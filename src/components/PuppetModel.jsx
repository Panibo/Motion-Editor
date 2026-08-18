import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { shoulderControl } from "../controllers/shouldercontrols";
import { elbowControls } from "../controllers/elbowcontrols";
import { wristControls } from "../controllers/wristcontrols";
import {
  animationControls,
  createAnimationTracks,
} from "../controllers/animationcontrols";
import { useFrame } from "@react-three/fiber";
import { downloadEditorProject } from "../controllers/projectfilecontrols";

const puppetModelUrl = `${import.meta.env.BASE_URL}models/puppet_skeleton.gltf`;
const puppetTextureUrl = (fileName) =>
  `${import.meta.env.BASE_URL}models/textures/${fileName}`;

export const PuppetModel = ({
  keyframes,
  selectedKeyframe,
  setKeyframes,
  inputValuesRight,
  inputValuesLeft,
  play,
  setPlay,
  duration,
  save,
  setSave,
  name,
  mode,
  setMessage,
  setTrackCount,
}) => {
  // State to manage the tracks of the animation
  const [tracks, setTracks] = useState([]);
  // Ref to the current action
  const action = useRef(null);

  useEffect(() => {
    // Set the track count
    setTrackCount(tracks.length);
  }, [tracks]);

  // Load the puppet model
  const { nodes } = useGLTF(puppetModelUrl);

  // Ref to the animation mixer
  const mixer = useRef(new THREE.AnimationMixer(nodes.puppet_geo));

  // Load the puppet's textures
  const baseColor = useTexture(puppetTextureUrl("puppet_BaseColor.png"));
  const normalMap = useTexture(puppetTextureUrl("puppet_Normal.png"));
  const roughnessMap = useTexture(
    puppetTextureUrl("puppet_OcclusionRoughnessMetallic.png")
  );
  // Set the textures to the puppet's material
  nodes.puppet_geo.material.map = baseColor;
  nodes.puppet_geo.material.normalMap = normalMap;
  nodes.puppet_geo.material.metalnessMap = roughnessMap;
  nodes.puppet_geo.material.roughnessMap = roughnessMap;
  nodes.puppet_geo.material.aoMap = roughnessMap;
  // Flip the textures
  nodes.puppet_geo.material.map.flipY = false;
  nodes.puppet_geo.material.normalMap.flipY = false;
  nodes.puppet_geo.material.metalnessMap.flipY = false;
  nodes.puppet_geo.material.roughnessMap.flipY = false;
  nodes.puppet_geo.material.aoMap.flipY = false;

  useEffect(() => {
    if (!play && action.current) {
      action.current.stop();
    }
    if (tracks.length > 0 && play) {
      // Find the maximum time among all tracks
      let maxTime = 0;
      tracks.forEach((track) => {
        const times = track.times;
        const lastTime = times[times.length - 1];
        if (lastTime > maxTime) {
          maxTime = lastTime;
        }
      });

      // Create a single animation clip containing all tracks
      const clip = new THREE.AnimationClip("Animation", maxTime, tracks);

      // Create or update the action
      if (!action.current) {
        action.current = mixer.current.clipAction(clip);
        action.current.setLoop(THREE.LoopPingPong);
      } else {
        action.current.stop();
        action.current = mixer.current.clipAction(clip);
      }

      action.current.play();
    }
  }, [play]);

  // Stop all actions and clear cache on unmount
  useEffect(() => {
    return () => {
      console.log("unmount");
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current.uncacheRoot(nodes.puppet_geo);
      }
    };
  }, []);

  // Update the animation mixer
  useFrame((_state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  // Control the puppet
  useEffect(() => {
    // Stop the animation when input changes
    if (action.current) {
      action.current.stop();
      setPlay(false);
    }
    if (nodes && inputValuesLeft && inputValuesRight) {
      // Shoulder, elbow and wrist controls
      shoulderControl(nodes, inputValuesRight, inputValuesLeft);
      elbowControls(nodes, inputValuesRight, inputValuesLeft);
      wristControls(nodes, inputValuesRight, inputValuesLeft);
      // Animation controls
      animationControls(
        nodes,
        keyframes,
        selectedKeyframe,
        setKeyframes,
        inputValuesLeft,
        inputValuesRight,
      );
    }
  }, [inputValuesRight, inputValuesLeft, selectedKeyframe]);

  // Rebuild the animation tracks when keyframes or total duration changes
  useEffect(() => {
    setTracks(createAnimationTracks(keyframes, duration));
  }, [keyframes, duration]);

  useEffect(() => {
    if (!save) return;

    if (name.trim() === "") {
      setMessage("Please name the exercise.");
      setSave(false);
      return;
    }

    if (tracks.length === 0) {
      setMessage("No exercise to save.");
      setSave(false);
      return;
    }

    const maxTime = Math.max(
      ...tracks.map((track) => track.times[track.times.length - 1]),
    );
    const animation = new THREE.AnimationClip("Animation", maxTime, tracks);

    setMessage("Preparing download...");
    downloadEditorProject({ animation, duration, keyframes, mode, name })
      .then((fileName) => {
        setMessage(`${fileName} downloaded successfully.`);
      })
      .catch((error) => {
        console.error("Failed to create the exercise file:", error);
        setMessage("Could not create the exercise file.");
      })
      .finally(() => {
        setSave(false);
      });
  }, [save]);
  // Return the JSX of the puppet model
  return (
    <group dispose={null} position={[0, -1, 0]}>
      <primitive object={nodes.root_jnt} />
      <skinnedMesh
        geometry={nodes.puppet_geo.geometry}
        material={nodes.puppet_geo.material}
        skeleton={nodes.puppet_geo.skeleton}
      />
    </group>
  );
};

useGLTF.preload(puppetModelUrl);
