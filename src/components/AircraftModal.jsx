import { useState, useEffect } from 'react'
import Modal, { ModalFooter } from './Modal'
import { createAircraft, updateAircraft } from '../lib/firestore'
import { AlertCircle, Plane, Info, DollarSign } from 'lucide-react'

const categoryOptions = [
  { value: 'multirotor', label: 'Multirotor' },
  { value: 'fixed_wing', label: 'Fixed Wing' },
  { value: 'vtol', label: 'VTOL (Hybrid)' },
  { value: 'helicopter', label: 'Helicopter' },
  { value: 'other', label: 'Other' }
]

const statusOptions = [
  { value: 'airworthy', label: 'Airworthy' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'grounded', label: 'Grounded' },
  { value: 'retired', label: 'Retired' }
]

export default function AircraftModal({ isOpen, onClose, aircraft }) {
  const isEditing = !!aircraft

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    nickname: '',
    make: '',
    model: '',
    serialNumber: '',
    registration: '',
    category: 'multirotor',
    mtow: '',
    maxSpeed: '',
    maxAltitude: '',
    endurance: '',
    sensors: '',
    status: 'airworthy',
    purchaseDate: '',
    purchasePrice: '',
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: '',
    notes: ''
  })

  // Populate form when editing
  useEffect(() => {
    if (aircraft) {
      setFormData({
        nickname: aircraft.nickname || '',
        make: aircraft.make || '',
        model: aircraft.model || '',
        serialNumber: aircraft.serialNumber || '',
        registration: aircraft.registration || '',
        category: aircraft.category || 'multirotor',
        mtow: aircraft.mtow || '',
        maxSpeed: aircraft.maxSpeed || '',
        maxAltitude: aircraft.maxAltitude || '',
        endurance: aircraft.endurance || '',
        sensors: aircraft.sensors || '',
        status: aircraft.status || 'airworthy',
        purchaseDate: aircraft.purchaseDate || '',
        purchasePrice: aircraft.purchasePrice || '',
        hourlyRate: aircraft.hourlyRate || '',
        dailyRate: aircraft.dailyRate || '',
        weeklyRate: aircraft.weeklyRate || '',
        notes: aircraft.notes || ''
      })
    } else {
      resetForm()
    }
  }, [aircraft, isOpen])

  const resetForm = () => {
    setFormData({
      nickname: '',
      make: '',
      model: '',
      serialNumber: '',
      registration: '',
      category: 'multirotor',
      mtow: '',
      maxSpeed: '',
      maxAltitude: '',
      endurance: '',
      sensors: '',
      status: 'airworthy',
      purchaseDate: '',
      purchasePrice: '',
      hourlyRate: '',
      dailyRate: '',
      weeklyRate: '',
      notes: ''
    })
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!formData.nickname.trim()) throw new Error('Nickname is required')
      if (!formData.make.trim()) throw new Error('Make is required')
      if (!formData.model.trim()) throw new Error('Model is required')

      // Convert numeric fields
      const aircraftData = {
        ...formData,
        mtow: formData.mtow ? parseFloat(formData.mtow) : null,
        maxSpeed: formData.maxSpeed ? parseFloat(formData.maxSpeed) : null,
        maxAltitude: formData.maxAltitude ? parseFloat(formData.maxAltitude) : null,
        endurance: formData.endurance ? parseFloat(formData.endurance) : null,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null
      }

      if (isEditing) {
        await updateAircraft(aircraft.id, aircraftData)
      } else {
        await createAircraft(aircraftData)
      }

      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isEditing ? 'Edit Aircraft' : 'Add Aircraft'} 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Aircraft Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nickname <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Blue Bird, M300-01"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Make <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                className="input"
                placeholder="e.g., DJI, senseFly, Freefly"
              />
            </div>
            <div>
              <label className="label">Model <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Matrice 300 RTK"
              />
            </div>
            <div>
              <label className="label">Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="input font-mono"
                placeholder="Manufacturer serial number"
              />
            </div>
            <div>
              <label className="label">Registration</label>
              <input
                type="text"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                className="input font-mono"
                placeholder="e.g., C-XXXX (if registered)"
              />
            </div>
          </div>
        </div>

        {/* Performance Specs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Performance Specifications</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Used for SORA calculations
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">MTOW (kg)</label>
              <input
                type="number"
                name="mtow"
                value={formData.mtow}
                onChange={handleChange}
                className="input"
                placeholder="Maximum takeoff weight"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="label">Max Speed (m/s)</label>
              <input
                type="number"
                name="maxSpeed"
                value={formData.maxSpeed}
                onChange={handleChange}
                className="input"
                placeholder="Maximum cruise speed"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="label">Max Altitude AGL (m)</label>
              <input
                type="number"
                name="maxAltitude"
                value={formData.maxAltitude}
                onChange={handleChange}
                className="input"
                placeholder="Maximum operating altitude"
                step="1"
                min="0"
              />
            </div>
            <div>
              <label className="label">Endurance (minutes)</label>
              <input
                type="number"
                name="endurance"
                value={formData.endurance}
                onChange={handleChange}
                className="input"
                placeholder="Typical flight time"
                step="1"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Sensors/Payloads */}
        <div>
          <label className="label">Sensors / Payloads</label>
          <textarea
            name="sensors"
            value={formData.sensors}
            onChange={handleChange}
            className="input min-h-[80px]"
            placeholder="e.g., Zenmuse H20T, L1 LiDAR, MicaSense RedEdge..."
          />
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input w-48"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Purchase Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Purchase Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Purchase Price ($)</label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Billing Rates */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Billing Rates
            <span className="text-xs font-normal text-gray-500">(for cost estimation)</span>
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="label">Daily Rate ($)</label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="label">Weekly Rate ($)</label>
              <input
                type="number"
                name="weeklyRate"
                value={formData.weeklyRate}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input min-h-[80px]"
            placeholder="Any additional notes about this aircraft..."
          />
        </div>

        <ModalFooter>
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Aircraft'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
