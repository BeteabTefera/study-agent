'use client'
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Import } from "lucide-react";


export default function PracticePage() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append("file", file)

      const ingestRes = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      })

      if (!ingestRes.ok) throw new Error("Failed to upload file")

      // Generate questions
      const genRes = await fetch("/api/generate", {
        method: "POST",
      })

      const data = await genRes.json()
      setQuestions(data.questions || [])

    } catch (err) {
      toast.error("Something went wrong.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

    return (
        <div className="p-8 sm:p-20">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">                 
                <Breadcrumb>
                    <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbSeparator>--</BreadcrumbSeparator>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/practice">Practice</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbSeparator>--</BreadcrumbSeparator>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/history">History</BreadcrumbLink>
                    </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <h1 className="text-2xl font-bold mb-6">Practice</h1>

            {/* Drag Area */}
            <Card
                className={`border-2 border-dashed rounded-2xl transition-all ${
                dragging ? "border-primary bg-primary/10" : "border-muted"
                }`}
                onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <CardHeader>
                <CardTitle>Drop your study file here</CardTitle>
                </CardHeader>

                <CardContent>
                <div className="flex flex-col items-center py-10 gap-3 text-center">
                    {loading ? (
                    <Spinner />
                    ) : (
                    <>
                        <p className="text-muted-foreground">
                        Drag and drop a PDF, DOCX, or text file.  
                        </p>
                        <Button variant="outline">Or click to browse</Button>
                    </>
                    )}
                </div>
                </CardContent>
            </Card>

            {/* Questions */}
            {questions.length > 0 && (
                <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Generated Questions</h2>

                <Accordion type="single" collapsible className="w-full">
                    {questions.map((q, index) => (
                    <AccordionItem key={index} value={`q-${index}`}>
                        <AccordionTrigger>Question {index + 1}</AccordionTrigger>
                        <AccordionContent>{q}</AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                </Card>
            )}
        </div>
    )
}
