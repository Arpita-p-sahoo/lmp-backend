import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private model: GenerativeModel;
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.modelName =
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';
    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({
      model: this.modelName,
    });
  }

  getModel(): GenerativeModel {
    return this.model;
  }

  private asRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object') return undefined;
    return value as Record<string, unknown>;
  }

  private extractStatus(err: unknown): number | undefined {
    const rec = this.asRecord(err);
    if (!rec) return undefined;

    const direct = rec.status;
    if (typeof direct === 'number') return direct;
    if (typeof direct === 'string') {
      const n = Number(direct);
      if (Number.isFinite(n)) return n;
    }

    const error = rec.error;
    if (error && typeof error === 'object') {
      const errorRec = error as Record<string, unknown>;
      const code = errorRec.code;
      if (typeof code === 'number') return code;
      if (typeof code === 'string') {
        const n = Number(code);
        if (Number.isFinite(n)) return n;
      }
    }

    const response = rec.response;
    if (response && typeof response === 'object') {
      const responseRec = response as Record<string, unknown>;
      const responseStatus = responseRec.status;
      if (typeof responseStatus === 'number') return responseStatus;
      if (typeof responseStatus === 'string') {
        const n = Number(responseStatus);
        if (Number.isFinite(n)) return n;
      }
    }

    return undefined;
  }

  private extractMessage(err: unknown): string {
    if (err instanceof Error && typeof err.message === 'string')
      return err.message;
    const rec = this.asRecord(err);
    if (!rec) return '';
    const direct = rec.message;
    if (typeof direct === 'string') return direct;
    const error = rec.error;
    if (error && typeof error === 'object') {
      const errorRec = error as Record<string, unknown>;
      const nested = errorRec.message;
      if (typeof nested === 'string') return nested;
    }
    return '';
  }

  private extractRetryAfterSeconds(message: string): number | undefined {
    const raw =
      message.match(/Please retry in\s+(\d+(?:\.\d+)?)s/i)?.[1] ??
      message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i)?.[1];
    if (!raw) return undefined;
    const n = Number(raw);
    if (!Number.isFinite(n)) return undefined;
    return n;
  }

  private throwGeminiHttpException(err: unknown): never {
    const status = this.extractStatus(err);
    const rawMessage = this.extractMessage(err);

    if (status === 404) {
      throw new Error(
        `Gemini returned 404 for model "${this.modelName}". Set GEMINI_MODEL to a supported model (for example: gemini-2.0-flash).`,
      );
    }
    if (status === 403) {
      throw new ForbiddenException(
        rawMessage ||
          'Gemini API rejected the request (403). Verify GEMINI_API_KEY and that the Gemini API is enabled for this project.',
      );
    }
    if (status === 429) {
      const retryAfterSeconds = this.extractRetryAfterSeconds(rawMessage);
      throw new HttpException(
        {
          message:
            rawMessage ||
            'Gemini API rate limit / quota exceeded (429). Check your project quotas and billing.',
          ...(typeof retryAfterSeconds === 'number'
            ? { retryAfterSeconds }
            : {}),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    throw err;
  }

  async prompt(text: string): Promise<string> {
    try {
      const result = await this.model.generateContent(text);
      return result.response.text();
    } catch (err: unknown) {
      this.throwGeminiHttpException(err);
    }
  }

  async promptWithPdf(base64Data: string, promptText: string): Promise<string> {
    try {
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data,
          },
        },
        promptText,
      ]);

      return result.response.text();
    } catch (err: unknown) {
      this.throwGeminiHttpException(err);
    }
  }
}
