import { DEG2RAD } from "three/src/math/MathUtils";

const elbowControls = (nodes, inputValuesRight, inputValuesLeft) => {
  // Apply the rotation to the elbow joints
  elbowRotation(nodes.R_foreArm_jnt, inputValuesRight);
  elbowRotation(nodes.L_foreArm_jnt, inputValuesLeft);
};
const elbowRotation = (bone, inputValues) => {
  const { elbowRotation } = inputValues;
  // Convert degrees to radians for elbow joints
  const elbowRotationRad = elbowRotation * DEG2RAD;
  bone.rotation.x = elbowRotationRad;
};
export { elbowControls };
