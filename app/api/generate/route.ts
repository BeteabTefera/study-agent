import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizRequest {
  userId: string;
  topic: string;
  notes: string;
  fileIds?: number[]; // Optional: IDs of uploaded files to include
}

export async function POST(req: NextRequest) {
  try {
    const body: QuizRequest = await req.json();
    const { userId, topic, notes, fileIds } = body;

    // Validation
    if (!userId || !topic) {
      return NextResponse.json(
        { error: 'userId and topic are required' },
        { status: 400 }
      );
    }

    // Fetch file contents if fileIds provided
    let additionalContext = '';
    if (fileIds && fileIds.length > 0) {
      const { data: files, error } = await supabase
        .from('user_files')
        .select('file_name, file_url')
        .in('id', fileIds)
        .eq('user_id', userId);

      if (!error && files) {
        additionalContext = `\n\nUser has uploaded these study materials: ${files.map(f => f.file_name).join(', ')}`;
      }
    }

    // Create prompt for OpenAI
    const prompt = `You are an expert quiz generator. Create a challenging 10-question multiple choice quiz based on the following information:

Topic: ${topic}

Study Notes:
${notes}
${additionalContext}

Generate exactly 10 multiple choice questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

For each question, provide a detailed explanation of why the correct answer is right and why the other options are wrong. This explanation should help the student learn from their mistakes.

Return the response as a valid JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of the correct answer and why other options are incorrect."
  }
]

Note: correctAnswer is the index (0-3) of the correct option in the options array.

IMPORTANT: Return ONLY the JSON array, no other text or markdown formatting.`;

    console.log('Generating quiz with OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-4' for better quality
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates educational quizzes in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI Response:', responseText);

    // Parse the JSON response
    let questions: Question[];
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questions = JSON.parse(cleanedResponse);
    } catch {
      console.error('Failed to parse OpenAI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse quiz questions', details: responseText },
        { status: 500 }
      );
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid quiz format: expected 10 questions', received: questions.length },
        { status: 500 }
      );
    }

    // Save quiz attempt to database (initially with score 0)
    const { data: quizAttempt, error: dbError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        topic: topic,
        questions: questions,
        score: 0,
        total_questions: 10
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save quiz', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quizId: quizAttempt.id,
      questions: questions,
      topic: topic
    }, { status: 200 });

  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate quiz', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to update quiz score after completion
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId, score, userId } = body;

    if (!quizId || score === undefined || !userId) {
      return NextResponse.json(
        { error: 'quizId, score, and userId are required' },
        { status: 400 }
      );
    }

    // Update the quiz attempt with the final score
    const { data, error } = await supabase
      .from('quiz_attempts')
      .update({ score: score })
      .eq('id', quizId)
      .eq('user_id', userId) // Ensure user can only update their own quizzes
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update score', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: data
    }, { status: 200 });

  } catch (error) {
    console.error('Update score error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update score', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}