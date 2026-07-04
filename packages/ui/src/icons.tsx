import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const FileIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const FolderIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M4 4h4.5l2 2.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
  </svg>
);

export const FolderOpenIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M4 4h4.5l2 2.5H20a1 1 0 0 1 1 1v2H3v-5.5a1 1 0 0 1 1-1z" />
    <path d="M3 10.5l2 9h15l-2-9H3z" />
  </svg>
);

export const FolderGithubIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M4 4h4.5l2 2.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path
      d="M12.5 13c-1.5.5-1.5-.7-2.1-.9m4.2 1.8v-1.2a1 1 0 0 0-.3-.8c.9-.1 1.9-.5 1.9-2.1a1.6 1.6 0 0 0-.5-1.1 1.5 1.5 0 0 0 0-1.1s-.4-.1-1.2.4a4 4 0 0 0-2.1 0c-.8-.5-1.2-.4-1.2-.4a1.5 1.5 0 0 0 0 1.1 1.6 1.6 0 0 0-.5 1.1c0 1.6 1 2 1.9 2.1a1 1 0 0 0-.3.8v1.2"
      strokeWidth="1"
    />
  </svg>
);

export const FolderDockerIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M4 4h4.5l2 2.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path d="M9.5 15h5M10.5 13h1m1-2h1m-1 2h1m1-2h1m-1 2h1m-1-2h1" strokeWidth="1" />
    <path d="M7.5 15c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-1h-10v1z" strokeWidth="1" />
  </svg>
);

export const FolderAngularIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M4 4h4.5l2 2.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path d="M12 9l3 6H9l3-6zm-1.5 4.5h3" strokeWidth="1" />
  </svg>
);

export const FolderVscodeIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M4 4h4.5l2 2.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path d="M9 16.5l6-4.5-6-4.5v9zm6-4.5l-2.5-2L16 9l-1 3-1 3 2-1z" strokeWidth="1" />
  </svg>
);

export const FileYamlIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, color: "#9d72de", ...style }}
    {...props}
  >
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke="var(--workbench-text-secondary)"
    />
    <polyline points="14 2 14 8 20 8" stroke="var(--workbench-text-secondary)" />
    <path d="M9.5 12l2.5 3.5v3M14.5 12l-2.5 3.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.74 10.34a6.5 6.5 0 1 0-1.4 1.4h-.01l3.85 3.85a1 1 0 0 0 1.41-1.41l-3.85-3.85zm-5.24.66a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
    />
  </svg>
);

export const SourceControlIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM3 3a2.5 2.5 0 1 1 3.5 2.28V10.7a2.5 2.5 0 1 1-1 0V5.28A2.5 2.5 0 0 1 3 3zm8.5 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-1 1.5a2.5 2.5 0 1 1 3.5-2.28 2.5 2.5 0 0 1-3.5 2.28zM6.5 9v1.2a2.49 2.49 0 0 0 1 2.02l.06-.02a2.5 2.5 0 0 1 3.94-.7l-1-1h1.5v1.5l-1-1a1.5 1.5 0 0 0-2-1V9h-2.5z"
    />
  </svg>
);

export const RunDebugIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.7 4.3c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-3.3 3.3c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l3.3-3.3zm-6 2c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-3.3 3.3c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l3.3-3.3zm-3.3.7c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-2 2c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l2-2zm9.3 2c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-2 2c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l2-2zm-5.7 3c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-.7.7c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l.7-.7z"
    />
    <path d="M11 6c0 1.66-1.34 3-3 3S5 7.66 5 6s1.34-3 3-3 3 1.34 3 3z" />
  </svg>
);

export const ExtensionsIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M11.5 1H10V2.5H11.5V5H13v1H11.5V11H10V12.5H11.5V15H8v-1.5H6.5V15H3v-2.5H1.5V10H3V6.5H1.5V5H3V2.5H6.5V1H8v1.5H6.5V5H8V2.5H9.5V1h2zM8 6H6v2h2V6zm-3 3h2v2H5V9zm5-3H8v2h2V6z" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.1 1.556c-.3-.9-1.9-.9-2.2 0l-.167.5c-.322.083-.628.21-.908.37l-.463-.263c-.8-.457-1.8.2-1.4 1.1l.263.463c-.16.28-.287.586-.37.908l-.5.167c-.9.3-.9 1.9 0 2.2l.5.167c.083.322.21.628.37.908l-.263.463c-.4.9.6 1.957 1.4 1.5l.463-.263c.28.16.586.287.908.37l.167.5c.3.9 1.9.9 2.2 0l.167-.5c.322-.083.628-.21.908-.37l.463.263c.8.457 1.8-.2 1.4-1.1l-.263-.463c.16-.28.287-.586.37-.908l.5-.167c.9-.3.9-1.9 0-2.2l-.5-.167a4.394 4.394 0 0 0-.37-.908l.263-.463c.4-.9-.6-1.957-1.4-1.5l-.463.263a4.394 4.394 0 0 0-.908-.37l-.167-.5zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
    />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.75 8a4.75 4.75 0 1 1-9.5 0c0-.85.22-1.65.62-2.35l1.03 1.03c-.4.4-.65.98-.65 1.32a3.75 3.75 0 1 0 7.5 0 .5.5 0 0 1 1 0zm-.71-2.91A6 6 0 1 0 8 14V13c.43 0 .84-.04 1.24-.12l-1.04-1.04a4.996 4.996 0 0 1-5.69-2.35l.89-.89a3.996 3.996 0 0 0 4.54 1.48l1.1-1.1c-.84-.52-1.84-.78-2.8-.78v-1.1h1.1z M13.5 1.5v4h-4l1.5-1.5-1.5-1.5 4 3z"
    />
  </svg>
);

export const CollapseAllIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 5.7L2.3 11.4l-.7-.7L8 4.3l6.4 6.4-.7.7L8 5.7z M8 10.7L3.3 15.4l-.7-.7L8 9.3l5.4 5.4-.7.7L8 10.7z"
    />
  </svg>
);

export const NewFileIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M9 1H3v14h10V5L9 1zm1 4V2.4l2.6 2.6H10zM4 14V2h5v4h4v8H4z" />
    <path d="M7 8h2v2h2v1H9v2H7v-2H5v-1h2V8z" fill="#4caf50" />
  </svg>
);

export const NewFolderIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M14.5 3H7.71l-1.34-1.74a.997.997 0 0 0-.8-.36H1.5C.67 0 0 .67 0 1.5v13c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-10c0-.83-.67-1.5-1.5-1.5zM1 14.5v-10h14v10H1z" />
    <path d="M7 7h2v2h2v1H9v2H7v-2H5V9h2V7z" fill="#4caf50" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    {...props}
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

export const DiagnosticsIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    {...props}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>
);

export const ProblemsIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export const OutputIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const MinusIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export const SplitHorizontalIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="12" y1="3" x2="12" y2="21"></line>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const MoreHorizontalIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

export const MaximizeIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const UndoIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export const ErrorIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export const GitBranchIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
