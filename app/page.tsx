"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, Rows3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import dynamic from "next/dynamic";
import type { ChartResultData } from '@/app/api/calculate/types';
import { ChartResult } from "@/components/ChartResult";
import { BirthData, BirthDataForm } from "@/components/BirthDataForm";
import { ChatMessage, ChatInterface } from "@/components/ChatInterface";
import { timezones } from "@/lib/timezones";
const MapPicker = dynamic(
   () => import("@/components/MapPicker").then((mod) => mod.MapPicker),
   { ssr: false, loading: () => <p>Carregando mapa...</p> }
);

export default function VedicAstrologyApp() {
   const [birthData, setBirthData] = useState<BirthData>({
      fullName: "",
      birthDate: "", // Data de nascimento padrão
      birthTime: "", // Hora de nascimento padrão
      timezone: "",
      latitude: "",
      longitude: "",
   });

   const [chartResult, setChartResult] = useState<ChartResultData | null>(null);
   const [isChartSectionOpen, setIsChartSectionOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isMapOpen, setIsMapOpen] = useState(false);
   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
   const [currentQuestion, setCurrentQuestion] = useState("");
   const [isChatLoading, setIsChatLoading] = useState(false);
   const [isVerticalView, setIsVerticalView] = useState(false);
   const isMobile = useIsMobile();
   const resultsRef = useRef<HTMLDivElement>(null);

   const handleInputChange = (field: keyof BirthData, value: string) => {
      setBirthData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleLocationSelect = (coords: { lat: number; lng: number }) => {
      setBirthData((prev) => ({
         ...prev,
         latitude: coords.lat.toFixed(6), // 6 casas decimais para boa precisão
         longitude: coords.lng.toFixed(6),
      }));
   };

   useEffect(() => {
      // Preenche o fuso horário automaticamente se estiver vazio
      if (!birthData.timezone) {
         try {
            const offsetInMinutes = new Date().getTimezoneOffset();
            const offsetInHours = -(offsetInMinutes / 60);
            handleInputChange("timezone", offsetInHours.toString());
         } catch (error) {
            console.error(
               "Erro ao detectar fuso horário automaticamente:",
               error
            );
         }
      }
   }, []); // O array vazio garante que isso rode apenas uma vez, ao montar o componente

   const fetchInterpretation = async (
      question: string,
      chartData: any,
      chatMessages: ChatMessage[],
      initial = false
   ): Promise<string | null> => {
      try {
         if (chatMessages.length > 0) {
            chatMessages = chatMessages.map((msg) => ({
               ...msg,
               // Limpa o conteúdo de emojis, markdown, HTML e normaliza espaços
               content: msg.content
                  .replace(/<\/?[^>]+(>|$)/g, "") // 1. Remove tags HTML
                  .replace(/[#*_`~]/g, "") // 2. Remove caracteres de Markdown
                  .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '') // 3. Remove a maioria dos emojis
                  .replace(/\s+/g, ' ') // 4. Substitui quebras de linha e espaços múltiplos por um único espaço
                  .trim(), // 5. Remove espaços no início e no fim           
            }));
         }
         const response = await fetch("/api/interpret", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               question,
               chartData,
               chatMessages,
               initial,
            }),
         });

         if (response.ok) {
            const result = await response.json();
            return result.interpretation ?? null;
         } else {
            console.error("Erro na API de interpretação:", await response.text());
            return null;
         }
      } catch (error) {
         console.error("Erro na requisição de interpretação:", error);
         return null;
      }
   };

   const getInitialInterpretation = async (chartData: unknown) => {
      setIsChatLoading(true);
      try {
         const defaultQuestion =
            "Faça um resumo deste mapa astral. Sugira perguntas para o usuário continuar a conversa. Mas seja conversacional, pergunte se ele gostaria de saber mais.";
         const interpretation = await fetchInterpretation(
            defaultQuestion,
            chartData,
            chatMessages,
            true
         );
         const aiMessage: ChatMessage = {
            type: "ai",
            content:
               interpretation ?? "Não foi possível gerar a interpretação inicial.",
            timestamp: new Date(),
         };
         setChatMessages([aiMessage]);
      } finally {
         setIsChatLoading(false);
      }
   };

   const calculateChart = async () => {
      setIsLoading(true);
      try {
         const response = await fetch("/api/calculate", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               fullName: birthData.fullName || undefined,
               birthDate: birthData.birthDate,
               birthTime: birthData.birthTime,
               timezone: Number.parseFloat(birthData.timezone),
               latitude: Number.parseFloat(birthData.latitude),
               longitude: Number.parseFloat(birthData.longitude),
            }),
         });

         if (response.ok) {
            const result = await response.json();
            setChartResult(result);
            setIsChartSectionOpen(true);
            getInitialInterpretation(result);
         } else {
            console.error("Erro ao calcular mapa astral");
         }
      } catch (error) {
         console.error("Erro na requisição:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const sendQuestion = async () => {
      if (!currentQuestion.trim() || !chartResult) return;

      const userMessage: ChatMessage = {
         type: "user",
         content: currentQuestion,
         timestamp: new Date(),
      };

      const questionToAsk = currentQuestion;
      setChatMessages((prev) => [...prev, userMessage]);
      setCurrentQuestion("");
      setIsChatLoading(true);

      try {
         const interpretation = await fetchInterpretation(
            questionToAsk,
            chartResult,
            chatMessages
         );
         const aiMessage: ChatMessage = {
            type: "ai",
            content: interpretation || "Resposta não disponível",
            timestamp: new Date(),
         };
         setChatMessages((prev) => [...prev, aiMessage]);
      } finally {
         setIsChatLoading(false);
      }
   };

   const isFormValid : boolean =
      (birthData.birthDate &&
      birthData.birthTime &&
      birthData.timezone &&
      birthData.latitude &&
      birthData.longitude) !== "" ;

   const handleReset = () => {
      setBirthData({
         fullName: "",
         birthDate: "",
         birthTime: "",
         timezone: "",
         latitude: "",
         longitude: "",
      });
      setChartResult(null);
      setChatMessages([]);
      setCurrentQuestion("");
      setIsChartSectionOpen(false);
   };
//Temporario
   useEffect(() => {
      if (process.env.NODE_ENV === "development") {
         setBirthData({
            fullName: "",
            birthDate: "1985-11-16", // Data de nascimento padrão
            birthTime: "07:50", // Hora de nascimento padrão
            timezone: "-3",
            latitude: "-23.567102",
            longitude: "-46.626801",
         });
      }
   }, []);

   useEffect(() => {
      if (chartResult && resultsRef.current) {
         resultsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
         });
      }
   }, [chartResult]);

   return (
      <>
         <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
               <div className="text-center py-4 md:py-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                     Astrologia Védica
                  </h1>
                  <p className="text-gray-600">
                     Calcule seu mapa astral védico e obtenha interpretações
                     personalizadas
                  </p>
               </div>

               {/* Formulário de Dados de Nascimento */}
               <BirthDataForm
                  birthData={birthData}
                  timezones={timezones}
                  isFormValid={isFormValid}
                  isLoading={isLoading}
                  onInputChange={handleInputChange}
                  onCalculate={calculateChart}
                  onReset={handleReset}
                  onOpenMap={() => setIsMapOpen(true)}
               />

               {/* Seção de Resultados (Mapa e Chat) */}
               {chartResult && (
                  <Card ref={resultsRef} className="overflow-hidden">
                     <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gray-50/50">
                        <CardTitle className="text-lg font-semibold">
                           Seu Mapa Astral
                        </CardTitle>
                        {!isMobile && (
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsVerticalView(!isVerticalView)}
                           >
                              {isVerticalView ? (
                                 <LayoutGrid className="w-4 h-4 mr-2" />
                              ) : (
                                 <Rows3 className="w-4 h-4 mr-2" />
                              )}
                              Alterar Visualização
                           </Button>
                        )}
                     </CardHeader>
                     <CardContent className="p-4 md:p-6">
                        <div
                           className={`flex gap-8 ${
                              isVerticalView || isMobile ? "flex-col" : "flex-col lg:flex-row max-h-screen"
                           }`}
                        >
                           <div className={`w-full ${!(isVerticalView || isMobile) ? "lg:w-1/2" : ""}`}>
                              <ChartResult
                                 chartResult={chartResult}
                                 birthData={birthData}
                                 isOpen={isChartSectionOpen}
                                 onOpenChange={setIsChartSectionOpen}
                              />
                           </div>
                           <div className={`w-full ${!(isVerticalView || isMobile) ? "lg:w-1/2" : ""} ${isVerticalView || isMobile ? "h-[700px]" : ""}`}>
                              <ChatInterface
                                 messages={chatMessages}
                                 currentQuestion={currentQuestion}
                                 isChatLoading={isChatLoading}
                                 onQuestionChange={setCurrentQuestion}
                                 onSendQuestion={sendQuestion}
                              />
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               )}
            </div>
         </div>
         <MapPicker
            isOpen={isMapOpen}
            onOpenChange={setIsMapOpen}
            onLocationSelect={handleLocationSelect}
         />
      </>
   );
}
