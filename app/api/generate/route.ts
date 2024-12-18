
//TODO: to fine tune or use other model 
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(
    `${process.env.GEMINI_API_KEY}`
)

console.log("genAI", genAI)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"})


// const result = await model.generateContent(prompt);

const generateText = async (prompt: string): Promise<string> => {

    const result = await model.generateContent(prompt)
    console.log(result.response.text())
    return result.response.text()
}



export const POST = async (req: Request): Promise<Response> => {
    try {
        const body = await req.json();
        const { prompt} = body;

        if (!prompt) {
            return new Response("Prompt is required", { status: 400 })
        }
        const responseText = await generateText(prompt);


        return new Response(
            JSON.stringify({ prompt, response: responseText }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        )
    } catch (err) {
        console.log(err)
        return new Response(
            JSON.stringify({ error: "internal server error", message: err }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        )
    }
}