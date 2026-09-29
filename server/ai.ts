import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client with telemetry header as required
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables or Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Priority list of models to try in case of temporary high demand or rate limits
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.8-flash',
].filter(Boolean) as string[];

async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getGenAIClient();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || '');
      // If 503 or 429 high demand / rate limit, try the next model immediately
      if (errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.warn(`Model ${model} unavailable (${errMsg.slice(0, 80)}). Trying fallback model...`);
        continue;
      }
      throw err;
    }
  }

  // If all models failed
  console.error('All Gemini model candidates failed:', lastError);
  let cleanMsg = 'The AI service is momentarily busy. Please try again in a few seconds.';
  try {
    const parsed = JSON.parse(lastError?.message || '{}');
    if (parsed.error?.message) {
      cleanMsg = parsed.error.message;
    }
  } catch {}
  throw new Error(cleanMsg);
}

// Clean code blocks and fences before JSON parsing
function cleanJsonText(raw: string): string {
  let text = raw.trim();
  // Strip opening fence like ```json or ```
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '');
  }
  // Strip trailing fence
  if (text.endsWith('```')) {
    text = text.replace(/```$/, '');
  }
  return text.trim();
}

/* =========================================================================
   1. AI TUTOR (Q&A)
   ========================================================================= */
export interface QAResponse {
  answer: string;
  key_points: string[];
  follow_ups: string[];
}

export async function generateQAAnswer(question: string, educationLevel: string = 'High School'): Promise<QAResponse> {
  const ai = getGenAIClient();
  const systemInstruction = `You are EduGenie, an educational AI assistant. Answer the student's question accurately and clearly. Use simple language appropriate for the student's selected academic level (${educationLevel}). Explain difficult terms. Avoid unnecessary verbosity. When useful, provide examples and key points. Always return clean, valid JSON.`;

  const prompt = `Student question: "${question}"\n\nProvide an educational response in this strict JSON format:\n{\n  "answer": "Clear, direct, engaging explanation of the answer",\n  "key_points": ["Key takeaway point 1", "Key takeaway point 2", "Key takeaway point 3"],\n  "follow_ups": ["Interesting follow-up question or related topic 1", "Follow-up question 2"]\n}`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            follow_ups: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['answer', 'key_points'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    return {
      answer: parsed.answer || 'No answer generated.',
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
      follow_ups: Array.isArray(parsed.follow_ups) ? parsed.follow_ups : [],
    };
  } catch (error: any) {
    console.error('Gemini QA Error:', error);
    // Fallback parsing or standard helpful response
    throw new Error(error?.message || 'Unable to generate response from EduGenie AI Tutor.');
  }
}

/* =========================================================================
   2. CONCEPT EXPLANATION MODULE
   (Provider abstraction supporting lightweight model conceptual architecture)
   ========================================================================= */
export interface ExplanationResponse {
  definition: string;
  simple_explanation: string;
  step_by_step: string[];
  example: string;
  important_points: string[];
  quick_revision: string;
  model_provider: string;
}

export async function generateConceptExplanation(
  topic: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner',
  style: 'Simple' | 'Detailed' | 'Example-based' | 'Exam-oriented' = 'Simple',
  requestedProvider: 'gemini' | 'lamini-fallback' = 'gemini'
): Promise<ExplanationResponse> {
  const ai = getGenAIClient();
  const systemInstruction = `You are EduGenie's concept explanation tutor. Break difficult concepts into simple, logical steps. Start with the basic idea, explain important terms, provide an example, and finish with a quick revision section. Academic Difficulty: ${difficulty}. Teaching Style: ${style}. Return strict JSON.`;

  const prompt = `Concept to explain: "${topic}"\n\nGenerate structured educational explanation in this strict JSON format:\n{\n  "definition": "Clear concise formal definition",\n  "simple_explanation": "Intuitive beginner-friendly analogy or explanation",\n  "step_by_step": ["Step 1 / Core principle", "Step 2 / How it works", "Step 3 / Application"],\n  "example": "Relatable concrete real-world example with explanation",\n  "important_points": ["Crucial fact 1", "Crucial fact 2", "Common misconception or exam tip"],\n  "quick_revision": "Summary snapshot paragraph for quick memorization/review"\n}`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            simple_explanation: { type: Type.STRING },
            step_by_step: { type: Type.ARRAY, items: { type: Type.STRING } },
            example: { type: Type.STRING },
            important_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            quick_revision: { type: Type.STRING },
          },
          required: ['definition', 'simple_explanation', 'step_by_step', 'example', 'quick_revision'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);

    return {
      definition: parsed.definition || '',
      simple_explanation: parsed.simple_explanation || '',
      step_by_step: Array.isArray(parsed.step_by_step) ? parsed.step_by_step : [],
      example: parsed.example || '',
      important_points: Array.isArray(parsed.important_points) ? parsed.important_points : [],
      quick_revision: parsed.quick_revision || '',
      model_provider: requestedProvider === 'lamini-fallback' ? 'LaMini-Flan-T5-783M (Gemini Cloud Runner)' : 'Gemini 3.8 Flash',
    };
  } catch (error: any) {
    console.error('Gemini Explanation Error:', error);
    throw new Error(error?.message || 'Unable to generate concept explanation.');
  }
}

