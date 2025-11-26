# 🎓 Study Agent

An intelligent quiz generation platform powered by OpenAI that helps students practice and master any subject. Upload your study materials, specify your topic, and get personalized quizzes with detailed explanations.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)

## ✨ Features

### 📝 Smart Quiz Generation
- Generate 10 customized multiple-choice questions based on your study materials
- AI-powered question creation using OpenAI's GPT models
- Questions tailored to your topic and knowledge level

### 📚 Study Material Support
- Upload study materials (PDF, DOCX, TXT files)
- Paste notes directly into the interface
- Combine multiple sources for comprehensive quizzes

### 🎯 Interactive Practice
- Clean, intuitive quiz interface
- Real-time answer validation
- Instant feedback with color-coded results
- Detailed explanations for every question

### 📊 Progress Tracking
- Complete quiz history with timestamps
- Score tracking and performance analytics
- Review past quizzes and explanations
- Visual progress indicators

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations and transitions
- Dark mode support (coming soon)
- Mobile-friendly interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/study-agent.git
cd study-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

4. **Set up Supabase Database**

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create user_files table
CREATE TABLE user_files (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  questions JSONB NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_created_at ON quiz_attempts(created_at DESC);
```

5. **Create Supabase Storage Bucket**

In your Supabase Dashboard:
- Go to Storage
- Create a new bucket named `study-materials`
- Set it to public or configure access policies as needed

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a Quiz

1. Navigate to the **Practice** page
2. Enter your study topic (e.g., "AWS Cloud Practitioner Exam")
3. Either:
   - Paste your study notes in the text area, OR
   - Upload a study material file (PDF, DOCX, TXT)
4. Click **Generate 10 Questions**
5. Wait for the AI to create your personalized quiz

### Taking a Quiz

1. Read each question carefully
2. Select your answer from the multiple choice options
3. Answer all 10 questions
4. Click **Submit Quiz** to see your results
5. Review explanations for both correct and incorrect answers

### Viewing History

1. Navigate to the **History** page
2. See all your past quiz attempts
3. Click on any quiz to expand and review:
   - All questions and answers
   - Your score and percentage
   - Detailed explanations

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **File Storage**: Supabase Storage
- **AI**: [OpenAI API](https://openai.com/api/) (GPT-4)
- **Form Handling**: React Hook Form
- **Notifications**: Sonner

## 📁 Project Structure

```
study-agent/
├── app/
│   ├── api/
│   │   ├── generate/      # Quiz generation endpoint
│   │   ├── ingest/        # File upload endpoint
│   │   └── history/       # Quiz history endpoint
│   ├── practice/          # Quiz creation page
│   ├── history/           # Quiz history page
│   └── dashboard/         # Main dashboard
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## 🔌 API Routes

### POST `/api/ingest`
Upload study material files

**Body**: `FormData`
- `file`: File to upload
- `userId`: User identifier

**Response**:
```json
{
  "success": true,
  "file": {
    "id": 1,
    "name": "study-notes.pdf",
    "url": "https://...",
    "uploadedAt": "2024-11-26T10:00:00Z"
  }
}
```

### POST `/api/generate`
Generate a quiz based on topic and materials

**Body**: `JSON`
```json
{
  "userId": "uuid",
  "topic": "AWS Cloud Practitioner",
  "notes": "Study notes text...",
  "fileIds": [1, 2]
}
```

**Response**:
```json
{
  "success": true,
  "quizId": "uuid",
  "questions": [
    {
      "id": 1,
      "question": "What is EC2?",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "Detailed explanation..."
    }
  ]
}
```

### GET `/api/history?userId=xxx`
Fetch user's quiz history

**Response**:
```json
{
  "success": true,
  "quizzes": [...],
  "stats": {
    "totalQuizzes": 5,
    "averageScore": 85
  }
}
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/), a collection of beautifully designed, accessible components:

- Accordion
- Badge
- Breadcrumb
- Button
- Card
- Dialog
- Dropdown
- Input
- Radio Group
- Textarea
- Spinner
- Toast notifications

## 🔒 Security Considerations

- User IDs are currently hardcoded for development
- Implement proper authentication (Supabase Auth recommended)
- Add Row Level Security (RLS) policies in Supabase
- Validate file uploads server-side
- Rate limit API endpoints
- Sanitize user inputs

## 🚧 Future Enhancements

- [ ] User authentication with Supabase Auth
- [ ] Advanced text extraction from PDFs and DOCX files
- [ ] Difficulty level selection (Easy, Medium, Hard)
- [ ] Custom quiz length (5, 10, 15, 20 questions)
- [ ] Timed quiz mode
- [ ] Study streaks and achievements
- [ ] Quiz sharing and collaboration
- [ ] Export quiz results as PDF
- [ ] Mobile app (React Native)
- [ ] Multiple choice and true/false question types
- [ ] Performance analytics dashboard
- [ ] Topic recommendation