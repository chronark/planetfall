import classNames from "classnames";

type Props = {
  status: "healthy" | "stopped" | "error" | "degraded";
};

export const Status: React.FC<Props> = ({ status }) => {
  return (
    <div>
      <div
        className={classNames("p-px  border rounded-full", {
          "border-emerald-300": status === "healthy",
          "border-zinc-200": status === "stopped",
          "border-amber-300": status === "degraded",
          "border-red-300": status === "error",
        })}
      >
        <div
          className={classNames("w-2 h-2 rounded-full", {
            "bg-emerald-500": status === "healthy",
            "bg-zinc-300": status === "stopped",
            "bg-amber-500": status === "degraded",
            "bg-red-500": status === "error",
          })}
        />
      </div>
    </div>
  );
};
