import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-xl border border-amber-300/40 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 text-amber-50 shadow-[0_14px_35px_rgba(20,8,40,0.55)] backdrop-blur-md transition-all group-[.toaster]:dark:border-amber-300/40 group-[.toaster]:dark:from-slate-950 group-[.toaster]:dark:via-violet-950 group-[.toaster]:dark:to-slate-900 group-[.toaster]:dark:text-amber-50 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-white group-[.toaster]:via-amber-50 group-[.toaster]:to-orange-50 group-[.toaster]:text-slate-900 group-[.toaster]:border-amber-400/50 group-[.toaster]:shadow-[0_16px_40px_rgba(191,137,63,0.22)]",
          title: "font-semibold tracking-wide",
          description: "group-[.toast]:text-amber-100/90 group-[.toaster]:text-slate-700",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-amber-400 group-[.toast]:to-yellow-500 group-[.toast]:text-slate-900 group-[.toast]:font-semibold group-[.toast]:border group-[.toast]:border-amber-300/70",
          cancelButton:
            "group-[.toast]:bg-white/15 group-[.toast]:text-amber-100 group-[.toast]:border group-[.toast]:border-amber-200/40 group-[.toaster]:bg-slate-100 group-[.toaster]:text-slate-700",
          closeButton:
            "group-[.toast]:text-amber-200/80 group-[.toast]:hover:text-amber-50 group-[.toaster]:text-slate-500 group-[.toaster]:hover:text-slate-700",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
