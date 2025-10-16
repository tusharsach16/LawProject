import { Link } from 'react-router-dom';
import { Book, Briefcase, Star, MapPin, Users, Heart, BadgeCheck } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

interface ProfileDetailsProps {
  user: UserProfile;
}

const ProfileDetails = ({ user }: ProfileDetailsProps) => {
  return (
    <div className="mt-6 pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      {user.location && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-blue-600" />
          </div>
          <span className="text-slate-700 font-medium">{user.location}</span>
        </div>
      )}
      
      <Link 
        to="/dashboard/connections" 
        className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md hover:scale-105 transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-emerald-600" />
        </div>
        <span className="text-slate-700">
          <span className="font-bold text-slate-900">{user.friends?.length || 0}</span> Connections
        </span>
      </Link>

      {/* Law Student Details */}
      {user.role === 'lawstudent' && user.roleData && (
        <>
          {user.roleData.collegeName && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 sm:col-span-2 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Book size={18} className="text-purple-600" />
              </div>
              <span className="text-slate-700 font-medium">{user.roleData.collegeName}</span>
            </div>
          )}
          {user.roleData.areaOfInterest && user.roleData.areaOfInterest.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 sm:col-span-2 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Star size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-600 uppercase mb-1">Area of Interest</div>
                <span className="text-slate-700 font-medium">
                  {Array.isArray(user.roleData.areaOfInterest) ? user.roleData.areaOfInterest.join(', ') : user.roleData.areaOfInterest}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lawyer Details */}
      {user.role === 'lawyer' && user.roleData && (
        <>
          {user.roleData.experience > 0 && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Briefcase size={18} className="text-indigo-600" />
              </div>
              <span className="text-slate-700 font-medium">{user.roleData.experience} years experience</span>
            </div>
          )}
          {user.roleData.licenseNumber && (
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <BadgeCheck size={18} className="text-cyan-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-cyan-600 uppercase">License</div>
                <span className="text-slate-700 font-medium">{user.roleData.licenseNumber}</span>
              </div>
            </div>
          )}
          {user.roleData.specialization?.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 sm:col-span-2 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Star size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-600 uppercase mb-1">Specialization</div>
                <span className="text-slate-700 font-medium">{user.roleData.specialization.join(', ')}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* General User Interests */}
      {user.role === 'general' && user.roleData && user.roleData.interests?.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 sm:col-span-2 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-rose-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-rose-600 uppercase mb-1">Interests</div>
            <span className="text-slate-700 font-medium">{user.roleData.interests.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;