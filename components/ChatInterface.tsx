'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  ArrowDownCircle,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from 'lucide-react';

export interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: string;
  isChatLoading: boolean;
  onQuestionChange: (value: string) => void;
  onSendQuestion: () => void;
}

export function ChatInterface({
  messages,
  currentQuestion,
  isChatLoading,
  onQuestionChange,
  onSendQuestion,
}: ChatInterfaceProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatCardRef = useRef<HTMLDivElement>(null);
  const [canScrollToEnd, setCanScrollToEnd] = useState(false);
  const [scrollButtonOpacity, setScrollButtonOpacity] = useState(0.5);

  useEffect(() => {
    if (chatCardRef.current) {
      chatCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [messages, isChatLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.querySelector<HTMLElement>(
        '[data-radix-scroll-area-viewport]'
      );
      if (el) {
        const handleScroll = () => {
          const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;
          const atBottom = distanceFromBottom < 10;
          setCanScrollToEnd(!atBottom);

          const FADE_DISTANCE = 150;
          let newOpacity = 1.0;

          if (atBottom) {
            newOpacity = 0.5;
          } else if (distanceFromBottom < FADE_DISTANCE) {
            const fraction = Math.max(
              0,
              (distanceFromBottom - 10) / (FADE_DISTANCE - 10)
            );
            newOpacity = 0.5 + fraction * 0.5;
          }
          setScrollButtonOpacity(newOpacity);
        };
        handleScroll();
        el.addEventListener('scroll', handleScroll);
        clearInterval(interval);
        return () => el.removeEventListener('scroll', handleScroll);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [messages, isChatLoading]);

  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-indigo-600" />
          Interpretação Personalizada
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="relative h-full">
          <ScrollArea className="absolute h-full w-full p-0">
            <div className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {index === messages.length - 1 && <div ref={chatCardRef} />}
                  {message.type === 'ai' && (
                    <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full">
                      <img src="/guru.png" alt="Guru" className="w-10 h-10 rounded-full " />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900 whitespace-pre-wrap'}`}
                  >
                    <div className="prose prose-sm leading-tight">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <p
                      className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                      <User className="w-5 h-5 text-gray-600" />
                    </span>
                  )}
                </div>
              ))}
              {isChatLoading && messages.length >= 0 && (
                <div className="flex items-start gap-3 justify-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ">
                    <img src="/guru.png" alt="Guru" className="w-10 h-10 rounded-full " />
                  </span>
                  <div className="bg-gray-100 text-gray-900 rounded-lg p-3 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando...</span>
                  </div>
                </div>
              )}
            </div>
            <ScrollBar />
            <div ref={chatEndRef} />
            <div className="absolute bottom-6 right-6 z-20">
              <Button
                variant="secondary"
                className="h-[40px] w-[40px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0 text-white shadow-lg transition-opacity hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 4px 24px 0 rgba(80, 0, 200, 0.15)',
                  opacity: scrollButtonOpacity,
                }}
                onClick={() =>
                  chatEndRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
                aria-label="Rolar para o fim do chat"
                disabled={!canScrollToEnd}
              >
                <ArrowDownCircle
                  className={`h-8 w-8 ${canScrollToEnd ? 'animate-bounce' : ''}`}
                />
              </Button>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t p-4">
        <div className="flex items-center gap-2 w-full">
          <Textarea
            placeholder="Faça outra pergunta sobre seu mapa..."
            value={currentQuestion}
            onChange={(e) => onQuestionChange(e.target.value)}
            className="flex-1 resize-none overflow-y-auto"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendQuestion();
              }
            }}
          />
          <Button
            onClick={onSendQuestion}
            disabled={!currentQuestion.trim() || isChatLoading}
            size="icon"
            className="h-20 flex-shrink-0"
          >
            {isChatLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="sr-only">Enviar Pergunta</span>
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center pt-2 w-full">
          Você pode perguntar sobre planetas, casas, aspectos ou qualquer
          elemento do seu mapa.
        </p>
      </CardFooter>
    </Card>
  );
}
