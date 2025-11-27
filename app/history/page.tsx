"use client"

import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle, Calendar, BookOpen, Target, FileQuestion, LineChart as LineChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

// Charts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizAttempt {
  id: number
  user_id: string
  topic: string
  questions: Question[]
  score: number
  total_questions: number
  created_at: string
}

export default function HistoryPage() {
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  const userId = "123e4567-e89b-12d3-a456-426614174000" // temp

  useEffect(() => {
    fetchQuizHistory()
  }, [])

  const fetchQuizHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/history?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch history")

      const data = await response.json()
      if (data.success) {
        setQuizAttempts(data.quizzes || [])
      }
    } catch (error) {
      console.error("Error fetching quiz history:", error)
      toast.error("Failed to load quiz history")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-300"
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const getScoreBadgeVariant = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  // 🔥 Derived stats
  const stats = {
    total: quizAttempts.length,
    avgScore:
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((acc, q) => acc + (q.score / q.total_questions) * 100, 0) /
              quizAttempts.length
          )
        : 0,
    best:
      quizAttempts.length > 0
        ? Math.max(
            ...quizAttempts.map((q) => Math.round((q.score / q.total_questions) * 100))
          )
        : 0,
    topics: [...new Set(quizAttempts.map((q) => q.topic))],
  }

  // 🔥 Chart Data
  const chartData = quizAttempts.map((attempt) => ({
    name: formatDate(attempt.created_at),
    score: Math.round((attempt.score / attempt.total_questions) * 100),
  }))

  if (loading) {
    return (
      <div className="p-8 sm:p-20">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>—</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/practice">Practice</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>—</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/history">History</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 sm:p-20 max-w-6xl mx-auto">

      {/* 🔥 Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>—</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/practice">Practice</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>—</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/history">History</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 🔥 Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz History</h1>
        <Badge variant="outline" className="text-sm">
          {stats.total} {stats.total === 1 ? "Quiz" : "Quizzes"}
        </Badge>
      </div>

      {/* 🔥 Stats + Chart */}
      {quizAttempts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon size={20} />
              Your Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-xl font-semibold">{stats.avgScore}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-xl font-semibold">{stats.best}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Topics</p>
                <p className="text-xl font-semibold">{stats.topics.length}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🔥 Empty State */}
      {quizAttempts.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <FileQuestion size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No quiz attempts yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Take your first quiz to see your history and track your progress here.
            </p>
            <Link href="/practice">
              <Button>Start Practice</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* 🔥 HISTORY LIST (your existing UI) */
        <div className="space-y-4">
          {quizAttempts.map((attempt) => {
            const percentage = Math.round(
              (attempt.score / attempt.total_questions) * 100
            )

            return (
              <Card key={attempt.id} className="overflow-hidden">
                <CardHeader className={`${getScoreColor(attempt.score, attempt.total_questions)} border-b`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        <BookOpen size={20} />
                        {attempt.topic}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>{formatDate(attempt.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target size={16} />
                          <span>{attempt.total_questions} Questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={getScoreBadgeVariant(attempt.score, attempt.total_questions)}
                        className="text-lg px-3 py-1"
                      >
                        {attempt.score}/{attempt.total_questions}
                      </Badge>
                      <p className="text-sm mt-1 font-semibold">{percentage}%</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {attempt.questions.map((question, index) => (
                      <AccordionItem key={question.id} value={`question-${question.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-left">
                            <span className="font-semibold">Q{index + 1}:</span>
                            <span className="flex-1">{question.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">

                            {/* Options */}
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => {
                                const isCorrect = optionIndex === question.correctAnswer

                                return (
                                  <div
                                    key={optionIndex}
                                    className={`p-3 rounded-md border ${
                                      isCorrect
                                        ? "bg-green-50 border-green-300"
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{option}</span>
                                      {isCorrect && (
                                        <CheckCircle className="text-green-600" size={18} />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Explanation */}
                            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                              <p className="text-sm font-semibold text-blue-900 mb-2">
                                Explanation:
                              </p>
                              <p className="text-sm text-blue-800">
                                {question.explanation}
                              </p>
                            </div>

                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
