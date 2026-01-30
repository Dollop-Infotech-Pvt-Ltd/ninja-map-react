import { useTheme } from "@/hooks/use-theme";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ position = "top-right", ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast border border-green-200 bg-green-50 text-green-800 shadow-md",
          description: "text-green-800/80",
          actionButton:
            "bg-transparent text-green-800",
          cancelButton:
            "bg-transparent text-red-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
