import { Badge } from '@workspace/ui/components/badge';
import { DataTable } from '@workspace/ui/components/data-table';
import { Spinner } from '@workspace/ui/components/spinner';
import type { DataTableColumns } from '@workspace/ui/lib/data-table-utils';
import { useUpdateUser, useUsers } from 'queries/users';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserRole, UserRow } from 'queries/users';

const ROLE_VARIANT: Record<UserRow['role'], 'destructive' | 'default' | 'secondary'> = {
  admin: 'destructive',
  user: 'default',
  public: 'secondary',
};

interface RoleCellProps {
  user: UserRow;
  updatingId: string | null;
  onUpdateRole: (id: string, role: UserRole) => void;
}

function RoleCell({ user: userRow, updatingId, onUpdateRole }: RoleCellProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={ROLE_VARIANT[userRow.role]}>{userRow.role}</Badge>
      <select
        value={userRow.role}
        disabled={updatingId === userRow.id}
        onChange={(e) => onUpdateRole(userRow.id, e.target.value as UserRow['role'])}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="public">public</option>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </div>
  );
}

export function AdminUsersPage(): React.JSX.Element {
  const { t } = useTranslation();
  const usersQuery = useUsers();
  const updateUser = useUpdateUser();
  const updatingId = updateUser.isPending ? updateUser.variables.id : null;

  const columns = useMemo<DataTableColumns<UserRow>>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.users.columns.name', 'Name'),
        align: 'left',
      },
      {
        accessorKey: 'email',
        header: t('admin.users.columns.email', 'Email'),
        align: 'left',
      },
      {
        accessorKey: 'role',
        header: t('admin.users.columns.role', 'Role'),
        align: 'left',
        cell: ({ row }) => (
          <RoleCell
            user={row.original}
            updatingId={updatingId}
            onUpdateRole={(id, role) => updateUser.mutate({ id, role })}
          />
        ),
      },
      {
        accessorKey: 'emailVerified',
        header: t('admin.users.columns.verified', 'Verified'),
        cell: ({ getValue }) => (
          <Badge variant={getValue<boolean>() ? 'default' : 'secondary'}>
            {getValue<boolean>() ? 'yes' : 'no'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.users.columns.created', 'Created'),
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          if (!value) return '—';
          return new Date(value).toLocaleDateString('en-GB');
        },
      },
    ],
    [t, updatingId, updateUser],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t('admin.pages.users.title', 'Users')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {t('admin.pages.users.subtitle', 'Manage accounts and roles')}
      </p>

      {usersQuery.error ? (
        <p className="mb-4 text-sm text-destructive">
          {usersQuery.error instanceof Error ? usersQuery.error.message : 'Failed to load users'}
        </p>
      ) : null}

      {usersQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      ) : (
        <DataTable
          data={usersQuery.data ?? []}
          columns={columns}
          emptyMessage={t('admin.users.empty', 'No users found')}
        />
      )}
    </div>
  );
}
