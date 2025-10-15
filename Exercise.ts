import { ExerciseApi } from "./ExerciseApi";
import { Question } from "./types";

export class Exercise {
    private readonly theme = process.env.PRACTICES_THEME;
    private exerciseApi;
    public practiceId: string | undefined;
    public questions: Question[] | undefined;

    constructor(exerciseApi: ExerciseApi) {
        this.exerciseApi = exerciseApi;
    }

    async initPractice() {
        if (!this.theme) {
            console.log("❌ Erro: PRACTICES_THEME não está definido no .env");
            process.exit(1);
        }

        // Iniciar practice
        const practiceResponse = await this.exerciseApi.practices(this.theme);
        const practiceData: any = await practiceResponse.json();
        const practiceId = practiceData.data.id;
        this.practiceId = practiceId;

        return practiceId;
    }

    async getQuestions(practiceId: string) {
        const practiceDetails = await this.exerciseApi.getPractice(practiceId);
        const questions = practiceDetails.data.questions;
        this.questions = questions;
        return questions;
    }

    async finalizePractice() {}

    async selectedAlternative(
        practiceId: string,
        questionId: string,
        alternativeId: string
    ) {
        await this.exerciseApi.selectAlternative(
            practiceId,
            questionId,
            alternativeId
        );
    }
}
