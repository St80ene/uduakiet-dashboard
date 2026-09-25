import { useState, useMemo } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Mail,
  Shield,
  Store,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import type { IUser } from '@/interfaces/user.interface';
import type { UsersResponse } from '@/types';
import { UserRole } from '@/enum/role';
import useDebouncedValue from '@/hooks/debounceHook';
import { usersService } from '@/services/user/api/users.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

export const UsersPage = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);

  // Search & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // Fetch users
  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<UsersResponse>({
      queryKey: [
        'users',
        {
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          order: sortOrder,
        },
      ],
      queryFn: () =>
        usersService.getAll({
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          order: sortOrder,
        }),
      placeholderData: (previousData) => previousData,
    });

  const users = data?.users ?? [];

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  // Reset pagination when searching
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      {
        key: 'user',
        header: 'User / Employee',
        width: '30%',
        render: (user: IUser) => (
          <div className="flex items-center gap-3">
            {user.profile_picture?.url ? (
              <img
                src={user.profile_picture.url}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold text-xs shrink-0">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
            )}

            <div className="min-w-0">
              <div className="font-semibold text-slate-800 line-clamp-1">
                {user.first_name} {user.last_name}
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{user.company_email}</span>
              </div>
            </div>
          </div>
        ),
      },

      {
        key: 'role',
        header: 'Role',
        width: '20%',
        render: (user: IUser) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />

            <span>{user.role?.name || user.role_id}</span>
          </div>
        ),
      },

      {
        key: 'assigned_store',
        header: 'Assigned Store',
        width: '20%',
        render: (user: IUser) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Store className="w-3.5 h-3.5 text-slate-400" />

            <span>{user.store?.name || 'All Locations'}</span>
          </div>
        ),
      },

      {
        key: 'status',
        header: 'Status',
        width: '15%',
        render: (user: IUser) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {user.is_active ? 'Active' : 'Disabled'}
          </span>
        ),
      },

      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        width: '15%',
        cellClassName: 'text-right',
        render: (user: IUser) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={`Edit ${user.first_name}`}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label={`Disable ${user.first_name}`}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return <LoadingScreen label="Fetching staff users..." />;
  }

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load users"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading user records.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Control access permissions and store assignments.
          </p>
        </div>

        <button
          type="button"
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5 text-sm font-semibold text-white
            bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs
            transition-colors duration-150
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-slate-900
            focus-visible:ring-offset-2
            cursor-pointer shrink-0
          "
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Users
          </p>

          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.meta?.totalItems ?? users.length}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Active Users
          </p>

          <p className="text-xl font-bold text-slate-900 mt-1">
            {users.filter((user) => user.is_active).length}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Administrators
          </p>

          <p className="text-xl font-bold text-slate-900 mt-1">
            {
              users.filter(
                (user) =>
                  user.role?.name === UserRole.ADMIN ||
                  user.role?.name === UserRole.SUPER_ADMIN,
              ).length
            }
          </p>
        </div>
      </div>

      {/* Users table */}
      <DataTable<IUser>
        records={users}
        columns={columns}
        meta={data?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: IUser) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <UsersIcon className="w-7 h-7 text-slate-400" />,
          title: 'No staff users found',
          description:
            'Invite users to give team members access to stores and inventory.',
        }}
        header={
          <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <label htmlFor="user-search" className="sr-only">
                Search Users
              </label>

              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

              <input
                id="user-search"
                type="search"
                placeholder="Search staff by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="
                  w-full pl-9 pr-3 py-1.5 text-xs font-normal
                  text-slate-800 placeholder:text-slate-400
                  bg-slate-50/50 border border-slate-200
                  rounded-lg outline-none focus:bg-white
                  focus:ring-2 focus:ring-slate-300
                  focus:border-slate-300 transition-all
                "
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
                <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Sort by:
                </span>

                <select
                  aria-label="Select sort field"
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer pr-1"
                >
                  <option value="created_at">Date Created</option>
                  <option value="updated_at">Date Updated</option>
                  <option value="first_name">Name</option>
                  <option value="company_email">Email</option>
                </select>

                <button
                  type="button"
                  onClick={toggleSortOrder}
                  aria-label={`Sort direction ${sortOrder}`}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-600 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default UsersPage;
