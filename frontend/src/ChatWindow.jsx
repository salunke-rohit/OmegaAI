import "./ChatWindow.css"
import Chat from "./Chat.jsx"
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import {ScaleLoader} from "react-spinners"; 

function ChatWindow () {
    const { prompt , setPrompt, reply, setReply, currThreadId, setCurrThreadId, prevChats, setPrevChats} = useContext (MyContext);
    const [ loading, setLoading ] = useState(false); 
    const   getReply = async () =>{
        setLoading(true);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };
        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res)
            setReply(res.reply);

        }catch(err){
            console.log(err)
        }
        setLoading(false);
    }

    // append new chat to prev chat 

    useEffect (()=>{
        if( prompt && reply ){
            setPrevChats( prevChats =>{
                [...prevChats , {
                    role: "user",
                    content: prompt
                },
            {
                role: "assistent",
                content : "reply "
            }]
            });
        }
        setPrompt("");
    }, [reply])

    return (
        <div className="chatwindow">
            <div className="navbar">
                <span>OmegaAI &nbsp; <i className="fa-solid fa-chevron-down"></i> </span>
                <div className="usericondiv">
                    <span className="usericon"><i className="fa-solid fa-circle-user"></i></span>
                </div>
            </div>
            <Chat>
            </Chat>
            <ScaleLoader color="white" loading={loading}></ScaleLoader>
            <div className="chatinput">
                <div className="inputbox">
                    <input placeholder="Ask anything" 
                    value={prompt}
                    onChange ={(e)=>setPrompt(e.target.value)}
                    onKeyDown={(e)=>e.key==='Enter'?getReply():""}
                    >
                    
                    </input>
                    <div id="submit" onClick={getReply}> <i className="fa-regular fa-paper-plane"></i> </div>
                </div>
                <p className="info">OmegaAI can make misteks. cheack importent info.</p>
            </div>

        </div>
    )
}

export default ChatWindow;