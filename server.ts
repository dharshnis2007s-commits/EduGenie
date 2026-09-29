import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  initDatabase,
  db,
  logActivity,
} from './server/db.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  requireAuth,
  optionalAuth,
  type AuthRequest,
} from './server/auth.js';
import {
  generateQAAnswer,
  generateConceptExplanation,
  generateQuiz,
  generateSummary,
  generateLearningPath,
} from './server/ai.js';

dotenv.config();

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '5mb' }));

/* =========================================================================
   HEALTH CHECK
   ========================================================================= */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      app: 'EduGenie',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    },
    error: null,
  });
});

/* =========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================= */
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, full_name, education_level } = req.body;
    if (!email || !password || !full_name) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Email, password, and full name are required.' },
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Password must be at least 6 characters long.' },
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'An account with this email already exists. Please log in.' },
      });
      return;
    }

    const userId = randomUUID();
    const profileId = randomUUID();
    const passwordHash = hashPassword(password);
    const eduLevel = education_level || 'High School';

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    insertUser.run(userId, cleanEmail, passwordHash);

    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, user_id, full_name, avatar_url, education_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    insertProfile.run(profileId, userId, full_name.trim(), '', eduLevel);

    const token = createSession(userId);
    logActivity(userId, 'register', 'Joined EduGenie', { email: cleanEmail });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email: cleanEmail,
          full_name: full_name.trim(),
          avatar_url: '',
          education_level: eduLevel,
        },
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Registration failed. Please try again.' },
    });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Please enter both email and password.' },
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userRow = db.prepare(`
      SELECT u.id, u.email, u.password_hash, p.full_name, p.avatar_url, p.education_level
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.email = ?
    `).get(cleanEmail) as any;

    if (!userRow || !verifyPassword(password, userRow.password_hash)) {
      res.status(401).json({
        success: false,
        data: null,
        error: { message: 'Invalid email or password. Please check and try again.' },
      });
      return;
    }

    const token = createSession(userRow.id);
    logActivity(userRow.id, 'login', 'Logged in to EduGenie');

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userRow.id,
          email: userRow.email,
          full_name: userRow.full_name || 'Student',
          avatar_url: userRow.avatar_url || '',
          education_level: userRow.education_level || 'High School',
        },
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Login failed. Please try again.' },
    });
  }
});

app.post('/api/auth/logout', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      deleteSession(token);
    }
    res.json({ success: true, data: { message: 'Logged out successfully.' }, error: null });
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, error: { message: 'Logout failed.' } });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
    error: null,
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      success: false,
      data: null,
      error: { message: 'Please provide an email address.' },
    });
    return;
  }
  // Safe simulated response protecting user privacy
  res.json({
    success: true,
    data: { message: `If an account exists for ${email}, a reset link has been dispatched.` },
    error: null,
  });
});

app.post('/api/auth/reset-password', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'New password must be at least 6 characters long.' },
      });
      return;
    }

    const newHash = hashPassword(new_password);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?').run(
      newHash,
      req.user!.id
    );

    logActivity(req.user!.id, 'password_update', 'Password successfully updated');

    res.json({
      success: true,
      data: { message: 'Password updated successfully.' },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Unable to update password.' },
    });
  }
});

/* =========================================================================
   USER PROFILE
   ========================================================================= */
app.get('/api/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const profile = db.prepare(`
      SELECT p.id, p.user_id, p.full_name, p.avatar_url, p.education_level, p.created_at, p.updated_at, u.email
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
    `).get(req.user!.id) as any;

    res.json({
      success: true,
      data: { profile },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to fetch user profile.' },
    });
  }
});

app.post('/api/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { full_name, education_level, avatar_url } = req.body;
    if (!full_name) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Full name cannot be empty.' },
      });
      return;
    }

    db.prepare(`
      UPDATE profiles
      SET full_name = ?, education_level = ?, avatar_url = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(
      full_name.trim(),
      education_level || 'High School',
      avatar_url || '',
      req.user!.id
    );

    logActivity(req.user!.id, 'profile_update', 'Updated profile information');

    res.json({
      success: true,
      data: {
        profile: {
          id: req.user!.id,
          user_id: req.user!.id,
          full_name: full_name.trim(),
          education_level: education_level || 'High School',
          avatar_url: avatar_url || '',
          email: req.user!.email,
        },
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to update profile.' },
    });
  }
});

