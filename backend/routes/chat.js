
import express from "express";
import Thread from "../models/Thread.js";
import getGroqAPIResponse from "../utils/groq.js";

const router = express.Router();

// test

router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "testing new thread"
        });

        const responce = await thread.save();
        res.send(responce);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to save in db" });
    }
});

// get all threads 
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        // desending threads of updatedAT ..most recent data on top
        res.json(threads);
    }
    catch (err) {
        console.log(err);
        res.status(500).json("failed to fatch thread");
    }
});

// info of particular thread based on thred id 
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json("thread is not found");
        }
        res.json(thread.messages);
    }
    catch (err) {
        console.log(err);
        res.status(500).json("failed to fatch chat");
    }
});

// delete a thread based on the thread id
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });
        if (!deletedThread) {
            return res.status(404).json("thread could not found");
        }
        res.status(200).json("thread deleted succesfully ");
    }
    catch (err) {
        console.log(err);
        res.status(500).json("failed to delete the thread");
    }
});

router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
        return res.status(400).json("missing requred fields");
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            // create a new thread in database 
            thread = new Thread({
                threadId,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistentReply = await getGroqAPIResponse(
            thread.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        );

        thread.messages.push({ role: "assistant", content: assistentReply });
        thread.updatedAt = new Date();
        await thread.save();

        res.json({ reply: assistentReply });

    } catch (err) {
        console.log(err);
        res.status(500).json("something went wrong");
    }
});

export default router;
