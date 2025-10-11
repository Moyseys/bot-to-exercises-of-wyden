import dotenv from "dotenv";
import { Question } from "./types";
import { Api } from "./Api";
import { sendToOllama } from "./ollamaClient";
dotenv.config();

function scrapper(questions: Question[]): string {
  let formated = "";

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    formated += `${i + 1} > ${question.description}\n`;
    const as = ["A", "B", "C", "D", "E"];

    for (let j = 0; j < question.alternatives.length; j++) {
      formated += `${as[j]} > ${question.alternatives[j].description}\n`;
    }
    formated += `\n`;
  }

  return formated;
}

async function main(): Promise<void> {
  const api = new Api();
  const theme = process.env.PRACTICES_THEME;
  if (!theme) {
    console.log("❌ Erro: PRACTICES_THEME não está definido no .env");
    process.exit(1);
  }

  console.log("🚀 Iniciando prática...");

  // Iniciar practice
  const practiceResponse = await api.practices(theme);
  const practiceData: any = await practiceResponse.json();
  const practiceId: string = practiceData.data.id;

  console.log(`✅ Prática iniciada com ID: ${practiceId}`);

  // Pegar questões
  console.log("📚 Buscando questões...");
  const practiceDetails = await api.getPractice(practiceId);
  const questions = practiceDetails.data.questions;

  console.log(`✅ ${questions.length} questões encontradas`);

  // Descobrir respostas
  console.log("🤖 Descobrindo respostas com Ollama...");
  const formattedQuestions = scrapper(questions);

  const prompt = `Você DEVE responder APENAS no formato especificado, sem explicações adicionais.

Para cada questão abaixo, responda SOMENTE com o número da questão seguido de dois pontos e a letra da alternativa correta.
Formato OBRIGATÓRIO: 1:A 2:B 3:C 4:D 5:E (cada resposta separada por espaço)

NÃO adicione explicações, NÃO use frases completas, APENAS o formato "número:letra".

Questões:
${formattedQuestions}

Resposta (apenas no formato número:letra):`;

  const ollamaResponse = await sendToOllama(prompt);

  if (!ollamaResponse) {
    throw new Error("Não foi possível obter respostas do Ollama");
  }

  console.log("🤖 Resposta do Ollama:", ollamaResponse);

  // Aceita "1:A", "1: A", "1.A", "1. A" (com dois pontos ou ponto, com ou sem espaço)
  let answers: string[] | null = ollamaResponse.match(/(\d+)[:.]\s*([A-E])/g);

  if (!answers || answers.length === 0) {
    console.error("❌ Formato da resposta do Ollama não reconhecido.");
    console.error("Por favor, tente novamente ou ajuste o modelo.");
    throw new Error("Não foi possível parsear as respostas do Ollama");
  }

  // Marcar respostas
  console.log("✍️  Marcando respostas...");
  const letterToIndex: { [key: string]: number } = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
  };

  for (const answer of answers) {
    const [questionNum, letter] = answer.replace(/\s+/g, "").split(/[:.]/);
    const questionIndex = parseInt(questionNum) - 1;

    if (questionIndex >= 0 && questionIndex < questions.length) {
      const question = questions[questionIndex];
      const alternativeIndex = letterToIndex[letter];

      if (
        alternativeIndex !== undefined &&
        question.alternatives[alternativeIndex]
      ) {
        const alternativeId = question.alternatives[alternativeIndex].id;

        await api.selectAlternative(practiceId, question.id, alternativeId);
        console.log(
          `  ✓ Questão ${questionNum}: Alternativa ${letter} marcada`
        );
      }
    }
  }

  console.log("✅ Todas as respostas foram marcadas!");

  // Finalizar prática
  console.log("🏁 Finalizando prática...");
  console.log("✅ Prática finalizada com sucesso!");
}

main().catch((err) => {
  console.error("❌ Erro no fluxo principal:", err);
  process.exit(1);
});
