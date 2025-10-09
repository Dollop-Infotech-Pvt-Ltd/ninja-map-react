import { useTheme } from "next-themes";
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
            "group toast bg-red-600 text-white border border-red-700 shadow-lg",
          description: "text-white/90",
          actionButton:
            "bg-white text-red-700",
          cancelButton:
            "bg-red-700 text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
