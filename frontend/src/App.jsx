import './App.css'
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx"
import { MyContext } from './MyContext.jsx'; 
import { useCallback, useEffect, useState } from 'react';
import { v1 as uuidv1 } from "uuid";

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
    <div className="app" data-theme={theme}>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App
