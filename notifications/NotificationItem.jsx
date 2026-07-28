import React from "react";
import { AlertTriangle, ShieldAlert, UserPlus, FileText } from "lucide-react";

const iconMap = {
  critical: AlertTriangle,
  warning: ShieldAlert,
  success: UserPlus,
  info: FileText,
};

const colorMap = {
  critical: "text-red-400 bg-red-500/10",
  warning: "text-yellow-400 bg-yellow-500/10",
  success: "text-emerald-400 bg-emerald-500/10",
  info: "text-sky-400 bg-sky-500/10",
};

export default function NotificationItem({ notification }) {
  const Icon = iconMap[notification.type] || FileText;

  return (
    <div className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-800/50 transition cursor-pointer">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          colorMap[notification.type]
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-white">
          {notification.title}
        </h4>

        <p className="text-xs text-slate-400 mt-1">
          {notification.message}
        </p>

        <span className="text-[11px] text-slate-500 mt-2 block">
          {notification.time}
        </span>
      </div>

      {!notification.read && (
        <div className="mt-2 h-2 w-2 rounded-full bg-sky-400"></div>
      )}
    </div>
  );
}