import "./Sidebar.css"
import { useContext, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";

function Sidebar({ sidebarWidth, onResize }) {
    const {
        allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply,
        setCurrThreadId, setPrevChats, threadError, setThreadError,
        isBusy, setIsBusy
    } = useContext(MyContext);
    const [loadingThreadId, setLoadingThreadId] = useState(null);
    const [deletingThreadId, setDeletingThreadId] = useState(null);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setThreadError("");
    };

    const openThread = async (threadId) => {
        if (threadId === currThreadId || loadingThreadId || isBusy) return;
        setIsBusy(true);
        setLoadingThreadId(threadId);
        setThreadError("");

        try {
            const response = await fetch(`http://localhost:8080/api/thread/${encodeURIComponent(threadId)}`);
            if (!response.ok) {
                throw new Error("Could not load this conversation.");
            }

            const messages = await response.json();
            setCurrThreadId(threadId);
            setPrevChats(messages);
            setReply(null);
            setPrompt("");
            setNewChat(false);
        } catch (error) {
            setThreadError(error.message);
        } finally {
            setLoadingThreadId(null);
            setIsBusy(false);
        }
    };

    const deleteThread = async (event, threadId) => {
        event.stopPropagation();
        if (deletingThreadId || isBusy) return;
        setIsBusy(true);
        setDeletingThreadId(threadId);
        setThreadError("");

        try {
            const response = await fetch(`http://localhost:8080/api/thread/${encodeURIComponent(threadId)}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Could not delete this conversation.");
            }

            setAllThreads((threads) => threads.filter((thread) => thread.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (error) {
            setThreadError(error.message);
        } finally {
            setDeletingThreadId(null);
            setIsBusy(false);
        }
    };

    return(
        <section className="sidebar">
            <button className="new-chat-button" type="button" onClick={createNewChat} disabled={isBusy}>
                <span className="new-chat-brand">
                    <span className="logo" aria-hidden="true">Ω</span>
                    <span>New chat</span>
                </span>
                <i className="fa-regular fa-pen-to-square" aria-hidden="true"></i>
            </button>

            <div className="history-container">
                <h2 className="history-heading">Your chats</h2>
                {threadError && <p className="thread-error" role="alert">{threadError}</p>}
                <ul className="history">
                    {allThreads.map((thread) => (
                        <li
                            className={thread.threadId === currThreadId ? "history-item active" : "history-item"}
                            key={thread.threadId}
                        >
                            <button
                                className="thread-open"
                                type="button"
                                onClick={() => openThread(thread.threadId)}
                                disabled={isBusy || loadingThreadId !== null || deletingThreadId !== null}
                                title={thread.title}
                            >
                                <span>{loadingThreadId === thread.threadId ? "Loading..." : thread.title}</span>
                            </button>
                            <button
                                className="thread-delete"
                                type="button"
                                aria-label={`Delete ${thread.title}`}
                                title="Delete chat"
                                onClick={(event) => deleteThread(event, thread.threadId)}
                                disabled={isBusy || deletingThreadId !== null}
                            >
                                <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="sign">
                <p>By RohitSalunke &hearts;</p>
            </div>
            <div
                className="sidebar-resizer"
                role="separator"
                aria-label="Resize sidebar"
                aria-orientation="vertical"
                aria-valuemin={Math.min(200, sidebarWidth)}
                aria-valuemax={Math.min(480, window.innerWidth * 0.42, window.innerWidth - 320)}
                aria-valuenow={sidebarWidth}
                tabIndex={0}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    onResize(event.clientX);
                }}
                onPointerMove={(event) => {
                    if (event.buttons === 1) onResize(event.clientX);
                }}
                onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        onResize(sidebarWidth - 16);
                    } else if (event.key === "ArrowRight") {
                        event.preventDefault();
                        onResize(sidebarWidth + 16);
                    }
                }}
            />
        </section>
    )
}


export default Sidebar;
