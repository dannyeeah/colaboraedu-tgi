
"use client";

import { useEffect, useRef, useState } from "react";

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

  // Rolagem automática quando as mensagens mudam
  useEffect(() => {
    if (aberto) {
      finalChatRef.current?.scrollIntoView({
        behavior: carregando ? "instant" : "smooth",
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
    <div className="fixed bottom-5 right-5 z-50">
      {aberto && (
        <div className="mb-3 flex h-[450px] w-[350px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Cabeçalho do chat */}
          <div className="flex items-center justify-between bg-blue-700 p-4 text-white">
            <div>
              <h2 className="font-bold">
                🤖 Tutor Virtual
              </h2>

              <p className="text-xs">
                {tituloAula ? `Aula: ${tituloAula}` : "Tutor do curso"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={limparConversa}
                disabled={carregando}
                title="Limpar conversa"
                aria-label="Limpar conversa"
                className="rounded px-2 py-1 hover:bg-blue-600 disabled:opacity-50"
              >
                🗑️
              </button>

              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar chat"
                className="rounded px-2 py-1 hover:bg-blue-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="rounded-xl bg-gray-100 p-3 text-sm text-gray-800">
              Olá! 👋 Sou o Tutor Virtual do ColaboraEdu.
              {tituloAula
  ? `Como posso ajudar com a aula de ${tituloAula}?`
  : "Como posso ajudar com este curso?"}
            </div>

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
                  className={`max-w-[85%] whitespace-pre-wrap rounded-xl p-3 text-sm ${
                    mensagem.autor === "aluno"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {mensagem.texto ||
                    (carregando
                      ? "Pensando..."
                      : "Sem resposta.")}
                </div>
              </div>
            ))}

            <div ref={finalChatRef} />
          </div>

          {/* Campo de pergunta */}
          <form
            className="flex gap-2 border-t border-gray-200 p-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              enviarPergunta();
            }}
          >
            <input
              type="text"
              value={pergunta}
              onChange={(evento) =>
                setPergunta(evento.target.value)
              }
              placeholder="Digite sua dúvida..."
              aria-label="Pergunta para o tutor"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 p-2 text-sm text-gray-900"
            />

            <button
              type="submit"
              disabled={carregando || !pergunta.trim()}
              className="rounded-lg bg-blue-600 px-3 text-white disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* Botão flutuante */}
      <div className="flex justify-end">
        <button
          onClick={() => setAberto(!aberto)}
          className="rounded-full bg-blue-700 px-5 py-4 font-semibold text-white shadow-lg hover:bg-blue-800"
        >
          {aberto ? "Fechar ✕" : "💬 Tutor IA"}
        </button>
      </div>
    </div>
  );
}
