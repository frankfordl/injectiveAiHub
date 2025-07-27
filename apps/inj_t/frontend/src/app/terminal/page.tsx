"use client";

import { TerminalPage } from "@/components/cotrain/pages/terminal-page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Notification } from "@/types/cotrain";

export default function Terminal() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contributors, setContributors] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandOutput, setCommandOutput] = useState<any[]>([]);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("terminal");
  const [currentTime, setCurrentTime] = useState("");

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    console.log("Notification:", notification);
    // Handle notification logic here
  };

  const availableCommands = {
    help: "Show available commands",
    status: "Show current training status",
    connect: "Connect to training network",
    disconnect: "Disconnect from network",
    start: "Start training session",
    stop: "Stop current training",
    logs: "Show recent logs",
    clear: "Clear terminal output",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "training":
        return "text-blue-500";
      case "offline":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const timestamp = new Date().toLocaleTimeString();
    
    // Add command to history
    setCommandHistory(prev => [...prev, cmd]);
    
    // Add command to output
    setCommandOutput(prev => [
      ...prev,
      { type: "command", content: `$ ${cmd}`, timestamp }
    ]);

    // Execute command
    switch (trimmedCmd) {
      case "help":
        setCommandOutput(prev => [
          ...prev,
          { 
            type: "output", 
            content: Object.entries(availableCommands)
              .map(([cmd, desc]) => `${cmd.padEnd(12)} - ${desc}`)
              .join("\n"),
            timestamp 
          }
        ]);
        break;
      case "status":
        setCommandOutput(prev => [
          ...prev,
          { 
            type: "output", 
            content: `Status: ${isTraining ? "Training" : "Idle"}\nProgress: ${progress}%\nContributors: ${contributors.length}`,
            timestamp 
          }
        ]);
        break;
      case "connect":
        setIsConnecting(true);
        setTimeout(() => {
          setIsConnecting(false);
          setCommandOutput(prev => [
            ...prev,
            { type: "success", content: "Connected to training network", timestamp }
          ]);
        }, 2000);
        break;
      case "clear":
        setCommandOutput([]);
        break;
      default:
        setCommandOutput(prev => [
          ...prev,
          { type: "error", content: `Command not found: ${cmd}. Type 'help' for available commands.`, timestamp }
        ]);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand);
      setCurrentCommand("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock initial data
  useEffect(() => {
    setContributors([
      { id: "1", name: "Node-001", status: "online", contribution: 85 },
      { id: "2", name: "Node-002", status: "training", contribution: 92 },
      { id: "3", name: "Node-003", status: "offline", contribution: 0 },
    ]);

    setLogs([
      { timestamp: "10:30:15", level: "info", message: "Training session started" },
      { timestamp: "10:30:20", level: "info", message: "Connected to 3 nodes" },
      { timestamp: "10:30:25", level: "warning", message: "Node-003 disconnected" },
    ]);
  }, []);

  return (
    <TerminalPage
      onNavigate={handleNavigate}
      isConnecting={isConnecting}
      setIsConnecting={setIsConnecting}
      isTraining={isTraining}
      setIsTraining={setIsTraining}
      progress={progress}
      setProgress={setProgress}
      contributors={contributors}
      setContributors={setContributors}
      logs={logs}
      setLogs={setLogs}
      currentTime={currentTime}
      commandHistory={commandHistory}
      setCommandHistory={setCommandHistory}
      historyIndex={historyIndex}
      setHistoryIndex={setHistoryIndex}
      currentCommand={currentCommand}
      setCurrentCommand={setCurrentCommand}
      addNotification={addNotification}
      commandOutput={commandOutput}
      setCommandOutput={setCommandOutput}
      showContributeModal={showContributeModal}
      setShowContributeModal={setShowContributeModal}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      availableCommands={availableCommands}
      getStatusColor={getStatusColor}
      executeCommand={executeCommand}
      handleCommandSubmit={handleCommandSubmit}
      handleKeyDown={handleKeyDown}
    />
  );
}