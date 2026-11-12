import "./ChatWindow.css"
import Chat from "./Chat.jsx"
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import {ScaleLoader} from "react-spinners"; 

function ChatWindow () {
    const {
        prompt, setPrompt, setReply, currThreadId, setPrevChats,
        setNewChat, refreshThreads, theme, setTheme, isBusy, setIsBusy
    } = useContext(MyContext);
    const [requestError, setRequestError] = useState("");
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const sendMessage = async (event) => {
        event.preventDefault();
        const message = prompt.trim();
        if (!message || isBusy) return;

        setIsBusy(true);
        setRequestError("");
        setReply(null);
        setPrompt("");
        setNewChat(false);
        setPrevChats((chats) => [...chats, { role: "user", content: message }]);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, threadId: currThreadId })
            });
            if (!response.ok) {
                throw new Error("Could not get a response. Please try again.");
            }

            const res = await response.json();
            if (typeof res.reply !== "string") {
                throw new Error("The server returned an invalid response.");
            }

            setReply(res.reply);
            setPrevChats((chats) => [...chats, { role: "assistant", content: res.reply }]);
            refreshThreads();
        } catch (error) {
            setRequestError(error.message);
            setPrevChats((chats) => chats.slice(0, -1));
            setPrompt(message);
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="chatwindow">
            <div className="navbar">
                <span className="brand-name">OmegaAI</span>
                <div className="usericondiv">
                    <button
                        className="usericon"
                        type="button"
                        aria-label="Open profile options"
                        aria-expanded={profileMenuOpen}
                        onClick={() => setProfileMenuOpen((open) => !open)}
                    >
                        <i className="fa-solid fa-circle-user" aria-hidden="true"></i>
                    </button>
                    {profileMenuOpen && (
                        <div className="profile-menu">
                            <span className="profile-menu-title">Appearance</span>
                            <button
                                type="button"
                                className="theme-option"
                                onClick={() => {
                                    setTheme(theme === "dark" ? "light" : "dark");
                                    setProfileMenuOpen(false);
                                }}
                            >
                                <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} aria-hidden="true"></i>
                                Switch to {theme === "dark" ? "light" : "dark"} mode
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Chat />
            <div className="chatinput">
                {requestError && <p className="chat-error" role="alert">{requestError}</p>}
                <ScaleLoader color={theme === "dark" ? "#ececec" : "#333"} loading={isBusy} />
                <form className="inputbox" onSubmit={sendMessage}>
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        disabled={isBusy}
                        aria-label="Message"
                    />
                    <button id="submit" type="submit" disabled={isBusy || !prompt.trim()} aria-label="Send message">
                        <i className="fa-regular fa-paper-plane" aria-hidden="true"></i>
                    </button>
                </form>
                <p className="info">OmegaAI can make mistakes. Check important information.</p>
            </div>

        </div>
    )
}

export default ChatWindow;