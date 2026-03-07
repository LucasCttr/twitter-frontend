import TrendingTopics from '@/components/TrendingTopics';

export default function TrendingPage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)]" style={{ backgroundColor: '#0b0b0b' }}>
      <div className="w-full p-4">
        <TrendingTopics limit={20} fullWidth />
      </div>
    </main>
  );
}
