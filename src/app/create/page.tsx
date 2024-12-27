import { CreatePollForm } from '@/components/CreatePollForm';

export default function CreatePollPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Créer un nouveau sondage
        </h1>
        <CreatePollForm />
      </div>
    </main>
  );
} 