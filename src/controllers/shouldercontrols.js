import * as THREE from "three";
import { DEG2RAD } from "three/src/math/MathUtils";

const shoulderControl = (nodes, inputValuesRight, inputValuesLeft) => {
  // Apply the rotation to the shoulder joint
  shoulderRotation(nodes.R_upperArm_jnt, inputValuesRight);
  shoulderRotation(nodes.L_upperArm_jnt, inputValuesLeft);
};
const shoulderRotation = (bone, inputValues) => {
  const {
    shoulderAbductionAdduction,
    shoulderFlexionExtension,
    shoulderLateralRotationMedialRotation,
  } = inputValues;
  // Convert degrees to radians for shoulder joints
  const inverse = bone.name === "L_upperArm_jnt" ? -1 : 1;
  const shoulderAbductionAdductionRad =
    inverse * shoulderAbductionAdduction * DEG2RAD;
  const shoulderFlexionExtensionRad = -1 * shoulderFlexionExtension * DEG2RAD;
  const shoulderLateralRotationMedialRotationRad =
    inverse * shoulderLateralRotationMedialRotation * DEG2RAD;

  // Define the axis of rotation for each control
  const twistAxis = new THREE.Vector3(0, 1, 0);
  const sidewaysAxis = new THREE.Vector3(1, 0, 0);
  const frontToBackAxis = new THREE.Vector3(0, 0, 1);

  // Calculate the rotations along each axis
  const twistQuaternion = new THREE.Quaternion().setFromAxisAngle(
    twistAxis,
    shoulderLateralRotationMedialRotationRad
  );
  const sidewaysQuaternion = new THREE.Quaternion().setFromAxisAngle(
    sidewaysAxis,
    shoulderFlexionExtensionRad
  );
  const frontToBackQuaternion = new THREE.Quaternion().setFromAxisAngle(
    frontToBackAxis,
    shoulderAbductionAdductionRad
  );

  // Combine the rotations
  let shoulderRotation = new THREE.Quaternion();
  shoulderRotation.multiply(sidewaysQuaternion);
  shoulderRotation.multiply(frontToBackQuaternion);
  shoulderRotation.multiply(twistQuaternion);
  // Normalize the quaternion to ensure unit length
  shoulderRotation.normalize();

  // Apply the combined rotation to the shoulder joint
  bone.quaternion.copy(shoulderRotation);
};
export { shoulderControl };