/* =========================================================================
   DASHBOARD STATS
   ========================================================================= */
app.get('/api/dashboard/stats', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const qaCountRow = db.prepare('SELECT COUNT(*) as count FROM conversations WHERE user_id = ?').get(userId) as any;
    const explainCountRow = db.prepare('SELECT COUNT(*) as count FROM explanations WHERE user_id = ?').get(userId) as any;
    const quizCountRow = db.prepare('SELECT COUNT(*) as count FROM quizzes WHERE user_id = ?').get(userId) as any;
    const avgScoreRow = db.prepare('SELECT AVG(score) as avg_score FROM quizzes WHERE user_id = ? AND completed = 1 AND score IS NOT NULL').get(userId) as any;
    const summaryCountRow = db.prepare('SELECT COUNT(*) as count FROM summaries WHERE user_id = ?').get(userId) as any;
    const pathCountRow = db.prepare('SELECT COUNT(*) as count FROM learning_paths WHERE user_id = ?').get(userId) as any;

    const recentLogs = db.prepare(`
      SELECT id, activity_type, title, metadata, created_at
      FROM activity_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `).all(userId) as any[];

    res.json({
      success: true,
      data: {
        stats: {
          questionsAsked: qaCountRow?.count || 0,
          explanationsGenerated: explainCountRow?.count || 0,
          quizzesCompleted: quizCountRow?.count || 0,
          averageQuizScore: avgScoreRow?.avg_score ? Math.round(avgScoreRow.avg_score) : null,
          summariesCreated: summaryCountRow?.count || 0,
          learningPathsCreated: pathCountRow?.count || 0,
        },
        recentActivity: recentLogs.map((log) => ({
          id: log.id,
          activity_type: log.activity_type,
          title: log.title,
          metadata: log.metadata ? JSON.parse(log.metadata) : {},
          created_at: log.created_at,
        })),
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to load dashboard metrics.' },
    });
  }
});

/* =========================================================================
   1. AI TUTOR (Q&A) ENDPOINT: POST /api/qa
   ========================================================================= */
app.post('/api/qa', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Please provide a valid question.' },
      });
      return;
    }

    if (question.length > 2000) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Question exceeds maximum character length (2000).' },
      });
      return;
    }

    const educationLevel = req.user?.education_level || 'High School';
    const result = await generateQAAnswer(question.trim(), educationLevel);

    let savedId: string | null = null;
    if (req.user) {
      savedId = randomUUID();
      const insertQA = db.prepare(`
        INSERT INTO conversations (id, user_id, question, answer, key_points, follow_ups, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      insertQA.run(
        savedId,
        req.user.id,
        question.trim(),
        result.answer,
        JSON.stringify(result.key_points),
        JSON.stringify(result.follow_ups)
      );
      logActivity(req.user.id, 'qa', `Asked: "${question.trim().slice(0, 45)}..."`, { questionId: savedId });
    }

    res.json({
      success: true,
      data: {
        id: savedId,
        answer: result.answer,
        key_points: result.key_points,
        follow_ups: result.follow_ups,
        saved: !!req.user,
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: err?.message || 'Unable to generate answer from AI Tutor.' },
    });
  }
});

/* =========================================================================
   2. CONCEPT EXPLANATION MODULE: POST /api/explain
   ========================================================================= */
app.post('/api/explain', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { concept, difficulty, style, provider } = req.body;
    if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Please enter a concept or topic to explain.' },
      });
      return;
    }

    const diff = ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty) ? difficulty : 'Beginner';
    const stl = ['Simple', 'Detailed', 'Example-based', 'Exam-oriented'].includes(style) ? style : 'Simple';
    const prov = provider === 'lamini-fallback' ? 'lamini-fallback' : 'gemini';

    const result = await generateConceptExplanation(concept.trim(), diff, stl, prov);

    let savedId: string | null = null;
    if (req.user) {
      savedId = randomUUID();
      const insertExpl = db.prepare(`
        INSERT INTO explanations (id, user_id, topic, difficulty, style, explanation, model_used, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      insertExpl.run(
        savedId,
        req.user.id,
        concept.trim(),
        diff,
        stl,
        JSON.stringify(result),
        result.model_provider
      );
      logActivity(req.user.id, 'explain', `Explained concept: "${concept.trim()}"`, { explanationId: savedId });
    }

    res.json({
      success: true,
      data: {
        id: savedId,
        topic: concept.trim(),
        difficulty: diff,
        style: stl,
        explanation: result,
        saved: !!req.user,
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: err?.message || 'Unable to generate concept explanation.' },
    });
  }
});

