
export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    FILL_IN_BLANK = 'FILL_IN_BLANK',
    REARRANGE = 'REARRANGE'
}

export enum GameState {
    START = 'START',
    PLAYING = 'PLAYING',
    FINISHED = 'FINISHED'
}

export interface Question {
    id: number;
    type: QuestionType;
    questionText: string;
    correctAnswer: string;
    explanation: string;
    vietnameseHint?: string; // Gợi ý dịch nghĩa hoặc từ vựng
    options?: string[];
    rearrangeParts?: string[];
    imageUrl?: string;
    audioUrl?: string;
}

export interface UserAnswer {
    questionId: number;
    userResponse: string;
    isCorrect: boolean;
}
