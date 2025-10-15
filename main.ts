import dotenv from "dotenv";
import { Question } from "./types.js";
import { ExerciseApi } from "./ExerciseApi.js";
import { sendToOllama } from "./ollamaClient.js";
import { Exercise } from "./Exercise.js";
dotenv.config();

interface QuestionWithIds {
    questionId: string;
    description: string;
    alternatives: Array<{
        id: string;
        letter: string;
        description: string;
    }>;
}

interface OllamaAnswer {
    questionId: string;
    alternativeId: string;
}

function prepareQuestionsForOllama(questions: Question[]): QuestionWithIds[] {
    const letters = ["A", "B", "C", "D", "E"];

    return questions.map((question) => ({
        questionId: question.id,
        description: question.description,
        alternatives: question.alternatives.map((alt, index) => ({
            id: alt.id,
            letter: letters[index],
            description: alt.description,
        })),
    }));
}

/**
 * Cria prompt otimizado que força resposta em JSON
 */
function createPrompt(question: QuestionWithIds): string {
    const alternativesText = question.alternatives
        .map((alt) => `${alt.letter}) ${alt.description} (ID: ${alt.id})`)
        .join("\n");

    return `Você é um assistente que responde questões de múltipla escolha.

IMPORTANTE: Responda APENAS com um objeto JSON válido, sem texto adicional.

Questão: ${question.description}

Alternativas:
${alternativesText}

Analise a questão e retorne SOMENTE um JSON no seguinte formato:
{
  "questionId": "${question.questionId}",
  "alternativeId": "ID_DA_ALTERNATIVA_CORRETA"
}

Substitua ID_DA_ALTERNATIVA_CORRETA pelo ID da alternativa que você considera correta.
Responda APENAS com o JSON, sem explicações.`;
}

function parseOllamaResponse(response: string): OllamaAnswer | null {
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("❌ JSON não encontrado na resposta");
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]) as OllamaAnswer;

        if (!parsed.questionId || !parsed.alternativeId) {
            console.error("❌ JSON inválido: faltam campos obrigatórios");
            return null;
        }

        return parsed;
    } catch (error) {
        console.error("❌ Erro ao parsear JSON:", error);
        return null;
    }
}

async function selectAlternative(
    ollamaResponses: string[],
    practiceId: string,
    exerciseApi: ExerciseApi
): Promise<number> {
    let successCount = 0;

    for (const response of ollamaResponses) {
        const answer = parseOllamaResponse(response);

        if (!answer) {
            console.error(
                `❌ Resposta inválida: "${response.slice(0, 100)}..."`
            );
            continue;
        }

        try {
            await exerciseApi.selectAlternative(
                practiceId,
                answer.questionId,
                answer.alternativeId
            );
            console.log(
                `  ✓ Questão ${answer.questionId.slice(
                    -8
                )}: Alternativa ${answer.alternativeId.slice(-8)} marcada`
            );
            successCount++;
        } catch (error) {
            console.error(
                `❌ Erro ao marcar questão ${answer.questionId}:`,
                error
            );
        }
    }

    return successCount;
}

async function main(): Promise<void> {
    const exerciseApi = new ExerciseApi();
    const exercise = new Exercise(exerciseApi);

    console.log("🚀 Iniciando prática...");
    const practiceId = await exercise.initPractice();
    console.log(`✅ Prática iniciada com ID: ${practiceId}`);

    console.log("📚 Buscando questões...");
    const questions = await exercise.getQuestions(practiceId);
    console.log(`✅ ${questions.length} questões encontradas`);

    // Preparar questões com IDs para o Ollama
    console.log("🤖 Preparando questões para o Ollama...");
    const questionsWithIds = prepareQuestionsForOllama(questions);

    const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 2;
    const totalBatches = Math.ceil(questionsWithIds.length / BATCH_SIZE);
    let totalMarked = 0;

    for (let i = 0; i < totalBatches; i++) {
        console.log(`\n📊 Processando lote ${i + 1}/${totalBatches}...`);

        const startIndex = i * BATCH_SIZE;
        const batch = questionsWithIds.slice(
            startIndex,
            startIndex + BATCH_SIZE
        );
        const prompts = batch.map((q) => createPrompt(q));

        console.log(`📤 Enviando ${batch.length} questões para o Ollama...`);

        const ollamaResponses = await Promise.all(
            prompts.map((p) => sendToOllama(p))
        );

        // Filtrar respostas válidas
        const validResponses = ollamaResponses.filter(
            (r): r is string => r !== null
        );

        if (validResponses.length === 0) {
            console.error("❌ Falha ao obter resposta do Ollama");
            throw new Error("Não foi possível obter respostas do Ollama");
        }

        if (validResponses.length < ollamaResponses.length) {
            console.warn(
                `⚠️  ${ollamaResponses.length - validResponses.length}/${
                    ollamaResponses.length
                } resposta(s) falharam`
            );
        }

        console.log(`✅ Lote ${i + 1} concluído`);

        // Marcar respostas
        console.log("✍️  Marcando respostas...");
        const markedCount = await selectAlternative(
            validResponses,
            practiceId,
            exerciseApi
        );

        totalMarked += markedCount;
        console.log(
            `✓ ${markedCount}/${validResponses.length} respostas marcadas neste lote`
        );
    }

    console.log(
        `\n✅ Total: ${totalMarked}/${questions.length} respostas marcadas!`
    );

    // Finalizar prática
    console.log("🏁 Finalizando prática...");
    console.log("✅ Prática finalizada com sucesso!");
}

main().catch((err) => {
    console.error("❌ Erro no fluxo principal:", err);
    process.exit(1);
});
