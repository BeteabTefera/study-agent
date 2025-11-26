import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch all quiz attempts for this user, ordered by most recent first
    const { data: quizzes, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quiz history', details: error.message },
        { status: 500 }
      );
    }

    // Calculate some statistics
    const totalQuizzes = quizzes?.length || 0;
    const totalScore = quizzes?.reduce((sum, quiz) => sum + quiz.score, 0) || 0;
    const totalQuestions = quizzes?.reduce((sum, quiz) => sum + quiz.total_questions, 0) || 0;
    const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return NextResponse.json({
      success: true,
      quizzes: quizzes || [],
      stats: {
        totalQuizzes,
        totalScore,
        totalQuestions,
        averageScore
      }
    }, { status: 200 });

  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch history', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a specific quiz attempt
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');
    const userId = searchParams.get('userId');

    if (!quizId || !userId) {
      return NextResponse.json(
        { error: 'quizId and userId are required' },
        { status: 400 }
      );
    }

    // Delete the quiz attempt (ensure it belongs to the user)
    const { error } = await supabase
      .from('quiz_attempts')
      .delete()
      .eq('id', quizId)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete quiz', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz attempt deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete quiz', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}