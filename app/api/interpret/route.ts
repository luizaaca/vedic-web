import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { question, chartData } = await request.json()
    console.info("Recebido para interpretação:", { question, chartData })
    // Chamar a API real para interpretação
    //const externalApiUrl = "https://vedic-app-197322431493.europe-west1.run.app/api/explain"
    const externalApiUrl = "http://localhost:8080/api/explain"
    const apiResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, chartData }),
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

    const responseData = await apiResponse.json()

    // Assumindo que a API externa retorna um objeto com a chave "interpretation"
    const interpretation = responseData.interpretation
    if (typeof interpretation !== "string") {
      console.error("Resposta da API externa não continha uma 'interpretation' válida:", responseData)
      throw new Error("A resposta da API externa não forneceu uma interpretação no formato esperado.")
    }

    return NextResponse.json({ interpretation })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao interpretar pergunta" }, { status: 500 })
  }
}