/* =========================================================================
   3. QUIZ GENERATOR: POST /api/quiz
   ========================================================================= */
app.post('/api/quiz', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, question_count, difficulty } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Please provide a topic or study passage for the quiz.' },
      });
      return;
    }

    const count = [3, 5, 10].includes(Number(question_count)) ? Number(question_count) : 3;
    const diff = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';

    const quizResult = await generateQuiz(topic.trim(), count, diff);

    let savedId: string | null = null;
    if (req.user) {
      savedId = randomUUID();
      const insertQuiz = db.prepare(`
        INSERT INTO quizzes (id, user_id, topic, difficulty, question_count, quiz_data, score, completed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NULL, 0, datetime('now'))
      `);
      insertQuiz.run(
        savedId,
        req.user.id,
        topic.trim().slice(0, 100),
        diff,
        count,
        JSON.stringify(quizResult.questions)
      );
      logActivity(req.user.id, 'quiz_generate', `Generated quiz: "${topic.trim().slice(0, 45)}"`, { quizId: savedId });
    }

    res.json({
      success: true,
      data: {
        id: savedId,
        topic: topic.trim(),
        difficulty: diff,
        question_count: count,
        questions: quizResult.questions,
        saved: !!req.user,
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: err?.message || 'Unable to generate quiz.' },
    });
  }
});

/* Save Quiz Test Result */
app.post('/api/quiz/save-result', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { quizId, score, completed } = req.body;
    if (!quizId || score === undefined) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'quizId and score are required.' },
      });
      return;
    }

    if (req.user) {
      // Validate user owns this quiz (Row Level Security check)
      const existing = db.prepare('SELECT id, topic FROM quizzes WHERE id = ? AND user_id = ?').get(quizId, req.user.id) as any;
      if (existing) {
        db.prepare('UPDATE quizzes SET score = ?, completed = 1 WHERE id = ? AND user_id = ?').run(
          Number(score),
          quizId,
          req.user.id
        );
        logActivity(req.user.id, 'quiz_complete', `Completed quiz: "${existing.topic}" with ${score}%`, { quizId, score });
      }
    }

    res.json({
      success: true,
      data: { message: 'Quiz score saved successfully.' },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to record quiz results.' },
    });
  }
});

/* =========================================================================
   4. SUMMARIZATION MODULE: POST /api/summarize
   ========================================================================= */
