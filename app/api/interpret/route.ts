import { type NextRequest, NextResponse } from "next/server"

interface Interpretation {
  interpretation: string
}

export async function POST(request: NextRequest) {
  try {
    interface RequestData {
      question: string;
      chartData: {
        latitude: number;
        longitude: number;
      };
      chatMessages: [{
        id: string;
        content: string;
        isUser: boolean;
      }];
      initial: boolean;
    }

    const { 
      question, 
      chartData, 
      chatMessages, 
      initial 
    }: RequestData = await request.json() as RequestData
    
    console.info("Recebido para interpretação:", { question, chartData, chatMessages, initial })
    // Chamar a API real para interpretação
    const externalApiUrl = process.env.INTERPRET_API_URL || "http://localhost:8080/api/explain"
    const apiResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, chartData, chatMessages, initial }),
    })

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text()
      console.error(
        `Erro na chamada à API externa: ${apiResponse.status} ${apiResponse.statusText}`,
        errorBody,
      )
      throw new Error(
        `Falha ao buscar interpretação da API externa. Status: ${apiResponse.status}. Detalhes: ${errorBody}`,
      )
    }

    const responseData = await apiResponse.json() as Interpretation;
    
    // Verificando se responseData possui a propriedade 'interpretation' e é uma string
    if (!responseData?.interpretation || typeof responseData.interpretation !== "string") {
      console.error("Resposta da API externa não continha uma 'interpretation' válida:", responseData);
      throw new Error("A resposta da API externa não forneceu uma interpretação no formato esperado.");
    }

    const interpretation: string = responseData.interpretation as string;

    return NextResponse.json({ interpretation })
  } catch (error) {
    console.log("Erro ao interpretar pergunta:", error)
    return NextResponse.json({ error: "Erro ao interpretar pergunta" }, { status: 500 })
  }
}
