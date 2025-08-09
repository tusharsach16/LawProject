import { useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import { BookOpen, CheckCircle, ClipboardCheck, Users } from "lucide-react";

/**
 * Overview page — responsive, Tailwind-based.
 * Replace mockData with real selectors/api calls as needed.
 */

function StatCard({ icon, title, value, change }: { icon: React.ReactNode; title: string; value: string | number; change?: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
        </div>
      </div>
      {change && <div className="text-sm text-green-600 font-medium">{change}</div>}
    </div>
  );
}

function ActivityItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
      <span className="mt-1 w-2 h-2 rounded-full bg-indigo-500" />
      <div className="flex-1">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-medium">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</div>
      </div>
    </div>
  );
}

function ProgressChart({ percent }: { percent: number }) {
  // Simple horizontal progress bar + mini monthly bars
  const months = [50, 65, 40, 80, 70, 90];
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{percent}%</div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Goal: Complete course</div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-4">
        <div className="h-3 bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-2 space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">Monthly activity</div>
        <div className="flex items-end gap-2 h-20">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-md" style={{ height: `${m}%` }} />
              <div className="text-[10px] text-gray-400 mt-2">M{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const { user } = useAppSelector((s) => s.user);

  // mock data — replace with real selectors / API responses
  const stats = {
    casesPracticed: 12,
    quizzesAttempted: 28,
    topicsRead: 42,
    mockTrials: 3,
  };

  const activities = [
    { title: "Completed Quiz on Criminal Law — 85%", time: "2 hours ago" },
    { title: "Started Case Practice: State v. Kumar", time: "Yesterday" },
    { title: "Reviewed article: IPC Section 302", time: "3 days ago" },
    { title: "Joined Mock Trial room: Civil - 4", time: "1 week ago" },
  ];

  useEffect(() => {
    // If you have actions to fetch overview data, dispatch here.
    // dispatch(fetchOverview());
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">MyDashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back{user?.name ? `, ${user.name}` : ""} — here's your quick overview</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition">Start Quiz</button>
          <button className="px-3 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition">Continue Practice</button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<ClipboardCheck size={20} />} title="Cases Practiced" value={stats.casesPracticed} change="+3 this week" />
        <StatCard icon={<CheckCircle size={20} />} title="Quizzes Attempted" value={stats.quizzesAttempted} change="+2 today" />
        <StatCard icon={<BookOpen size={20} />} title="Topics Read" value={stats.topicsRead} />
        <StatCard icon={<Users size={20} />} title="Mock Trials" value={stats.mockTrials} />
      </div>

      {/* Two column layout: Activities + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
              <button className="text-sm text-indigo-600 hover:underline">View all</button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activities.map((a, i) => (
                <ActivityItem key={i} title={a.title} time={a.time} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <ProgressChart percent={68} />
        </div>
      </div>
    </div>
  );
}
