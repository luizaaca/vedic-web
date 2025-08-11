import { type NextRequest, NextResponse } from 'next/server';
import { ChartResultData } from '@/app/api/calculate/types';

export async function POST(request: NextRequest) {
  try {
    const incomingData = await request.json();

    // Mapear os dados recebidos do frontend para o formato esperado pela API /api/vedic
    // Frontend envia: { fullName, birthDate, birthTime, timezone, latitude, longitude }
    // API /api/vedic espera: { year, month, day, hour, timezone, lat, lon }

    if (
      !incomingData.birthDate ||
      !incomingData.birthTime ||
      typeof incomingData.latitude !== 'number' ||
      typeof incomingData.longitude !== 'number' ||
      typeof incomingData.timezone !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Dados de entrada inválidos ou ausentes.' },
        { status: 400 }
      );
    }

    const [yearStr, monthStr, dayStr] = incomingData.birthDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // API externa espera mês como número (1-12)
    const day = parseInt(dayStr, 10);

    const [hourStr, minuteStr] = incomingData.birthTime.split(':');
    const hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    const decimalHour = hours + minutes / 60;

    const payloadForVedicApi = {
      year: year,
      month: month,
      day: day,
      hour: decimalHour, // Ex: 4.55 para 4h33min
      timezone: incomingData.timezone,
      lat: incomingData.latitude,
      lon: incomingData.longitude,
    };

    // Validar se os dados parseados são números válidos
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(decimalHour)) {
      return NextResponse.json(
        { error: 'Formato de data ou hora inválido.' },
        { status: 400 }
      );
    }

    // Chamar a API real para cálculo do mapa astral védico
    console.log('Enviando para API /vedic:', payloadForVedicApi);
    const externalApiUrl = "https://vedic-app-197322431493.europe-west1.run.app/api/vedic"
    //const externalApiUrl = 'http://localhost:8080/api/vedic'; // Use localhost for local testing
    const apiResponse = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForVedicApi), // Envia o payload construído
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error(
        `Erro na chamada à API externa de cálculo: ${apiResponse.status} ${apiResponse.statusText}`,
        errorBody
      );
      throw new Error(
        `Falha ao calcular mapa astral na API externa. Status: ${apiResponse.status}. Detalhes: ${errorBody}`
      );
    }

    const chartData : ChartResultData = await apiResponse.json();

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Erro em /api/calculate:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Erro interno ao calcular mapa astral' },
      { status: 500 }
    );
  }
}
