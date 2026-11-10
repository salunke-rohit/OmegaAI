import "dotenv/config";

const getGroqAPIResponse = async (messages) => {

    const options = {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: messages
        })
    };

    try {

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            options
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Groq API failed"
            );
        }

        return data.choices[0].message.content; // reply 

    } catch (err) {

        console.log("Groq Error:", err.message);
        throw err;

    }
};

export default getGroqAPIResponse;