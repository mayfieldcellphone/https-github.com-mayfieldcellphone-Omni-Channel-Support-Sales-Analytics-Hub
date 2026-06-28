import React, { useState, useEffect } from "react";
import { 
  Shield, 
  User, 
  Lock, 
  Clock, 
  Database, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter
} from "lucide-react";
import { SecurityLog, UserRole } from "../types";

interface SecurityConsoleProps {
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  userEmail: string;
}

export default function SecurityConsole({
  activeRole,
  onChangeRole,
  userEmail
}: SecurityConsoleProps) {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/logs", {
        method: "GET",
        headers: {
          "x-user-role": activeRole,
          "x-user-email": userEmail
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch logs. Unauthorized role permission.");
      }

      const data = await res.json();
      setLogs(data);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeRole]);

  const handleClearLogs = async () => {
    if (activeRole !== "Admin") {
      setErrorMsg("Permission Denied: Only Admins can clear or flush security audit archives.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/logs/clear", {
        method: "POST",
        headers: {
          "x-user-role": activeRole,
          "x-user-email": userEmail
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const data = await res.json();
      setLogs(data.logs);
      setSuccessMsg("Audit log archives flushed and initialized. Action recorded.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "WARNING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "INFO":
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.ip.includes(searchQuery);
    const matchesSev = filterSeverity === "all" || l.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="security-console-view">
      
      {/* Role Manager Explainer Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-md font-bold text-white font-sans flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-400 animate-pulse" /> Role-Based Access Control (RBAC) System
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
            Toggle your active session role below to test visual restriction flows. Only <strong>Admins</strong> have full operational permissions, including clearing audit trace histories. <strong>Managers</strong> can decrypt customer profiles but cannot clear traces. <strong>Agents</strong> are restricted from both secure decryption and security consoles.
          </p>

          <div className="flex gap-2 pt-1" id="role-swapper-btns">
            {(["Admin", "Manager", "Agent"] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  onChangeRole(role);
                  setDecryptedTextNull();
                }}
                className={`px-4 py-2 text-xs font-semibold font-sans rounded-xl border transition flex items-center gap-1.5 ${
                  activeRole === role
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <User size={12} /> {role} Session
              </button>
            ))}
          </div>
        </div>

        {/* Status indicator widget */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between h-full space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Security Status Matrix</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-ping"></span>
            <span className="text-xs font-bold text-slate-100 font-sans">Active Encryption: AES-256</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-normal font-sans">
            Authentication token: <span className="font-mono text-indigo-400 truncate block">sha256:cipher_{activeRole.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      {activeRole === "Agent" ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto" id="security-unauthorized-notice">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock size={20} className="animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-md font-bold text-white font-sans">Security Authorization Required</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Access to the system security ledger is locked for the <strong>Agent</strong> role. Please switch to the **Admin** or **Manager** session role using the RBAC controls above to unlock these tables.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          
          {/* Controls row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-1.5">
                <Database size={16} className="text-indigo-400" /> Operational Security Audit Ledger
              </h4>
              <p className="text-xs text-slate-400">Chronological trail of user authentication, decryptions, and configuration overrides.</p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={fetchLogs}
                className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition flex items-center gap-1 text-xs"
                title="Refresh Logs"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>

              <button
                onClick={handleClearLogs}
                disabled={activeRole !== "Admin"}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-sans text-xs font-semibold rounded-xl transition duration-150 flex items-center gap-1.5 shadow-sm"
                id="clear-logs-btn"
              >
                <Trash2 size={13} /> Flush Audit Logs
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Filter logs by operator, action, or client IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Error and Success Feedback alerts */}
          {errorMsg && (
            <div className="bg-red-950/25 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-300 flex gap-2 items-center">
              <ShieldAlert size={14} className="text-red-500 animate-pulse" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/25 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300 flex gap-2 items-center">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800" id="logs-ledger-table-container">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-normal">Timestamp</th>
                  <th className="py-3.5 px-4 font-normal">Operator</th>
                  <th className="py-3.5 px-4 font-normal">Session Role</th>
                  <th className="py-3.5 px-4 font-normal">Action Logged</th>
                  <th className="py-3.5 px-4 font-normal">Client IP</th>
                  <th className="py-3.5 px-4 font-normal text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/20 text-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                      No security audit matches found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium max-w-[120px] truncate" title={log.user}>
                        {log.user}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-400 font-semibold">
                        {log.role}
                      </td>
                      <td className="py-3.5 px-4 leading-relaxed max-w-[300px] truncate" title={log.action}>
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px]">
                        {log.ip}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Info size={11} className="text-indigo-400" /> SECURE AUDIT LEDGER LOCK COMPLETED AND DIGITALLY ENCODED.
          </div>

        </div>
      )}

    </div>
  );
}

// Global placeholder to sync decoupling
function setDecryptedTextNull() {
  // Silent utility hook
}
