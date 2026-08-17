import React from "react";
import NotificationItem from "./NotificationItem";
import notifications from "../../data/notifications";

export default function NotificationDropdown() {
  return (
    <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl z-50">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
        <h3 className="text-lg font-bold text-white">
          🔔 Notifications
        </h3>

        <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs text-sky-400">
          {notifications.filter((n) => !n.read).length} New
        </span>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">

        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            notification={item}
          />
        ))}

      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 p-3 flex justify-between">

        <button className="text-sm text-sky-400 hover:text-sky-300">
          Mark All Read
        </button>

        <button className="text-sm text-sky-400 hover:text-sky-300">
          View All
        </button>

      </div>

    </div>
  );
}