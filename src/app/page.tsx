import GradeCalculator from '@/components/grade-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 font-body">
      <GradeCalculator />
    </main>
  );
}
