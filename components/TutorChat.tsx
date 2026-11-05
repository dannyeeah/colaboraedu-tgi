
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  BookOpen,
  MessageCircle,
  Send,
  Trash2,
  X,
} from "lucide-react";

type Mensagem = {
  autor: "aluno" | "tutor";
  texto: string;
};

type TutorChatProps = {
  cursoId: string;
  aulaId?: string;
  tituloAula?: string;
};

export default function TutorChat({
  cursoId,
  aulaId,
  tituloAula,
}: TutorChatProps) {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  

  const [carregando, setCarregando] = useState(false);

  const finalChatRef = useRef<HTMLDivElement>(null);

  // Mantém a conversa rolada até a última mensagem
  useEffect(() => {
    if (aberto) {
      finalChatRef.current?.scrollIntoView({
        behavior: carregando ? "auto" : "smooth",
      });
    }
  }, [mensagens, aberto, carregando]);

  function limparConversa() {
    if (carregando) return;

    setMensagens([]);
    setPergunta("");
  }

  async function enviarPergunta() {
    const texto = pergunta.trim();

    
const historico = mensagens
  .filter((mensagem) => mensagem.texto.trim())
  .slice(-20)
  .map((mensagem) => ({
    role: mensagem.autor === "aluno"
      ? "user" as const
      : "assistant" as const,
    content: mensagem.texto,
  }))
  .filter((mensagem) => mensagem.content.length <= 4000);

    if (!texto || carregando) return;

    setPergunta("");
    setCarregando(true);

    setMensagens((anteriores) => [
      ...anteriores,
      { autor: "aluno", texto },
      { autor: "tutor", texto: "" },
    ]);

    try {
      const respostaAPI = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
      body: JSON.stringify({
        pergunta: texto,
        cursoId,
        ...(aulaId !== undefined ? { aulaId } : {}),
        historico,
      }),

      });

      if (!respostaAPI.ok) {
        throw new Error("Não foi possível consultar o tutor.");
      }

      if (!respostaAPI.body) {
        throw new Error("A resposta está vazia.");
      }

      const leitor = respostaAPI.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await leitor.read();

        if (done) break;

        const trecho = decoder.decode(value, {
          stream: true,
        });

        setMensagens((anteriores) =>
          anteriores.map((mensagem, indice) =>
            indice === anteriores.length - 1
              ? {
                  ...mensagem,
                  texto: mensagem.texto + trecho,
                }
              : mensagem
          )
        );
      }

      const restante = decoder.decode();

      if (restante) {
        setMensagens((anteriores) =>
          anteriores.map((mensagem, indice) =>
            indice === anteriores.length - 1
              ? {
                  ...mensagem,
                  texto: mensagem.texto + restante,
                }
              : mensagem
          )
        );
      }
    } catch {
      setMensagens((anteriores) =>
        anteriores.map((mensagem, indice) =>
          indice === anteriores.length - 1
            ? {
                ...mensagem,
                texto: "Não foi possível responder. Tente novamente.",
              }
            : mensagem
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Janela do Tutor */}
      {aberto && (
        <div className="mb-3 flex h-[520px] w-[430px] max-h-[calc(100dvh-110px)] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Bot size={23} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-card-foreground">
                  Tutor Virtual
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Assistente de estudos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={limparConversa}
                disabled={carregando}
                title="Limpar conversa"
                aria-label="Limpar conversa"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
              >
                <Trash2 size={18} />
              </button>

              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar chat"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Identificação da aula */}
          {tituloAula && (
            <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
              <BookOpen
                size={18}
                className="shrink-0 text-muted-foreground"
              />

              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">
                  Você está estudando
                </p>

                <p className="truncate text-sm font-medium text-foreground">
                  {tituloAula}
                </p>
              </div>
            </div>
          )}

          {/* Área de mensagens */}
          <div
            role="log"
            aria-label="Conversa com o Tutor Virtual"
            className="flex-1 space-y-4 overflow-y-auto bg-card p-4"
          >

            {/* Mensagem inicial */}
            {mensagens.length === 0 && (
              <div className="space-y-4 pt-3">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <Bot size={28} />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-card-foreground">
                    Olá! Como posso ajudar?
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Sou seu Tutor Virtual. Posso explicar
                    conceitos e tirar suas dúvidas sobre{" "}
                    {tituloAula
                      ? `a aula ${tituloAula}.`
                      : "o conteúdo do seu curso."}
                  </p>
                </div>
              </div>
            )}

            {/* Histórico de mensagens */}
            {mensagens.map((mensagem, indice) => (
              <div
                key={indice}
                className={`flex ${
                  mensagem.autor === "aluno"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[92%] break-words rounded-2xl px-4 py-3 text-[14px] leading-6 ${
                    mensagem.autor === "aluno"
                       ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  
{mensagem.autor === "tutor" && mensagem.texto ? (
  
<div className="space-y-3 font-[family-name:var(--font-geist-sans)] text-[15px] font-normal leading-7 tracking-normal [&_p]:my-3 [&_h1]:my-3 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-background [&_pre]:p-3 [&_pre]:text-foreground [&_code]:break-words [&_code]:font-mono [&_code]:text-xs [&_strong]:font-bold [&_a]:underline [&_table]:block [&_table]:overflow-x-auto">

      <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    a: ({ children }) => <span className="underline">{children}</span>,
  }}
>
  {mensagem.texto}
</ReactMarkdown>
  </div>
) : (
  mensagem.texto ||
  (carregando ? (
    <span className="animate-pulse">
      Pensando...
    </span>
  ) : (
    "Sem resposta."
  ))
)}

                </div>
              </div>
            ))}

            <div ref={finalChatRef} />
          </div>

          {/* Campo para enviar perguntas */}
          <form
            className="border-t border-border bg-card p-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              void enviarPergunta();
            }}
          >
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background p-1.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
              <input
                type="text"
                value={pergunta}
                onChange={(evento) =>
                  setPergunta(evento.target.value)
                }
                placeholder="Digite sua dúvida..."
                aria-label="Pergunta para o tutor"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={carregando || !pergunta.trim()}
                aria-label="Enviar pergunta"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              ColaboraEdu • Inteligência Artificial
            </p>
          </form>
        </div>
      )}

      {/* Botão flutuante */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          aria-label={
            aberto
              ? "Fechar Tutor Virtual"
              : "Abrir Tutor Virtual"
          }
          aria-expanded={aberto}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-4 font-medium text-primary-foreground shadow-xl transition hover:opacity-90 hover:shadow-2xl"
        >
          {aberto ? (
            <>
              <X size={19} />
              Fechar
            </>
          ) : (
            <>
              <MessageCircle size={20} />
              Tutor IA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
