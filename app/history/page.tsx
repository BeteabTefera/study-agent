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
} from "@/components/ui/breadcrumb";
export default function HistoryPage() {
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
            <h1 className="text-2xl font-bold mb-6">History Page</h1>
            <Accordion type="single">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What is Study Agent?</AccordionTrigger>
                    <AccordionContent>
                        Study Agent is an AI-powered study assistant designed to help students enhance their learning experience through personalized study plans, interactive quizzes, and real-time feedback.
                    </AccordionContent>
                </AccordionItem>
                    <AccordionItem value="item-2">
                    <AccordionTrigger>Place holder</AccordionTrigger>
                    <AccordionContent>
                        This is a placeholder content for the second accordion item.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