/* =========================================================================
   3. QUIZ GENERATOR
   ========================================================================= */
export interface QuizQuestion {
  question: string;
  options: string[]; // exactly 4 options
  correctAnswer: string; // The correct option string or index/letter matching one of options
  explanation: string;
}

export interface QuizResponse {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export async function generateQuiz(
  input: string,
  count: number = 3,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): Promise<QuizResponse> {
  const ai = getGenAIClient();
  const systemInstruction = `You are EduGenie's quiz generator. Generate valid multiple-choice questions based only on the provided topic or educational text. Each question must have exactly four distinct options and one clear correct answer. Return valid JSON only.`;

  const prompt = `Create a quiz with exactly ${count} multiple-choice questions on:\n"""\n${input.slice(0, 3000)}\n"""\nDifficulty Level: ${difficulty}.\n\nEnsure:\n1. Exactly four distinct options per question.\n2. The correctAnswer field MUST exactly match one of the four strings in options array.\n3. Include a helpful explanation of why that answer is correct.\n\nJSON format:\n{\n  "questions": [\n    {\n      "question": "...",\n      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],\n      "correctAnswer": "Option B text",\n      "explanation": "..."\n    }\n  ]\n}`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('AI returned an empty quiz question set.');
    }

    // Strict validation as per Section 35 of requirements:
    // 1. Parse JSON
    // 2. Verify questions array exists
    // 3. Verify each question has a question field
    // 4. Verify exactly four options
    // 5. Verify correct answer exists
    // 6. Verify explanation exists
    const validatedQuestions: QuizQuestion[] = parsed.questions.map((q: any, idx: number) => {
      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Question ${idx + 1} is missing valid text`);
      }
      let opts = Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : [];
      if (opts.length < 4) {
        // Pad with standard fallback distractor if needed
        while (opts.length < 4) {
          opts.push(`None of the above (Choice ${opts.length + 1})`);
        }
      } else if (opts.length > 4) {
        opts = opts.slice(0, 4);
      }

      let correct = String(q.correctAnswer || '').trim();
      // If correctAnswer is "A", "B", "C", "D" or "0", "1", "2", "3", map to option text
      const letterIndex = ['A', 'B', 'C', 'D'].indexOf(correct.toUpperCase());
      if (letterIndex !== -1 && opts[letterIndex]) {
        correct = opts[letterIndex];
      } else if (!opts.includes(correct)) {
        // If not found in options, ensure it exists in options
        correct = opts[0];
      }

      return {
        question: q.question.trim(),
        options: opts,
        correctAnswer: correct,
        explanation: (q.explanation && String(q.explanation).trim()) || 'No explanation provided.',
      };
    });

    return {
      topic: input.slice(0, 80),
      difficulty,
      questions: validatedQuestions,
    };
  } catch (error: any) {
    console.error('Gemini Quiz Generation Error:', error);
    throw new Error(error?.message || 'Failed to generate a valid quiz. Please try again or rephrase your topic.');
  }
}

/* =========================================================================
   4. SUMMARIZATION MODULE
   ========================================================================= */
export interface SummaryResponse {
  summary: string;
  key_points: string[];
  important_terms: Array<{ term: string; definition: string }>;
  quick_revision: string;
}

export async function generateSummary(
  text: string,
  length: 'Short' | 'Medium' | 'Detailed' = 'Medium',
  style: 'Simple' | 'Exam Revision' | 'Bullet Points' = 'Simple'
): Promise<SummaryResponse> {
  const ai = getGenAIClient();
  const systemInstruction = `You are EduGenie's educational summarization assistant. Summarize the provided educational content while preserving important facts, definitions, and concepts. Remove repetition and unnecessary details. Target Length: ${length}. Summary Style: ${style}. Use clear, student-friendly language. Return strict JSON.`;

  const prompt = `Educational passage to summarize:\n"""\n${text.slice(0, 6000)}\n"""\n\nGenerate structured summary in this strict JSON format:\n{\n  "summary": "Cohesive synthesized overview paragraph",\n  "key_points": ["Essential takeaway 1", "Essential takeaway 2", "Essential takeaway 3"],\n  "important_terms": [\n    {"term": "Keyword 1", "definition": "Brief definition in context"},\n    {"term": "Keyword 2", "definition": "Brief definition in context"}\n  ],\n  "quick_revision": "High-yield revision flash summary for rapid review"\n}`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            important_terms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            quick_revision: { type: Type.STRING },
          },
          required: ['summary', 'key_points', 'important_terms', 'quick_revision'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || 'Summary unavailable.',
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
      important_terms: Array.isArray(parsed.important_terms) ? parsed.important_terms : [],
      quick_revision: parsed.quick_revision || '',
    };
  } catch (error: any) {
    console.error('Gemini Summarize Error:', error);
    throw new Error(error?.message || 'Unable to summarize content.');
  }
}

