import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  BookOpen,
  Video,
} from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import { useLawyerDashboard } from '../hooks/useLawyerDashboard';
import LoadingScreen from '@/components/overview/LoadingScreen';
import WelcomeHeader from '@/components/overview/WelcomeHeader';
import ActivityAndStats from '@/components/overview/ActivityAndStats';
import StatCard from '../components/lawyerDashboard/StatCard';
import QuickActionCard from '../components/overview/QuickActionCard';
import AppointmentPreviewCard from '../components/lawyerDashboard/AppointmentPreviewCard';

const LawyerOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);

  const {
    initialLoad,
    stats,
    upcomingAppointments,
    chatCount,
    quizCount,
    trialCount,
    recentActivities,
    quizStats,
    trialStats,
  } = useLawyerDashboard();

  if (initialLoad) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <WelcomeHeader userName={user?.name || 'Lawyer'} />

      {/* Appointment Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={stats.total}
          color="blue"
        />
        <StatCard icon={Clock} label="Scheduled" value={stats.scheduled} color="amber" />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completed}
          color="green"
        />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} color="red" />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={`₹${stats.revenue}`}
          color="emerald"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            actionNumber="1"
            title="View Appointments"
            description="Manage your schedule and upcoming sessions"
            buttonText="Open Schedule"
            onClick={() => navigate('/lawyer-dashboard/appointments')}
            delay="0s"
            iconType="users"
          />
          <QuickActionCard
            actionNumber="2"
            title="AI Assistant"
            description="Get AI-powered legal research and insights"
            buttonText="Open Chat"
            onClick={() => navigate('/lawyer-dashboard/chatbot')}
            delay="0.05s"
            iconType="chat"
          />
          <QuickActionCard
            actionNumber="3"
            title="Take Quiz"
            description="Test and sharpen your legal knowledge"
            buttonText="Start Quiz"
            onClick={() => navigate('/lawyer-dashboard/quiz')}
            delay="0.1s"
            iconType="award"
          />
          <QuickActionCard
            actionNumber="4"
            title="Mock Trials"
            description="Practice your advocacy and courtroom skills"
            buttonText="Join Trial"
            onClick={() => navigate('/lawyer-dashboard/mock-trials')}
            delay="0.15s"
            iconType="award"
          />
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-8 hover:shadow-lg transition-all duration-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
          <button
            onClick={() => navigate('/lawyer-dashboard/appointments')}
            className="text-amber-600 hover:text-amber-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>

        {upcomingAppointments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <AppointmentPreviewCard key={appointment._id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      {/* Activity Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">AI Chats</h3>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <MessageSquare className="text-indigo-600" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{chatCount}</p>
          <p className="text-sm text-slate-500 mt-1">Total conversations</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Quizzes</h3>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <BookOpen className="text-slate-600" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{quizCount}</p>
          <p className="text-sm text-slate-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Mock Trials</h3>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <Video className="text-teal-600" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{trialCount}</p>
          <p className="text-sm text-slate-500 mt-1">Participated</p>
        </div>
      </div>

      {/* Recent Activities & Stats */}
      <ActivityAndStats
        recentActivities={recentActivities}
        quizStats={quizStats}
        trialStats={trialStats}
        navigate={navigate}
      />
    </div>
  );
};

export default LawyerOverview;