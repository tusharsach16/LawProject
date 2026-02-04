import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getQuizCount,
  getDetailedQuizResults,
  getPastMockTrials,
  getChatHistory,
  getRecentActivities,
  getQuizStatistics,
  getMockTrialStatistics,
} from "@/services/authService";
import { useAppSelector } from "../redux/hooks";
import LoadingScreen from "@/components/overview/LoadingScreen";
import WelcomeHeader from "@/components/overview/WelcomeHeader";
import StatsGrid from "@/components/overview/StatsGrid";
import QuickActionsGrid from "@/components/overview/QuickActionsGrid";
import ActivityAndStats from "@/components/overview/ActivityAndStats";

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.user);

  const [initialLoad, setInitialLoad] = useState(true);
  const [chatCount, setChatCount] = useState<number | null>(null);
  const [pastTrialCount, setPastTrialCount] = useState<number | null>(null);
  const [quizCount, setQuizCount] = useState<number | null>(null);
  const [lastQuizPercent, setLastQuizPercent] = useState<number | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [trialStats, setTrialStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => setInitialLoad(false), 300);

      const [chats, trials, quizRes] = await Promise.all([
        getChatHistory().catch(() => []),
        getPastMockTrials().catch(() => []),
        getQuizCount().catch(() => ({ quizCount: 0 })),
      ]);

      setChatCount(chats.filter((c: any) => c.sender === "user").length);
      setPastTrialCount(trials?.length || 0);
      setQuizCount(Number(quizRes.quizCount || 0));

      const [quizDetails, activities, qStats, tStats] = await Promise.all([
        getDetailedQuizResults().catch(() => ({ attempts: [] })),
        getRecentActivities().catch(() => ({ activities: [] })),
        getQuizStatistics().catch(() => null),
        getMockTrialStatistics().catch(() => null),
      ]);

      setLastQuizPercent(quizDetails?.attempts?.[0]?.percentage ?? null);
      setRecentActivities(activities.activities || []);
      setQuizStats(qStats);
      setTrialStats(tStats);
    };

    fetchData();
  }, []);

  if (initialLoad) return <LoadingScreen />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <WelcomeHeader userName={user?.name || "User"} />

      <StatsGrid
        chatCount={chatCount ?? 0}
        pastTrialCount={pastTrialCount ?? 0}
        quizCount={quizCount ?? 0}
        lastQuizPercent={lastQuizPercent}
      />

      <QuickActionsGrid navigate={navigate} />

      <ActivityAndStats
        recentActivities={recentActivities}
        quizStats={quizStats}
        trialStats={trialStats}
        navigate={navigate}
      />
    </div>
  );
};

export default Overview;
