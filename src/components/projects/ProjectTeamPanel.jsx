/**
 * ProjectTeamPanel.jsx
 * Team collaboration panel for projects
 *
 * Features:
 * - Add/remove team members
 * - Assign roles (PIC, Pilot, VO, etc.)
 * - Activity feed for project
 * - Quick contact actions
 *
 * @location src/components/projects/ProjectTeamPanel.jsx
 */

import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  MoreVertical,
  Crown,
  Shield,
  Eye,
  Plane,
  User,
  X,
  Check,
  ChevronDown,
  MessageSquare,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { getOperators } from '../../lib/firestore'
import { USER_ROLES, getRoleInfo } from '../../lib/userRoles'
import { logger } from '../../lib/logger'
import { useOrganization } from '../../hooks/useOrganization'

// Project-specific roles
const PROJECT_ROLES = {
  project_lead: {
    id: 'project_lead',
    name: 'Project Lead',
    description: 'Overall project responsibility',
    icon: Crown,
    color: 'bg-purple-100 text-purple-700'
  },
  pic: {
    id: 'pic',
    name: 'Pilot in Command',
    description: 'Flight operations authority',
    icon: Plane,
    color: 'bg-blue-100 text-blue-700'
  },
  pilot: {
    id: 'pilot',
    name: 'Pilot',
    description: 'Flight crew',
    icon: Plane,
    color: 'bg-sky-100 text-sky-700'
  },
  visual_observer: {
    id: 'visual_observer',
    name: 'Visual Observer',
    description: 'Maintains VLOS',
    icon: Eye,
    color: 'bg-teal-100 text-teal-700'
  },
  safety_officer: {
    id: 'safety_officer',
    name: 'Safety Officer',
    description: 'Safety oversight',
    icon: Shield,
    color: 'bg-green-100 text-green-700'
  },
  crew: {
    id: 'crew',
    name: 'Crew Member',
    description: 'General support',
    icon: User,
    color: 'bg-gray-100 text-gray-700'
  }
}

function TeamMemberCard({ member, projectRole, onRemove, onRoleChange, isLead }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const role = PROJECT_ROLES[projectRole] || PROJECT_ROLES.crew
  const RoleIcon = role.icon

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-aeria-navy text-white flex items-center justify-center font-medium">
        {member.firstName?.[0]?.toUpperCase() || member.name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : (member.name || 'Unknown')}</p>
          {isLead && <Crown className="w-4 h-4 text-amber-500" title="Project Lead" />}
        </div>
        <p className="text-sm text-gray-500 truncate">{member.email || 'No email'}</p>
      </div>

      {/* Role badge with dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${role.color}`}
        >
          <RoleIcon className="w-3 h-3" />
          {role.name}
          <ChevronDown className="w-3 h-3" />
        </button>

        {showRoleMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {Object.values(PROJECT_ROLES).map(r => {
                const Icon = r.icon
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      onRoleChange(member.id, r.id)
                      setShowRoleMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      projectRole === r.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.description}</p>
                    </div>
                    {projectRole === r.id && <Check className="w-4 h-4 text-green-500" />}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Contact actions */}
      <div className="flex items-center gap-1">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="Send email"
          >
            <Mail className="w-4 h-4 text-gray-500" />
          </a>
        )}
        {member.phone && (
          <a
            href={`tel:${member.phone}`}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="Call"
          >
            <Phone className="w-4 h-4 text-gray-500" />
          </a>
        )}
        <button
          onClick={() => onRemove(member.id)}
          className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
          title="Remove from project"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ProjectTeamPanel({ project, onUpdate }) {
  const { organizationId } = useOrganization()
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get current team from project
  const team = project?.team || []

  useEffect(() => {
    loadOperators()
  }, [organizationId])

  const loadOperators = async () => {
    if (!organizationId) return
    try {
      const data = await getOperators(organizationId)
      setOperators(data)
    } catch (err) {
      logger.error('Failed to load operators:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter out already added members
  const availableOperators = operators.filter(
    op => !team.some(tm => tm.operatorId === op.id)
  )

  // Filter by search
  const filteredOperators = searchTerm
    ? availableOperators.filter(op => {
        const fullName = `${op.firstName || ''} ${op.lastName || ''}`.trim().toLowerCase()
        return fullName.includes(searchTerm.toLowerCase()) ||
          (op.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      })
    : availableOperators

  const handleAddMember = (operator) => {
    const newMember = {
      operatorId: operator.id,
      name: `${operator.firstName || ''} ${operator.lastName || ''}`.trim() || operator.name,
      firstName: operator.firstName,
      lastName: operator.lastName,
      email: operator.email,
      phone: operator.phone,
      role: 'crew',
      addedAt: new Date().toISOString()
    }

    onUpdate({
      team: [...team, newMember]
    })

    setShowAddMember(false)
    setSearchTerm('')
  }

  const handleRemoveMember = (operatorId) => {
    onUpdate({
      team: team.filter(tm => tm.operatorId !== operatorId)
    })
  }

  const handleRoleChange = (operatorId, newRole) => {
    onUpdate({
      team: team.map(tm =>
        tm.operatorId === operatorId
          ? { ...tm, role: newRole }
          : tm
      )
    })
  }

  // Get full member data by combining team entry with operator data
  const getFullMemberData = (teamMember) => {
    const operator = operators.find(op => op.id === teamMember.operatorId)
    return {
      ...teamMember,
      ...operator,
      id: teamMember.operatorId
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-navy" />
            Project Team
          </h3>
          <button
            onClick={() => setShowAddMember(true)}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {team.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No team members assigned yet</p>
            <button
              onClick={() => setShowAddMember(true)}
              className="text-aeria-blue hover:underline mt-2"
            >
              Add your first team member
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {team.map((member, index) => (
              <TeamMemberCard
                key={member.operatorId}
                member={getFullMemberData(member)}
                projectRole={member.role}
                onRemove={handleRemoveMember}
                onRoleChange={handleRoleChange}
                isLead={member.role === 'project_lead'}
              />
            ))}
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Add Team Member</h3>
                <button
                  onClick={() => {
                    setShowAddMember(false)
                    setSearchTerm('')
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search crew members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:outline-none mb-4"
                  autoFocus
                />

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredOperators.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      {availableOperators.length === 0
                        ? 'All crew members are already on the team'
                        : 'No matching crew members found'}
                    </p>
                  ) : (
                    filteredOperators.map(operator => {
                      const fullName = `${operator.firstName || ''} ${operator.lastName || ''}`.trim()
                      return (
                        <button
                          key={operator.id}
                          onClick={() => handleAddMember(operator)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-aeria-navy text-white flex items-center justify-center font-medium">
                            {operator.firstName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {fullName || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {operator.roles?.join(', ') || 'Crew Member'}
                            </p>
                          </div>
                          <UserPlus className="w-5 h-5 text-gray-400" />
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Stats */}
      {team.length > 0 && (
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-3">Team Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-aeria-navy">{team.length}</p>
              <p className="text-xs text-gray-500">Team Members</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {team.filter(m => m.role === 'pic' || m.role === 'pilot').length}
              </p>
              <p className="text-xs text-gray-500">Pilots</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">
                {team.filter(m => m.role === 'visual_observer').length}
              </p>
              <p className="text-xs text-gray-500">Visual Observers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
