import type { ToolbarButtonProps } from "./types";


const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    onClick,
    active,
    children,
    title,
    disabled,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded p-2 transition-colors hover:bg-gray-100 ${
        active ? "bg-gray-200 text-blue-600" : "text-gray-600"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );


  export default ToolbarButton;