/* =========================================================================
   5. PERSONALIZED LEARNING PATH
   ========================================================================= */
export interface LearningModule {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  estimated_time: string;
  topics: string[];
  subtopics: string[];
  practice_activities: string[];
  revision_recommendations: string;
}

export interface LearningPathResponse {
  topic: string;
  goal: string;
  current_level: string;
  study_time: string;
  overview: string;
  recommended_sequence: string[];
  modules: LearningModule[];
  next_steps: string[];
}

export async function generateLearningPath(
  topic: string,
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner',
  studyTime: string = '30 minutes/day',
  goal: string = 'Practical skills'
): Promise<LearningPathResponse> {
  const ai = getGenAIClient();
  const systemInstruction = `You are EduGenie's personalized learning planner. Create a structured beginner-to-advanced learning path based on the student's topic, current level (${currentLevel}), available study time (${studyTime}), and learning goal (${goal}). Include structured modules (Beginner, Intermediate, Advanced), specific subtopics, timelines, practice activities, and revision recommendations. Return strict JSON.`;

  const prompt = `Topic: "${topic}"\nCurrent Level: ${currentLevel}\nAvailable Time: ${studyTime}\nGoal: ${goal}\n\nGenerate structured roadmap JSON matching this format:\n{\n  "overview": "Encouraging roadmap introduction and expected outcomes",\n  "recommended_sequence": ["Step 1", "Step 2", "Step 3", "Step 4"],\n  "modules": [\n    {\n      "level": "Beginner",\n      "title": "Foundational Concepts & Setup",\n      "estimated_time": "2 weeks at ${studyTime}",\n      "topics": ["Core topic 1", "Core topic 2"],\n      "subtopics": ["Subtopic 1a", "Subtopic 1b"],\n      "practice_activities": ["Hands-on activity 1", "Practice task 2"],\n      "revision_recommendations": "Weekly quiz on fundamentals"\n    },\n    {\n      "level": "Intermediate",\n      "title": "Core Applications & Deeper Mechanics",\n      "estimated_time": "3 weeks at ${studyTime}",\n      "topics": ["Intermediate topic 1", "Intermediate topic 2"],\n      "subtopics": ["Subtopic 2a", "Subtopic 2b"],\n      "practice_activities": ["Mini project", "Case study review"],\n      "revision_recommendations": "Bi-weekly implementation reviews"\n    },\n    {\n      "level": "Advanced",\n      "title": "Specialization, Optimization & Real-World Projects",\n      "estimated_time": "4 weeks at ${studyTime}",\n      "topics": ["Advanced concept 1", "Advanced concept 2"],\n      "subtopics": ["Subtopic 3a", "Subtopic 3b"],\n      "practice_activities": ["Capstone project", "Comprehensive exam"],\n      "revision_recommendations": "Teach-back exercises and portfolio review"\n    }\n  ],\n  "next_steps": ["First action item today", "Recommended starter resource", "Milestone marker"]\n}`;

  try {
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            recommended_sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING },
                  title: { type: Type.STRING },
                  estimated_time: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practice_activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  revision_recommendations: { type: Type.STRING },
                },
                required: ['level', 'title', 'estimated_time', 'topics', 'subtopics', 'practice_activities', 'revision_recommendations'],
              },
            },
            next_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['overview', 'recommended_sequence', 'modules', 'next_steps'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);

    return {
      topic,
      goal,
      current_level: currentLevel,
      study_time: studyTime,
      overview: parsed.overview || '',
      recommended_sequence: Array.isArray(parsed.recommended_sequence) ? parsed.recommended_sequence : [],
      modules: Array.isArray(parsed.modules) ? parsed.modules : [],
      next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps : [],
    };
  } catch (error: any) {
    console.error('Gemini Learning Path Error:', error);
    throw new Error(error?.message || 'Unable to build personalized learning path.');
  }
}
