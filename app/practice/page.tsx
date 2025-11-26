'use client'

import React, { useState, useCallback } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone"
import { UploadIcon, CheckCircle, XCircle } from "lucide-react"
import { FileRejection, DropEvent } from "react-dropzone"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface UploadedFile {
  id: number
  name: string
  url: string
}

export default function PracticePage() {
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [quizId, setQuizId] = useState<string>("")

  // Hardcoded userId for now - you'll replace this with actual auth
  const userId = "123e4567-e89b-12d3-a456-426614174000"

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      const ingestRes = await fetch("/api/ingest", {
        method: "POST",
        body: formData
      })

      if (!ingestRes.ok) throw new Error("Upload failed")

      const data = await ingestRes.json()
      
      if (data.success) {
        setUploadedFile({
          id: data.file.id,
          name: data.file.name,
          url: data.file.url
        })
        toast.success(`File "${data.file.name}" uploaded successfully!`)
      }

    } catch (error) {
      console.error(error)
      toast.error("Failed to upload file.")
    } finally {
      setLoading(false)
    }
  }, [userId])

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    if (!notes.trim() && !uploadedFile) {
      toast.error("Please provide notes or upload a file")
      return
    }

    setLoading(true)
    setSubmitted(false)
    setUserAnswers({})

    try {
      const payload = {
        userId,
        topic: topic.trim(),
        notes: notes.trim(),
        ...(uploadedFile && { fileIds: [uploadedFile.id] })
      }

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!genRes.ok) throw new Error("Quiz generation failed")

      const data = await genRes.json()
      
      if (data.success) {
        setQuestions(data.questions || [])
        setQuizId(data.quizId)
        toast.success("Quiz generated successfully!")
      }

    } catch (error) {
      console.error(error)
      toast.error("Failed to generate quiz.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmitQuiz = async () => {
    // Calculate score
    let correctCount = 0
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })

    setScore(correctCount)
    setSubmitted(true)

    // Update score in database
    try {
      const response = await fetch("/api/generate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quizId,
          userId,
          score: correctCount
        })
      })

      if (response.ok) {
        toast.success(`Quiz submitted! Score: ${correctCount}/10`)
      }
    } catch (error) {
      console.error("Failed to update score:", error)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], _fileRejections: FileRejection[], _event: DropEvent) => {
      const file = acceptedFiles?.[0]
      if (file) handleFileUpload(file)
    },
    [handleFileUpload]
  )

  return (
    <div className="p-8 sm:p-20 max-w-4xl mx-auto">
      {/* Breadcrumb */}
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

      <h1 className="text-2xl font-bold mb-6">Practice Quiz</h1>

      {/* Quiz Setup Form */}
      {questions.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Your Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Topic Input */}
            <div>
              <Label htmlFor="topic">What are you preparing for?</Label>
              <Input
                id="topic"
                placeholder="e.g., AWS Cloud Practitioner Exam"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Notes Input */}
            <div>
              <Label htmlFor="notes">Your Study Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Paste your study notes here or upload a file below..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Upload Study Materials (optional)</Label>
              <Dropzone onDrop={onDrop} className="mt-2">
                <DropzoneEmptyState>
                  <div className="flex w-full items-center gap-4 p-8 cursor-pointer">
                    <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <UploadIcon size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Upload a file</p>
                      <p className="text-muted-foreground text-xs">
                        PDF, DOCX, or TXT files
                      </p>
                    </div>
                  </div>
                </DropzoneEmptyState>
                <DropzoneContent />
              </Dropzone>

              {uploadedFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle size={16} />
                  <span>{uploadedFile.name}</span>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateQuiz} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Generating Quiz...
                </>
              ) : (
                "Generate 10 Questions"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Spinner */}
      {loading && questions.length === 0 && (
        <div className="flex justify-center mt-6">
          <Spinner />
        </div>
      )}

      {/* Generated Questions */}
      {questions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Quiz: {topic}
              {submitted && (
                <span className="ml-4 text-lg font-normal">
                  Score: {score}/10 ({Math.round(score/10 * 100)}%)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-6 last:border-b-0">
                <p className="font-semibold mb-4">
                  {index + 1}. {question.question}
                </p>

                <RadioGroup
                  value={userAnswers[question.id]?.toString()}
                  onValueChange={(value) => 
                    handleAnswerChange(question.id, parseInt(value))
                  }
                  disabled={submitted}
                >
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.correctAnswer
                    const isSelected = userAnswers[question.id] === optionIndex
                    const showResult = submitted

                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-start space-x-2 p-3 rounded-md ${
                          showResult
                            ? isCorrect
                              ? "bg-green-50 border border-green-200"
                              : isSelected
                              ? "bg-red-50 border border-red-200"
                              : ""
                            : ""
                        }`}
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`q${question.id}-opt${optionIndex}`}
                        />
                        <Label
                          htmlFor={`q${question.id}-opt${optionIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                          {showResult && isCorrect && (
                            <CheckCircle className="inline ml-2 text-green-600" size={16} />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="inline ml-2 text-red-600" size={16} />
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>

                {/* Show explanation after submission */}
                {submitted && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-800">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {!submitted && (
              <Button 
                onClick={handleSubmitQuiz}
                className="w-full"
                disabled={Object.keys(userAnswers).length !== questions.length}
              >
                Submit Quiz
              </Button>
            )}

            {submitted && (
              <Button 
                onClick={() => {
                  setQuestions([])
                  setUserAnswers({})
                  setSubmitted(false)
                  setScore(0)
                  setTopic("")
                  setNotes("")
                  setUploadedFile(null)
                }}
                className="w-full"
                variant="outline"
              >
                Create New Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}