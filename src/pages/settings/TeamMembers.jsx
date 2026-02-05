/**
 * TeamMembers.jsx
 * Team management page for inviting members and managing roles
 *
 * @location src/pages/settings/TeamMembers.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'
import {
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
  suspendMember,
  reactivateMember,
  ORGANIZATION_ROLES,
  ROLE_HIERARCHY
} from '../../lib/firestoreOrganizations'
import { getOperator } from '../../lib/firestore'
import InviteMemberModal from '../../components/settings/InviteMemberModal'
import EditMemberModal from '../../components/settings/EditMemberModal'
import RoleSelector from '../../components/settings/RoleSelector'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Loader2,
  AlertCircle,
  Check,
  X,
  Clock,
  UserX,
  RefreshCw,
  Pencil
} from 'lucide-react'

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  management: 'bg-blue-100 text-blue-800',
  operator: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-600'
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  invited: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800'
}

export default function TeamMembers() {
  const { organization, organizationId, membership, canManageTeam, canManageMember, refreshMemberships } = useOrganization()
  const { user } = useAuth()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const [processing, setProcessing] = useState(null)

  const loadMembers = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    try {
      const memberList = await getOrganizationMembers(organizationId)

      // Fetch user details for each member
      const membersWithDetails = await Promise.all(
        memberList.map(async (member) => {
          let userDetails = null
          if (member.userId) {
            try {
              userDetails = await getOperator(member.userId)
            } catch {
              // User may not exist in operators collection
            }
          }
          return {
            ...member,
            userDetails
          }
        })
      )

      setMembers(membersWithDetails)
    } catch (err) {
      console.error('Error loading members:', err)
      setError(err.message || 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleRoleChange = async (memberId, newRole) => {
    setProcessing(memberId)
    try {
      await updateMemberRole(memberId, newRole, user?.uid)
      await loadMembers()
    } catch (err) {
      console.error('Error updating role:', err)
      setError(err.message || 'Failed to update role')
    } finally {
      setProcessing(null)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member from the organization?')) return

    setProcessing(memberId)
    try {
      await removeMember(memberId)
      await loadMembers()
    } catch (err) {
      console.error('Error removing member:', err)
      setError(err.message || 'Failed to remove member')
    } finally {
      setProcessing(null)
      setActionMenuOpen(null)
    }
  }

  const handleSuspendMember = async (memberId) => {
    setProcessing(memberId)
    try {
      await suspendMember(memberId)
      await loadMembers()
    } catch (err) {
      console.error('Error suspending member:', err)
      setError(err.message || 'Failed to suspend member')
    } finally {
      setProcessing(null)
      setActionMenuOpen(null)
    }
  }

  const handleReactivateMember = async (memberId) => {
    setProcessing(memberId)
    try {
      await reactivateMember(memberId)
      await loadMembers()
    } catch (err) {
      console.error('Error reactivating member:', err)
      setError(err.message || 'Failed to reactivate member')
    } finally {
      setProcessing(null)
      setActionMenuOpen(null)
    }
  }

  const handleInviteSuccess = () => {
    setShowInviteModal(false)
    loadMembers()
  }

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setShowEditModal(true)
    setActionMenuOpen(null)
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setSelectedMember(null)
    loadMembers()
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No organization found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Users className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500">
              {members.length} member{members.length !== 1 ? 's' : ''} in {organization.name}
            </p>
          </div>
        </div>

        {canManageTeam && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-aeria-navy animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No team members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => {
              const isCurrentUser = member.userId === user?.uid
              const canManage = canManageMember(member.role) && !isCurrentUser

              return (
                <div
                  key={member.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-aeria-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.userDetails?.firstName?.[0] ||
                         member.email?.[0]?.toUpperCase() ||
                         '?'}
                      </span>
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.userDetails
                            ? `${member.userDetails.firstName} ${member.userDetails.lastName}`
                            : member.email}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3 h-3" />
                        {member.email || member.userDetails?.email || 'No email'}
                      </div>
                      {(member.jobTitle || member.department) && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {member.jobTitle}{member.jobTitle && member.department && ' • '}{member.department}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[member.status] || STATUS_COLORS.active}`}>
                      {member.status === 'invited' && <Clock className="w-3 h-3 inline mr-1" />}
                      {member.status}
                    </span>

                    {/* Role Badge/Selector */}
                    {canManage && member.status === 'active' ? (
                      <RoleSelector
                        currentRole={member.role}
                        onChange={(newRole) => handleRoleChange(member.id, newRole)}
                        disabled={processing === member.id}
                        excludeRoles={['admin']}
                      />
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${ROLE_COLORS[member.role] || ROLE_COLORS.operator}`}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        {member.role}
                      </span>
                    )}

                    {/* Actions Menu */}
                    {canManage && (
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === member.id ? null : member.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={processing === member.id}
                        >
                          {processing === member.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          ) : (
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {actionMenuOpen === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => handleEditMember(member)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit Details
                              </button>
                              {member.status === 'suspended' ? (
                                <button
                                  onClick={() => handleReactivateMember(member.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSuspendMember(member.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserX className="w-4 h-4" />
                                  Suspend
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Role Permissions Info */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {ROLE_HIERARCHY.map((role) => (
            <div key={role} className="space-y-1">
              <p className={`font-medium capitalize px-2 py-1 rounded inline-block ${ROLE_COLORS[role]}`}>
                {role}
              </p>
              <ul className="text-gray-600 text-xs space-y-0.5">
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" /> View data
                </li>
                {['admin', 'management', 'operator'].includes(role) && (
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" /> Create/Edit
                  </li>
                )}
                {['admin', 'management'].includes(role) && (
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" /> Delete
                  </li>
                )}
                {['admin', 'management'].includes(role) && (
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" /> Approve
                  </li>
                )}
                {['admin'].includes(role) && (
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" /> Manage team
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
          organizationId={organizationId}
        />
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <EditMemberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedMember(null)
          }}
          member={selectedMember}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
