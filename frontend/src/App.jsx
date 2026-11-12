import './App.css'
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx"
import { MyContext } from './MyContext.jsx'; 
import { useCallback, useEffect, useState } from 'react';
import { v1 as uuidv1 } from "uuid";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 280;

function getMaxSidebarWidth() {
  if (window.innerWidth <= 640) {
    return DEFAULT_SIDEBAR_WIDTH;
  }
  return Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth * 0.42, window.innerWidth - 320);
}

function getSavedSidebarWidth() {
  const savedWidth = Number(window.localStorage.getItem("omega-sidebar-width"));
  const maxWidth = getMaxSidebarWidth();
  const minWidth = Math.min(MIN_SIDEBAR_WIDTH, maxWidth);
  const requestedWidth = Number.isFinite(savedWidth) && savedWidth > 0
    ? savedWidth
    : DEFAULT_SIDEBAR_WIDTH;
  return Math.max(minWidth, Math.min(requestedWidth, maxWidth));
}

async function fetchThreads() {
  const response = await fetch("http://localhost:8080/api/thread");
  if (!response.ok) {
    throw new Error("Could not load chat history.");
  }

  const threads = await response.json();
  return threads.map(({ threadId, title }) => ({ threadId, title }));
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [threadError, setThreadError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(getSavedSidebarWidth);
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("omega-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  const refreshThreads = useCallback(async () => {
    try {
      setAllThreads(await fetchThreads());
      setThreadError("");
    } catch (error) {
      setThreadError(error.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchThreads().then((threads) => {
      if (active) {
        setAllThreads(threads);
        setThreadError("");
      }
    }).catch((error) => {
      if (active) {
        setThreadError(error.message);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("omega-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("omega-sidebar-width", String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = getMaxSidebarWidth();
      const minWidth = Math.min(MIN_SIDEBAR_WIDTH, maxWidth);
      setSidebarWidth((width) => Math.max(minWidth, Math.min(width, maxWidth)));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const resizeSidebar = (width) => {
    const maxWidth = getMaxSidebarWidth();
    const minWidth = Math.min(MIN_SIDEBAR_WIDTH, maxWidth);
    setSidebarWidth(Math.max(minWidth, Math.min(width, maxWidth)));
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    refreshThreads,
    threadError, setThreadError,
    isBusy, setIsBusy,
    theme, setTheme
  };

  return (
    <div className="app" data-theme={theme} style={{ "--sidebar-width": `${sidebarWidth}px` }}>
      <MyContext.Provider value={providerValues}>
        <Sidebar sidebarWidth={sidebarWidth} onResize={resizeSidebar} />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App
