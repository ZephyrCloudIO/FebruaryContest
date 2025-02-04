import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PullRequest {
  id: number;
  title: string;
  user: {
    login: string;
  };
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
  updated_at: string;
}

export function Leaderboard() {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPullRequests = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/ZephyrCloudIO/FebruaryContest/pulls'
        );
        if (!response.ok) throw new Error('Failed to fetch pull requests');
        
        const prs = await response.json();
        const prsWithReactions = await Promise.all(
          prs.map(async (pr: PullRequest) => {
            const reactionsResponse = await fetch(
              `https://api.github.com/repos/ZephyrCloudIO/FebruaryContest/pulls/${pr.id}/reactions`,
              {
                headers: {
                  'Accept': 'application/vnd.github.squirrel-girl-preview'
                }
              }
            );
            const reactions = await reactionsResponse.json();
            return { ...pr, reactions };
          })
        );

        setPullRequests(prsWithReactions);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchPullRequests();
    const interval = setInterval(fetchPullRequests, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const sortedPRs = [...pullRequests]
    .sort((a, b) => b.reactions.total_count - a.reactions.total_count)
    .slice(0, 10);

  if (loading) return <div className="text-gray-400">Loading leaderboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="rounded-lg shadow-lg w-full">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-white">Top Pull Requests</h3>
      </div>
      <ul className="space-y-4">
        {sortedPRs.map((pr, index) => (
          <li key={pr.id} className="flex items-center justify-between text-gray-300">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">{pr.title}</p>
                <p className="text-xs text-gray-400">
                  By: {pr.user.login} · Last updated: {new Date(pr.updated_at).toRelativeTimeString()}
                </p>
              </div>
            </div>
            <span className="text-xl font-bold">{pr.reactions.total_count}</span>
          </li>
        ))}  
      </ul>
    </div>
  );
}