import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const FileIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
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
      d="M9 1H3v14h10V5L9 1zm1 4V2.4l2.6 2.6H10zM4 14V2h5v4h4v8H4z"
    />
  </svg>
);

export const FolderIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
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
      d="M14.5 3H7.71l-1.34-1.74a.997.997 0 0 0-.8-.36H1.5C.67 0 0 .67 0 1.5v13c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-10c0-.83-.67-1.5-1.5-1.5zM1 14.5v-10h14v10H1zm14-11H7.21L5.87 1.76a.332.332 0 0 0-.27-.12H1.5c-.28 0-.5.22-.5.5v1.4h14v-.04z"
    />
  </svg>
);

export const FolderOpenIcon: React.FC<IconProps> = ({ size = 16, style, ...props }) => (
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
      d="M1.5 1C.67 1 0 1.67 0 2.5v11c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5H8.71L7.37 1.76a.997.997 0 0 0-.8-.36H1.5zM15 13.5H1v-8h14v8zm0-9H8.21L6.87 2.76a.332.332 0 0 0-.27-.12H1.5c-.28 0-.5.22-.5.5v2h14v-1.04z"
    />
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
