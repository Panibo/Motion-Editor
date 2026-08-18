import * as THREE from "three";
import { DEG2RAD } from "three/src/math/MathUtils";

const wristControls = (nodes, inputValuesRight, inputValuesLeft) => {
  // Apply the rotation to the wrist joints
  wristRotation(nodes.R_palm_jnt, inputValuesRight);
  wristRotation(nodes.L_palm_jnt, inputValuesLeft);
};
const wristRotation = (bone, inputValues) => {
  const {
    wristAbductionAdduction,
    wristFlexionExtension,
    wristLateralRotationMedialRotation,
  } = inputValues;
  const inverse = bone.name === "L_palm_jnt" ? -1 : 1;
  // Convert degrees to radians for wrist joint
  const wristAbductionAdductionRad =
    inverse * wristAbductionAdduction * DEG2RAD;
  const wristFlexionExtensionRad = wristFlexionExtension * DEG2RAD;
  const wristLateralRotationMedialRotationRad =
    inverse * wristLateralRotationMedialRotation * DEG2RAD;

  // Define the axis of rotation for each control
  const twistAxis = new THREE.Vector3(0, 1, 0);
  const sidewaysAxis = new THREE.Vector3(1, 0, 0);
  const frontToBackAxis = new THREE.Vector3(0, 0, 1);

  // Calculate the rotations along each axis
  const twistQuaternion = new THREE.Quaternion().setFromAxisAngle(
    twistAxis,
    wristLateralRotationMedialRotationRad
  );
  const sidewaysQuaternion = new THREE.Quaternion().setFromAxisAngle(
    sidewaysAxis,
    wristFlexionExtensionRad
  );
  const frontToBackQuaternion = new THREE.Quaternion().setFromAxisAngle(
    frontToBackAxis,
    wristAbductionAdductionRad
  );
  // Combine the rotations
  let wristRotation = new THREE.Quaternion();
  wristRotation.multiply(twistQuaternion);
  wristRotation.multiply(frontToBackQuaternion);
  wristRotation.multiply(sidewaysQuaternion);
  // Normalize the quaternion to ensure unit length
  wristRotation.normalize();

  // Apply the combined rotation to the wrist joint
  bone.quaternion.copy(wristRotation);
};

export { wristControls };
