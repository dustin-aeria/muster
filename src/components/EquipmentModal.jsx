// ============================================
// EQUIPMENT MODAL
// Dynamic form with category-specific fields
// ============================================

import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Modal, { ModalFooter } from './Modal'
import {
  createEquipment,
  updateEquipment,
  EQUIPMENT_CATEGORIES
} from '../lib/firestore'
import { useOrganization } from '../hooks/useOrganization'
import { uploadEquipmentImage, deleteEquipmentImage } from '../lib/storageHelpers'
import {
  AlertCircle,
  Package,
  Info,
  MapPin,
  Target,
  Camera,
  Shield,
  Truck,
  Zap,
  Radio,
  Briefcase,
  Calendar,
  DollarSign,
  Wrench,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'

// ============================================
// CATEGORY ICONS
// ============================================
const categoryIcons = {
  positioning: MapPin,
  ground_control: Target,
  payloads: Camera,
  safety: Shield,
  vehicles: Truck,
  power: Zap,
  communication: Radio,
  support: Briefcase,
  rpas: Package,
  other: Package
}

// ============================================
// STATUS OPTIONS
// ============================================
const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'retired', label: 'Retired' }
]

// ============================================
// CATEGORY-SPECIFIC FIELD DEFINITIONS
// ============================================
const categoryFields = {
  positioning: [
    { name: 'accuracy', label: 'Accuracy', type: 'text', placeholder: 'e.g., 1cm + 1ppm horizontal' },
    { name: 'frequencyBands', label: 'Frequency Bands', type: 'text', placeholder: 'e.g., L1/L2/L5' },
    { name: 'rtkCapable', label: 'RTK Capable', type: 'checkbox' },
    { name: 'constellations', label: 'Constellations', type: 'text', placeholder: 'e.g., GPS, GLONASS, Galileo, BeiDou' }
  ],
  ground_control: [
    { name: 'targetType', label: 'Target Type', type: 'select', options: [
      { value: 'gcp', label: 'Ground Control Point (GCP)' },
      { value: 'checkPoint', label: 'Check Point' },
      { value: 'calibration', label: 'Calibration Target' },
      { value: 'scale', label: 'Scale Bar' }
    ]},
    { name: 'targetSize', label: 'Target Size', type: 'text', placeholder: 'e.g., 60cm x 60cm' },
    { name: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Vinyl, Painted plywood' },
    { name: 'pattern', label: 'Pattern', type: 'text', placeholder: 'e.g., Checkerboard, Cross' }
  ],
  payloads: [
    { name: 'sensorType', label: 'Sensor Type', type: 'select', options: [
      { value: 'rgb', label: 'RGB Camera' },
      { value: 'thermal', label: 'Thermal Camera' },
      { value: 'multispectral', label: 'Multispectral' },
      { value: 'hyperspectral', label: 'Hyperspectral' },
      { value: 'lidar', label: 'LiDAR' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'resolution', label: 'Resolution', type: 'text', placeholder: 'e.g., 45MP, 640x512' },
    { name: 'weight', label: 'Weight (g)', type: 'number', placeholder: 'Weight in grams' },
    { name: 'fov', label: 'Field of View', type: 'text', placeholder: 'e.g., 84° HFOV' },
    { name: 'compatibleAircraft', label: 'Compatible Aircraft', type: 'text', placeholder: 'e.g., M300 RTK, M350' }
  ],
  safety: [
    { name: 'safetyType', label: 'Equipment Type', type: 'select', options: [
      { value: 'fireExtinguisher', label: 'Fire Extinguisher' },
      { value: 'firstAid', label: 'First Aid Kit' },
      { value: 'ppe', label: 'PPE' },
      { value: 'cones', label: 'Cones/Barriers' },
      { value: 'signage', label: 'Signage' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
    { name: 'certificationRequired', label: 'Certification Required', type: 'checkbox' },
    { name: 'certificationDate', label: 'Last Certification', type: 'date' },
    { name: 'capacity', label: 'Capacity/Size', type: 'text', placeholder: 'e.g., 5lb, 50-person' }
  ],
  vehicles: [
    { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: [
      { value: 'truck', label: 'Truck' },
      { value: 'suv', label: 'SUV' },
      { value: 'trailer', label: 'Trailer' },
      { value: 'atv', label: 'ATV/UTV' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'vin', label: 'VIN', type: 'text', placeholder: 'Vehicle Identification Number' },
    { name: 'licensePlate', label: 'License Plate', type: 'text', placeholder: 'Plate number' },
    { name: 'capacity', label: 'Capacity', type: 'text', placeholder: 'e.g., 1500kg payload' },
    { name: 'fuelType', label: 'Fuel Type', type: 'select', options: [
      { value: 'gasoline', label: 'Gasoline' },
      { value: 'diesel', label: 'Diesel' },
      { value: 'electric', label: 'Electric' },
      { value: 'hybrid', label: 'Hybrid' }
    ]},
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' }
  ],
  power: [
    { name: 'powerType', label: 'Power Type', type: 'select', options: [
      { value: 'generator', label: 'Generator' },
      { value: 'powerStation', label: 'Power Station' },
      { value: 'charger', label: 'Battery Charger' },
      { value: 'inverter', label: 'Inverter' },
      { value: 'solarPanel', label: 'Solar Panel' }
    ]},
    { name: 'outputWattage', label: 'Output Wattage', type: 'number', placeholder: 'Watts' },
    { name: 'batteryCapacity', label: 'Battery Capacity (Wh)', type: 'number', placeholder: 'Watt-hours' },
    { name: 'inputVoltage', label: 'Input Voltage', type: 'text', placeholder: 'e.g., 120V AC' },
    { name: 'outputVoltage', label: 'Output Voltage', type: 'text', placeholder: 'e.g., 12V DC, 120V AC' },
    { name: 'portTypes', label: 'Port Types', type: 'text', placeholder: 'e.g., USB-C, USB-A, AC, DC' }
  ],
  communication: [
    { name: 'commType', label: 'Communication Type', type: 'select', options: [
      { value: 'radio', label: 'Two-Way Radio' },
      { value: 'satellite', label: 'Satellite Communicator' },
      { value: 'cellular', label: 'Cellular Booster' },
      { value: 'intercom', label: 'Intercom System' }
    ]},
    { name: 'frequencyRange', label: 'Frequency Range', type: 'text', placeholder: 'e.g., UHF 400-470MHz' },
    { name: 'channels', label: 'Channels', type: 'number', placeholder: 'Number of channels' },
    { name: 'range', label: 'Range', type: 'text', placeholder: 'e.g., 5km line of sight' },
    { name: 'encryption', label: 'Encryption', type: 'checkbox' },
    { name: 'batteryLife', label: 'Battery Life (hours)', type: 'number', placeholder: 'Hours' }
  ],
  support: [
    { name: 'supportType', label: 'Support Type', type: 'select', options: [
      { value: 'tripod', label: 'Tripod/Mount' },
      { value: 'case', label: 'Case/Container' },
      { value: 'tools', label: 'Tools' },
      { value: 'cables', label: 'Cables/Adapters' },
      { value: 'accessories', label: 'Accessories' }
    ]},
    { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 60x40x30 cm' },
    { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'Weight in kg', step: '0.1' },
    { name: 'compatibility', label: 'Compatible With', type: 'text', placeholder: 'e.g., M300 RTK, Zenmuse series' },
    { name: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Carbon fiber, Pelican case' }
  ]
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function EquipmentModal({ isOpen, onClose, equipment }) {
  const isEditing = !!equipment
  const fileInputRef = useRef(null)
  const { organizationId } = useOrganization()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    category: 'support',
    subcategory: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    payoffInterval: '', // Days of use to pay off equipment
    status: 'available',
    condition: '',
    notes: '',

    // Billing rates (for cost estimator)
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: '',

    // Maintenance & Usage
    trackMaintenance: true, // Toggle for maintenance tracking
    currentHours: '',
    currentCycles: '',
    maintenanceInterval: '',
    lastServiceDate: '',
    nextServiceDate: '',

    // Custom fields (category-specific)
    customFields: {}
  })

  // Populate form when editing
  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        category: equipment.category || 'support',
        subcategory: equipment.subcategory || '',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || '',
        purchaseDate: equipment.purchaseDate || '',
        purchasePrice: equipment.purchasePrice || '',
        payoffInterval: equipment.payoffInterval || '',
        status: equipment.status || 'available',
        condition: equipment.condition || '',
        notes: equipment.notes || '',
        hourlyRate: equipment.hourlyRate || '',
        dailyRate: equipment.dailyRate || '',
        weeklyRate: equipment.weeklyRate || '',
        trackMaintenance: equipment.trackMaintenance !== false, // Default true for backwards compat
        currentHours: equipment.currentHours || '',
        currentCycles: equipment.currentCycles || '',
        maintenanceInterval: equipment.maintenanceInterval || '',
        lastServiceDate: equipment.lastServiceDate || '',
        nextServiceDate: equipment.nextServiceDate || '',
        customFields: equipment.customFields || {}
      })
      // Set existing image preview
      if (equipment.imageUrl) {
        setImagePreview(equipment.imageUrl)
      }
    } else {
      resetForm()
    }
  }, [equipment, isOpen])

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'support',
      subcategory: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      payoffInterval: '',
      status: 'available',
      condition: '',
      notes: '',
      hourlyRate: '',
      dailyRate: '',
      weeklyRate: '',
      trackMaintenance: true,
      currentHours: '',
      currentCycles: '',
      maintenanceInterval: '',
      lastServiceDate: '',
      nextServiceDate: '',
      customFields: {}
    })
    setError('')
    setImageFile(null)
    setImagePreview(null)
  }

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Maximum size is 10MB.')
      return
    }

    setImageFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCustomFieldChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [name]: type === 'checkbox' ? checked : value
      }
    }))
  }

  // Auto-calculate next service date when interval or last service changes
  useEffect(() => {
    if (formData.maintenanceInterval && formData.lastServiceDate) {
      const lastService = new Date(formData.lastServiceDate)
      const interval = parseInt(formData.maintenanceInterval, 10)
      if (!isNaN(interval) && interval > 0) {
        lastService.setDate(lastService.getDate() + interval)
        setFormData(prev => ({
          ...prev,
          nextServiceDate: lastService.toISOString().split('T')[0]
        }))
      }
    }
  }, [formData.maintenanceInterval, formData.lastServiceDate])

  // Auto-calculate billing rates when purchase price or payoff interval changes
  useEffect(() => {
    const price = parseFloat(formData.purchasePrice)
    const days = parseFloat(formData.payoffInterval)

    if (price > 0 && days > 0) {
      // Calculate rates based on payoff interval in days
      const dailyRate = (price / days).toFixed(2)
      const hourlyRate = (price / (days * 8)).toFixed(2) // Assuming 8-hour workday
      const weeklyRate = ((price / days) * 7).toFixed(2) // 7 days per week

      setFormData(prev => ({
        ...prev,
        hourlyRate,
        dailyRate,
        weeklyRate
      }))
    }
  }, [formData.purchasePrice, formData.payoffInterval])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) throw new Error('Name is required')
      if (!formData.category) throw new Error('Category is required')

      // Prepare data
      const equipmentData = {
        ...formData,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        payoffInterval: formData.payoffInterval ? parseFloat(formData.payoffInterval) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        trackMaintenance: formData.trackMaintenance,
        currentHours: formData.trackMaintenance && formData.currentHours ? parseFloat(formData.currentHours) : null,
        currentCycles: formData.trackMaintenance && formData.currentCycles ? parseInt(formData.currentCycles, 10) : null,
        maintenanceInterval: formData.trackMaintenance && formData.maintenanceInterval ? parseInt(formData.maintenanceInterval, 10) : null
      }

      let equipmentId = equipment?.id

      if (isEditing) {
        await updateEquipment(equipmentId, equipmentData)
      } else {
        const newEquipment = await createEquipment(equipmentData, organizationId)
        equipmentId = newEquipment.id
      }

      // Handle image upload if there's a new file
      if (imageFile && equipmentId) {
        setUploadingImage(true)
        try {
          const uploadResult = await uploadEquipmentImage(imageFile, equipmentId)
          await updateEquipment(equipmentId, {
            imageUrl: uploadResult.url,
            imagePath: uploadResult.path
          })
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr)
          // Don't fail the whole operation, equipment is saved
        }
        setUploadingImage(false)
      }

      // Handle image removal (if editing and image was removed)
      if (isEditing && equipment.imagePath && !imagePreview) {
        try {
          await deleteEquipmentImage(equipment.imagePath)
          await updateEquipment(equipmentId, {
            imageUrl: null,
            imagePath: null
          })
        } catch (deleteErr) {
          console.error('Image delete failed:', deleteErr)
        }
      }

      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Get current category config
  const currentCategory = EQUIPMENT_CATEGORIES[formData.category]
  const currentCategoryFields = categoryFields[formData.category] || []
  const CategoryIcon = categoryIcons[formData.category] || Package

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Equipment' : 'Add Equipment'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="label">Category <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => {
              const Icon = categoryIcons[key]
              const isSelected = formData.category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: key, customFields: {} }))}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-aeria-navy bg-aeria-sky/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-aeria-navy' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${isSelected ? 'text-aeria-navy' : 'text-gray-700'}`}>
                    {cat.label}
                  </p>
                </button>
              )
            })}
          </div>
          {currentCategory && (
            <p className="text-xs text-gray-500 mt-2">{currentCategory.description}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Equipment Image
          </h3>
          <div className="flex items-start gap-4">
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Equipment preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Upload Button */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                id="equipment-image-upload"
              />
              <label
                htmlFor="equipment-image-upload"
                className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPEG, PNG or WebP, max 10MB
              </p>
              {uploadingImage && (
                <p className="text-xs text-aeria-blue mt-1 flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-aeria-blue border-t-transparent rounded-full animate-spin"></span>
                  Uploading image...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CategoryIcon className="w-4 h-4" />
            Basic Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="eq-name" className="label">Name <span className="text-red-500">*</span></label>
              <input
                id="eq-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Trimble R10, DJI Zenmuse H20T"
              />
            </div>
            <div>
              <label htmlFor="eq-manufacturer" className="label">Manufacturer</label>
              <input
                id="eq-manufacturer"
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Trimble, DJI, Sony"
              />
            </div>
            <div>
              <label htmlFor="eq-model" className="label">Model</label>
              <input
                id="eq-model"
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input"
                placeholder="Model number/name"
              />
            </div>
            <div>
              <label htmlFor="eq-serial" className="label">Serial Number</label>
              <input
                id="eq-serial"
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="input font-mono"
                placeholder="Serial number"
              />
            </div>
            <div>
              <label htmlFor="eq-status" className="label">Status</label>
              <select
                id="eq-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category-Specific Fields */}
        {currentCategoryFields.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {currentCategory?.label} Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {currentCategoryFields.map(field => (
                <div key={field.name} className={field.type === 'checkbox' ? 'flex items-center gap-2' : ''}>
                  {field.type === 'checkbox' ? (
                    <>
                      <input
                        id={`eq-${field.name}`}
                        type="checkbox"
                        name={field.name}
                        checked={formData.customFields[field.name] || false}
                        onChange={handleCustomFieldChange}
                        className="w-4 h-4 text-aeria-navy border-gray-300 rounded focus:ring-aeria-navy"
                      />
                      <label htmlFor={`eq-${field.name}`} className="text-sm text-gray-700">{field.label}</label>
                    </>
                  ) : (
                    <>
                      <label htmlFor={`eq-${field.name}`} className="label">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          id={`eq-${field.name}`}
                          name={field.name}
                          value={formData.customFields[field.name] || ''}
                          onChange={handleCustomFieldChange}
                          className="input"
                        >
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`eq-${field.name}`}
                          type={field.type}
                          name={field.name}
                          value={formData.customFields[field.name] || ''}
                          onChange={handleCustomFieldChange}
                          className="input"
                          placeholder={field.placeholder}
                          step={field.step}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Purchase Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eq-purchaseDate" className="label">Purchase Date</label>
              <input
                id="eq-purchaseDate"
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="eq-purchasePrice" className="label">Purchase Price ($)</label>
              <input
                id="eq-purchasePrice"
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
            <div>
              <label htmlFor="eq-payoffInterval" className="label">Interval to Pay Off (days)</label>
              <input
                id="eq-payoffInterval"
                type="number"
                name="payoffInterval"
                value={formData.payoffInterval}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 30"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Days of use to recover purchase cost. Auto-calculates billing rates below.
              </p>
            </div>
          </div>
        </div>

        {/* Billing Rates (for Cost Estimator) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Billing Rates
            <span className="text-xs font-normal text-gray-500">(Admin only - for cost estimation)</span>
          </h3>
          {formData.purchasePrice && formData.payoffInterval && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700">
                Auto-calculated from ${parseFloat(formData.purchasePrice).toLocaleString()} over {formData.payoffInterval} days (8 hours/day)
              </p>
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="eq-hourlyRate" className="label">Hourly Rate ($)</label>
              <input
                id="eq-hourlyRate"
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
              <label htmlFor="eq-dailyRate" className="label">Daily Rate ($)</label>
              <input
                id="eq-dailyRate"
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
              <label htmlFor="eq-weeklyRate" className="label">Weekly Rate ($)</label>
              <input
                id="eq-weeklyRate"
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
          <p className="text-xs text-gray-500 mt-2">
            These rates are used in the project cost estimator. Set &quot;Interval to Pay Off&quot; above to auto-calculate, or enter manually.
          </p>
        </div>

        {/* Maintenance & Usage Tracking */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance & Usage Tracking
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="trackMaintenance"
                checked={formData.trackMaintenance}
                onChange={handleChange}
                className="w-4 h-4 text-aeria-navy border-gray-300 rounded focus:ring-aeria-navy"
              />
              <span className="text-sm text-gray-600">Enable tracking</span>
            </label>
          </div>

          {formData.trackMaintenance ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="eq-currentHours" className="label">Current Hours</label>
                  <input
                    id="eq-currentHours"
                    type="number"
                    name="currentHours"
                    value={formData.currentHours}
                    onChange={handleChange}
                    className="input"
                    placeholder="Operating hours"
                    step="0.1"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for hour-based maintenance schedules</p>
                </div>
                <div>
                  <label htmlFor="eq-currentCycles" className="label">Current Cycles</label>
                  <input
                    id="eq-currentCycles"
                    type="number"
                    name="currentCycles"
                    value={formData.currentCycles}
                    onChange={handleChange}
                    className="input"
                    placeholder="Usage cycles"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for cycle-based maintenance schedules</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="eq-interval" className="label">Service Interval (days)</label>
                  <input
                    id="eq-interval"
                    type="number"
                    name="maintenanceInterval"
                    value={formData.maintenanceInterval}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 365"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="eq-lastService" className="label">Last Service</label>
                  <input
                    id="eq-lastService"
                    type="date"
                    name="lastServiceDate"
                    value={formData.lastServiceDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="eq-nextService" className="label">Next Service</label>
                  <input
                    id="eq-nextService"
                    type="date"
                    name="nextServiceDate"
                    value={formData.nextServiceDate}
                    onChange={handleChange}
                    className="input"
                  />
                  {formData.maintenanceInterval && formData.lastServiceDate && (
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from interval</p>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    For detailed maintenance schedules and history, visit the{' '}
                    <a
                      href={`/maintenance/item/equipment/${equipment?.id}`}
                      className="font-medium underline hover:text-blue-900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Maintenance Detail Page
                    </a>
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Maintenance tracking is disabled for this equipment. Enable it above to track hours, cycles, and service schedules.
            </p>
          )}
        </div>

        {/* Condition & Notes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Condition & Notes</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="eq-condition" className="label">Condition</label>
              <input
                id="eq-condition"
                type="text"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Excellent, Good, Fair, Minor scratches"
              />
            </div>
            <div>
              <label htmlFor="eq-notes" className="label">Notes</label>
              <textarea
                id="eq-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input min-h-[80px]"
                placeholder="Any additional notes about this equipment..."
              />
            </div>
          </div>
        </div>

        <ModalFooter>
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Equipment'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

EquipmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  equipment: PropTypes.object
}
