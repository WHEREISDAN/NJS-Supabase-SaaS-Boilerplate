export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Next.js 15</h1>
      <p className="text-lg mb-8">Your new project is ready to go!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <a
          href="https://nextjs.org/docs"
          className="group p-6 border rounded-lg hover:border-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:underline">
            Documentation{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </h2>
          <p className="text-sm opacity-70">
            Find in-depth information about Next.js features and API.
          </p>
        </a>
        <a
          href="https://nextjs.org/learn"
          className="group p-6 border rounded-lg hover:border-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:underline">
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </h2>
          <p className="text-sm opacity-70">
            Learn about Next.js in an interactive course with quizzes!
          </p>
        </a>
      </div>
    </main>
  );
}
