import React from 'react';
import { Search, Filter, ArrowDownUp } from 'lucide-react';
import { SORT_OPTIONS } from '../../constants/appointment.constants';

interface SearchAndFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    filterSpec: string;
    onFilterChange: (value: string) => void;
    specializations: string[];
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    filterSpec,
    onFilterChange,
    specializations,
}) => {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <Filter className="h-5 w-5 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-900">Search & Filter</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search name or specialty..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 font-medium text-slate-700 bg-white hover:border-amber-500/30"
                    />
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                </div>

                {/* Filter by Specialization */}
                <div className="relative">
                    <select
                        value={filterSpec}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="appearance-none bg-white border-2 border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 hover:border-amber-500/30 cursor-pointer"
                    >
                        <option value="">All Specializations</option>
                        {specializations.map((spec) => (
                            <option key={spec} value={spec}>
                                {spec}
                            </option>
                        ))}
                    </select>
                    <Filter
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="appearance-none bg-white border-2 border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 hover:border-amber-500/30 cursor-pointer"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ArrowDownUp
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchAndFilterBar;