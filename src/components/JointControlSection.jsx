// Provide a consistent, always-visible wrapper for each joint's controls.
const JointControlSection = ({ children, title }) => (
  <section className="joint_control_section">
    <h2>{title}</h2>
    <div className="joint_control_content">{children}</div>
  </section>
);

export default JointControlSection;
