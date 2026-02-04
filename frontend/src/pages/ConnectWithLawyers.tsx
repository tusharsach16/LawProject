import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Sparkles, Loader2, Users, AlertCircle, Calendar } from 'lucide-react';
import { useLawyerSearch, useSpecializations, usePendingPaymentCount } from '../hooks/useLawyers';
import LawyerCard from '../components/LawyerCard';
import SearchAndFilterBar from '../components/lawyers/SearchAndFilterBar';
import PendingPaymentAlert from '../components/lawyers/PendingPaymentAlert';

const ConnectWithLawyers: React.FC = () => {
  const {
    lawyers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterSpec,
    setFilterSpec,
    clearFilters,
  } = useLawyerSearch();

  const { specializations } = useSpecializations();
  const { pendingPaymentCount } = usePendingPaymentCount();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg">
            <Scale size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
              Talk to Lawyer
              <Sparkles className="h-7 w-7 text-amber-500" />
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Connect with experienced legal professionals for expert advice.
            </p>
          </div>
          <Link
            to="/dashboard/user-appointments"
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-amber-600 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
          >
            <Calendar size={18} />
            <span className="hidden sm:inline">My Appointments</span>
          </Link>
        </div>
      </header>

      {/* Pending Payment Alert */}
      <PendingPaymentAlert count={pendingPaymentCount} />

      {/* Search and Filter */}
      <SearchAndFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterSpec={filterSpec}
        onFilterChange={setFilterSpec}
        specializations={specializations}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading lawyers...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Lawyers</h3>
          <p className="text-slate-600 text-center max-w-md mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Lawyers Grid */}
      {!loading && !error && (
        <>
          {/* Results count */}
          {lawyers.length > 0 && (
            <div className="mb-4 text-sm text-slate-600">
              Found <span className="font-bold text-slate-900">{lawyers.length}</span> lawyer
              {lawyers.length !== 1 ? 's' : ''}
              {(searchTerm || filterSpec) && (
                <button
                  onClick={clearFilters}
                  className="ml-3 text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.length > 0 ? (
              lawyers.map((lawyer, index) => (
                <div
                  key={lawyer._id}
                  style={{
                    animation: `slideInCase 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <LawyerCard lawyer={lawyer} />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-12 w-12 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Lawyers Found</h3>
                <p className="text-slate-600 text-center max-w-md mb-4">
                  {searchTerm || filterSpec
                    ? 'No lawyers found matching your criteria. Try adjusting your search or filters.'
                    : 'No lawyers available at the moment. Please check back later.'}
                </p>
                {(searchTerm || filterSpec) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInCase {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ConnectWithLawyers;