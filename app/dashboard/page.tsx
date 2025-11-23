//utilizing shadcn card and chart show users daily attempts of quiz and total score over time
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardPage() {
    return (
        <div className="p-8 sm:p-20 space-y-8">
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
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Quiz Attempts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Chart component for Daily Quiz Attempts goes here */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Score Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Chart component for Total Score Over Time goes here */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
