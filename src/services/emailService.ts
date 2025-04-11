import type { QuestionWithShuffledAnswers } from "@/app/quiz/question/page";

// Simplified version of AnsweredQuestion for email payload
interface EmailAnsweredQuestion {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface EmailPayload {
  topic: string;
  questions: QuestionWithShuffledAnswers[];
  userAnswers: EmailAnsweredQuestion[];
  summary: {
    score: number;
    totalQuestions: number;
    percentage: number;
  };
  recipientEmail: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailService {
  private static webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  static validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  static async sendTriviaResults(payload: EmailPayload): Promise<Response> {
    if (!this.webhookUrl) {
      throw new Error("Webhook URL not configured");
    }

    if (!this.validateEmail(payload.recipientEmail)) {
      throw new Error("Invalid email address");
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error("Error sending trivia results:", error);
      throw error;
    }
  }
}
