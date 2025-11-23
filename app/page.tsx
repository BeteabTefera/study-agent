import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export default function Home() {
  return (

    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
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
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center sm:text-left"> Welcome to Study Agent</h1>
        <p className="text-lg text-center sm:text-left max-w-2xl">
          Your AI-powered study assistant designed to enhance your learning experience through personalized study plans, interactive quizzes, and real-time feedback. Get started on your journey to academic success with Study Agent!
        </p>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/*Footer content can go here if needed*/}
      </footer>
    </div>
  );
}
