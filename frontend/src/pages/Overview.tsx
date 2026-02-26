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
  const [chatCount, setChatCount] = useState<number>(0);
  const [pastTrialCount, setPastTrialCount] = useState<number>(0);
  const [quizCount, setQuizCount] = useState<number>(0);
  const [lastQuizPercent, setLastQuizPercent] = useState<number | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [trialStats, setTrialStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      console.log('Overview: Starting data fetch...');

      const [chats, trials, quizRes, quizDetails, activities, qStats, tStats] =
        await Promise.allSettled([
          getChatHistory(),
          getPastMockTrials(),
          getQuizCount(),
          getDetailedQuizResults(),
          getRecentActivities(),
          getQuizStatistics(),
          getMockTrialStatistics(),
        ]);

      if (chats.status === 'fulfilled') {
        setChatCount(chats.value.filter((c: any) => c.sender === 'user').length);
      }

      if (trials.status === 'fulfilled') {
        setPastTrialCount(trials.value?.length || 0);
      }

      if (quizRes.status === 'fulfilled') {
        setQuizCount(Number(quizRes.value.quizCount || 0));
      }

      if (quizDetails.status === 'fulfilled') {
        setLastQuizPercent(
          quizDetails.value?.attempts?.[0]?.percentage ?? null
        );
      }

      if (activities.status === 'fulfilled') {
        setRecentActivities(activities.value.activities || []);
      }

      if (qStats.status === 'fulfilled') {
        setQuizStats(qStats.value);
      }

      if (tStats.status === 'fulfilled') {
        setTrialStats(tStats.value);
      }

      const totalTime = Date.now() - startTime;
      console.log(`Overview data loaded in ${totalTime}ms`);

      setTimeout(() => setInitialLoad(false), 200);
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
