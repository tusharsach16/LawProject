import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
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
import ActionCard from '../components/lawyerDashboard/ActionCard';
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
          icon={DollarSign}
          label="Revenue"
          value={`$${stats.revenue}`}
          color="emerald"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ActionCard
          icon={Calendar}
          title="View Appointments"
          description="Manage your schedule"
          onClick={() => navigate('/lawyer-dashboard/appointments')}
          gradient="from-blue-500 to-blue-600"
        />
        <ActionCard
          icon={MessageSquare}
          title="AI Assistant"
          description="Legal research help"
          onClick={() => navigate('/lawyer-dashboard/chatbot')}
          gradient="from-purple-500 to-purple-600"
        />
        <ActionCard
          icon={BookOpen}
          title="Take Quiz"
          description="Test your knowledge"
          onClick={() => navigate('/lawyer-dashboard/quiz')}
          gradient="from-amber-500 to-amber-600"
        />
        <ActionCard
          icon={Video}
          title="Mock Trials"
          description="Practice your skills"
          onClick={() => navigate('/lawyer-dashboard/mock-trials')}
          gradient="from-green-500 to-green-600"
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">AI Chats</h3>
            <MessageSquare className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{chatCount}</p>
          <p className="text-sm text-slate-500 mt-1">Total conversations</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Quizzes</h3>
            <BookOpen className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{quizCount}</p>
          <p className="text-sm text-slate-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Mock Trials</h3>
            <Video className="text-green-500" size={20} />
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