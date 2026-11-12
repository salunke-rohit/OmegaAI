import "./Chat.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

function MarkdownMessage({ content }) {
    return (
        <div className="gptmessage">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function TypingReply({ reply }) {
    const [typing, setTyping] = useState({ source: null, content: "" });
    const displayedReply = typing.source === reply ? typing.content : "";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index += 1;
            setTyping({ source: reply, content: reply.slice(0, index) });
            if (index >= reply.length) {
                clearInterval(interval);
            }
        }, 10);
        return () => clearInterval(interval);
    }, [reply]);

    return <MarkdownMessage content={displayedReply} />;
}

function Chat() {
    const {newChat, prevChats, reply, currThreadId} = useContext(MyContext);
    const lastChat = prevChats[prevChats.length - 1];
    const isTypingLatestReply =
        reply !== null && lastChat?.role === "assistant" && lastChat.content === reply;
    const chatsToRender = isTypingLatestReply ? prevChats.slice(0, -1) : prevChats;

    return <>
        {newChat && <h1 className="welcome-message">Start a new chat!</h1>}
        <div className="chats">
            {chatsToRender.map((chat, idx) =>
                <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={`${chat.role}-${idx}`}>
                    {chat.role === "user"
                        ? <p className="usermessage">{chat.content}</p>
                        : <MarkdownMessage content={chat.content} />}
                </div>
            )}
            {isTypingLatestReply && (
                <div className="gptDiv" key={`${currThreadId}-typing`}>
                    <TypingReply reply={reply} />
                </div>
            )}
        </div>
    </>
}

export default Chat;