app.post('/api/summarize', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { text, length, style } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Please provide at least 20 characters of educational text to summarize.' },
      });
      return;
    }

    const len = ['Short', 'Medium', 'Detailed'].includes(length) ? length : 'Medium';
    const stl = ['Simple', 'Exam Revision', 'Bullet Points'].includes(style) ? style : 'Simple';

    const result = await generateSummary(text.trim(), len, stl);

    let savedId: string | null = null;
    if (req.user) {
      savedId = randomUUID();
      const insertSum = db.prepare(`
        INSERT INTO summaries (id, user_id, source_text, summary, length, style, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      insertSum.run(
        savedId,
        req.user.id,
        text.trim().slice(0, 1000),
        JSON.stringify(result),
        len,
        stl
      );
      logActivity(req.user.id, 'summary', `Summarized passage (${len} / ${stl})`, { summaryId: savedId });
    }

    res.json({
      success: true,
      data: {
        id: savedId,
        summary: result.summary,
        key_points: result.key_points,
        important_terms: result.important_terms,
        quick_revision: result.quick_revision,
        saved: !!req.user,
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: err?.message || 'Unable to generate summary.' },
    });
  }
});

/* =========================================================================
   5. PERSONALIZED LEARNING PATH: POST /api/learn/recommendations
   ========================================================================= */
app.post('/api/learn/recommendations', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, current_level, study_time, goal } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Please enter what you want to learn (e.g. SQL, Quantum Physics).' },
      });
      return;
    }

    const lvl = ['Beginner', 'Intermediate', 'Advanced'].includes(current_level) ? current_level : 'Beginner';
    const time = study_time || '30 minutes/day';
    const gl = goal || 'Practical skills';

    const result = await generateLearningPath(topic.trim(), lvl, time, gl);

    let savedId: string | null = null;
    if (req.user) {
      savedId = randomUUID();
      const insertPath = db.prepare(`
        INSERT INTO learning_paths (id, user_id, topic, current_level, goal, study_time, learning_path_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      insertPath.run(
        savedId,
        req.user.id,
        topic.trim(),
        lvl,
        gl,
        time,
        JSON.stringify(result)
      );
      logActivity(req.user.id, 'learning_path', `Created learning path: "${topic.trim()}"`, { pathId: savedId });
    }

    res.json({
      success: true,
      data: {
        id: savedId,
        learning_path: result,
        saved: !!req.user,
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: err?.message || 'Unable to generate learning path recommendations.' },
    });
  }
});

/* =========================================================================
   6. USER HISTORY: GET /api/history & DELETE /api/history/:id
   ========================================================================= */
