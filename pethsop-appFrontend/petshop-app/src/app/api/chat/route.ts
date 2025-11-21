import { NextRequest, NextResponse } from "next/server";
import { pipeline } from "@xenova/transformers";

// Model çıktısı tipi
type XenovaTextOutput = { generated_text: string };

// Sampling parametreleri tipi
type GenerationOptions = {
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
};

// generator tipi açıkça belirtiliyor
let generator: ((input: string, options?: GenerationOptions) => Promise<XenovaTextOutput[]>) | null = null;

// Modeli cache’li yükleme
async function getGenerator() {
  if (!generator) {
    const gen = await pipeline(
  "text-generation",
  "C:/Users/USER/Desktop/Batu Petshop/pethsop-appFrontend/petshop-app/gpt-j-6B"
);
    generator = gen as (input: string, options?: GenerationOptions) => Promise<XenovaTextOutput[]>;
  }
  return generator;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt is empty" }, { status: 400 });
    }

    const gen = await getGenerator();

    // Örnek ürün verisi
    const products = [
      { name: "Siyah Deri Ceket", price: 1200, category: "Erkek Giyim", description: "Slim fit, kaliteli deri" },
      { name: "Kırmızı Elbise", price: 950, category: "Kadın Giyim", description: "Zarif davet elbisesi" },
      { name: "Siyah Spor Ayakkabı", price: 650, category: "Ayakkabı", description: "Rahat ve modern tasarım" },
    ];

    // AI prompt
    const aiPrompt = `
Sen bir e-ticaret satış danışmanısın.
Ürün verilerini kullanarak kullanıcıya uygun öneriler yap ve açıklama ver.
Ürünler: ${JSON.stringify(products)}
User: ${prompt}
Bot:
`;

    const output = await gen(aiPrompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      top_p: 0.9,
    });

    // Tekrar ve User/Bot patternlerini temizleme
    let botReply = output[0]?.generated_text || "";
    botReply = botReply.split("Bot:").pop() || "";
    botReply = botReply.split("User:")[0] || "";
    botReply = botReply
      .replace(/(\bUser:.*?)+$/g, "")
      .replace(/(\bBot:.*?)+$/g, "")
      .replace(/(User|Bot):/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return NextResponse.json({ text: botReply || "..." });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
