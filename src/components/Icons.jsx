// Share the same SVG defaults across all interface icons.
const IconBase = ({ children, className = "" }) => (
  <svg
    className={`ui_icon ${className}`.trim()}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const PlayIcon = () => (
  <IconBase>
    <path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none" />
  </IconBase>
);

const PauseIcon = () => (
  <IconBase>
    <path d="M8 5v14M16 5v14" strokeWidth="3" />
  </IconBase>
);

const PlusIcon = () => (
  <IconBase>
    <path d="M12 5v14M5 12h14" />
  </IconBase>
);

const MinusIcon = () => (
  <IconBase>
    <path d="M5 12h14" />
  </IconBase>
);

const CloseIcon = () => (
  <IconBase>
    <path d="m6 6 12 12M18 6 6 18" />
  </IconBase>
);

const ResetIcon = () => (
  <IconBase>
    <path d="M4.5 9A8 8 0 1 1 4 14" />
    <path d="M4.5 4.5V9H9" />
  </IconBase>
);

const UploadIcon = () => (
  <IconBase>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 15v4h14v-4" />
  </IconBase>
);

const DownloadIcon = () => (
  <IconBase>
    <path d="M12 4v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 15v4h14v-4" />
  </IconBase>
);

export {
  CloseIcon,
  DownloadIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ResetIcon,
  UploadIcon,
};