app.get('/api/history', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as string | undefined;
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    const items: any[] = [];

    // 1. Q&A Conversations
    if (!type || type === 'all' || type === 'qa') {
      const qas = db.prepare(`
        SELECT id, question as title, answer as preview_text, key_points, follow_ups, created_at
        FROM conversations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(userId) as any[];

      qas.forEach((q) => {
        items.push({
          id: q.id,
          type: 'qa',
          typeLabel: 'AI Tutor Q&A',
          title: q.title,
          preview: q.preview_text.slice(0, 150) + (q.preview_text.length > 150 ? '...' : ''),
          fullData: {
            question: q.title,
            answer: q.preview_text,
            key_points: q.key_points ? JSON.parse(q.key_points) : [],
            follow_ups: q.follow_ups ? JSON.parse(q.follow_ups) : [],
          },
          created_at: q.created_at,
        });
      });
    }

    // 2. Explanations
    if (!type || type === 'all' || type === 'explain') {
      const expls = db.prepare(`
        SELECT id, topic as title, difficulty, style, explanation, created_at
        FROM explanations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(userId) as any[];

      expls.forEach((e) => {
        let parsed = {};
        try { parsed = JSON.parse(e.explanation); } catch {}
        items.push({
          id: e.id,
          type: 'explain',
          typeLabel: 'Concept Explanation',
          title: e.title,
          badge: `${e.difficulty} • ${e.style}`,
          preview: (parsed as any).simple_explanation?.slice(0, 150) || (parsed as any).definition?.slice(0, 150) || 'Concept explanation',
          fullData: parsed,
          created_at: e.created_at,
        });
      });
    }

    // 3. Quizzes
    if (!type || type === 'all' || type === 'quiz') {
      const quizzes = db.prepare(`
        SELECT id, topic as title, difficulty, question_count, score, completed, quiz_data, created_at
        FROM quizzes
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(userId) as any[];

      quizzes.forEach((qz) => {
        let questions = [];
        try { questions = JSON.parse(qz.quiz_data); } catch {}
        items.push({
          id: qz.id,
          type: 'quiz',
          typeLabel: 'AI Quiz',
          title: qz.title,
          badge: `${qz.difficulty} • ${qz.question_count} Qs ${qz.completed ? `• Score: ${qz.score}%` : '• Incomplete'}`,
          preview: `Quiz with ${qz.question_count} questions on ${qz.title}.`,
          fullData: {
            questions,
            score: qz.score,
            completed: qz.completed,
            difficulty: qz.difficulty,
          },
          created_at: qz.created_at,
        });
      });
    }

    // 4. Summaries
    if (!type || type === 'all' || type === 'summarize') {
      const sums = db.prepare(`
        SELECT id, source_text, summary, length, style, created_at
        FROM summaries
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(userId) as any[];

      sums.forEach((s) => {
        let parsed = {};
        try { parsed = JSON.parse(s.summary); } catch {}
        items.push({
          id: s.id,
          type: 'summarize',
          typeLabel: 'Summary',
          title: s.source_text.slice(0, 60) + (s.source_text.length > 60 ? '...' : ''),
          badge: `${s.length} • ${s.style}`,
          preview: (parsed as any).summary?.slice(0, 150) || 'Summary output',
          fullData: parsed,
          created_at: s.created_at,
        });
      });
    }

    // 5. Learning Paths
    if (!type || type === 'all' || type === 'learning_path') {
      const paths = db.prepare(`
        SELECT id, topic as title, current_level, goal, study_time, learning_path_data, created_at
        FROM learning_paths
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(userId) as any[];

      paths.forEach((p) => {
        let parsed = {};
        try { parsed = JSON.parse(p.learning_path_data); } catch {}
        items.push({
          id: p.id,
          type: 'learning_path',
          typeLabel: 'Learning Path',
          title: p.title,
          badge: `${p.current_level} • ${p.goal}`,
          preview: (parsed as any).overview?.slice(0, 150) || `Learning path for ${p.title}`,
          fullData: parsed,
          created_at: p.created_at,
        });
      });
    }

    // Sort all combined by created_at descending
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Filter by search query if supplied
    const filtered = search
      ? items.filter((item) =>
          item.title.toLowerCase().includes(search) ||
          item.preview.toLowerCase().includes(search) ||
          item.typeLabel.toLowerCase().includes(search)
        )
      : items;

    res.json({
      success: true,
      data: { items: filtered },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to retrieve learning history.' },
    });
  }
});

app.delete('/api/history/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;
    const type = req.query.type as string;

    // Enforce row-level ownership: only delete records belonging to req.user.id
    if (type === 'qa') {
      db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?').run(id, userId);
    } else if (type === 'explain') {
      db.prepare('DELETE FROM explanations WHERE id = ? AND user_id = ?').run(id, userId);
    } else if (type === 'quiz') {
      db.prepare('DELETE FROM quizzes WHERE id = ? AND user_id = ?').run(id, userId);
    } else if (type === 'summarize') {
      db.prepare('DELETE FROM summaries WHERE id = ? AND user_id = ?').run(id, userId);
    } else if (type === 'learning_path') {
      db.prepare('DELETE FROM learning_paths WHERE id = ? AND user_id = ?').run(id, userId);
    } else {
      // General cascade check across all types
      db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?').run(id, userId);
      db.prepare('DELETE FROM explanations WHERE id = ? AND user_id = ?').run(id, userId);
      db.prepare('DELETE FROM quizzes WHERE id = ? AND user_id = ?').run(id, userId);
      db.prepare('DELETE FROM summaries WHERE id = ? AND user_id = ?').run(id, userId);
      db.prepare('DELETE FROM learning_paths WHERE id = ? AND user_id = ?').run(id, userId);
    }

    res.json({
      success: true,
      data: { message: 'History record deleted.' },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to delete record.' },
    });
  }
});

/* =========================================================================
   VITE MIDDLEWARE IN DEV / STATIC SERVE IN PROD
   ========================================================================= */
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error in EduGenie server:', err);
  process.exit(1);
});
