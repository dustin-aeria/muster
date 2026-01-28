/**
 * maintenanceFormTemplates.js
 * Pre-defined form templates for maintenance operations
 *
 * These templates are seeded into the forms collection with
 * category: 'maintenance' for linking to maintenance schedules.
 *
 * @location src/lib/maintenanceFormTemplates.js
 */

// ============================================
// MAINTENANCE FORM TEMPLATES
// ============================================

export const MAINTENANCE_FORM_TEMPLATES = {
  // ========================================
  // PRE-FLIGHT INSPECTION (AIRCRAFT)
  // ========================================
  pre_flight_inspection: {
    id: 'pre_flight_inspection',
    name: 'Pre-Flight Aircraft Inspection',
    shortName: 'Pre-Flight',
    category: 'maintenance',
    description: 'RPAS pre-flight inspection checklist per CAR 901.48',
    icon: 'Plane',
    version: '1.0',
    maintenanceType: 'inspection',
    sections: [
      {
        id: 'header',
        title: 'Inspection Information',
        fields: [
          { id: 'inspection_id', type: 'auto_id', label: 'Inspection ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'time', type: 'time', label: 'Time', required: true, defaultNow: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'current_hours', type: 'number', label: 'Current Flight Hours', required: true },
          { id: 'current_cycles', type: 'number', label: 'Current Cycles', required: false },
          { id: 'inspector', type: 'operator_select', label: 'Inspector (PIC)', required: true },
          { id: 'project', type: 'project_select', label: 'Project (optional)', required: false },
        ]
      },
      {
        id: 'airframe',
        title: 'Airframe Inspection',
        fields: [
          { id: 'frame_damage', type: 'yesno', label: 'Airframe free of cracks/damage?', required: true },
          { id: 'arms_secure', type: 'yesno', label: 'Arms fully deployed and locked?', required: true },
          { id: 'screws_tight', type: 'yesno', label: 'All visible screws secure?', required: true },
          { id: 'landing_gear', type: 'yesno', label: 'Landing gear intact and secure?', required: true },
          { id: 'gimbal_mount', type: 'yesno', label: 'Gimbal/payload mount secure?', required: true },
          { id: 'airframe_notes', type: 'textarea', label: 'Airframe Notes', required: false },
        ]
      },
      {
        id: 'propulsion',
        title: 'Propulsion System',
        fields: [
          { id: 'props_condition', type: 'yesno', label: 'Propellers free of chips/cracks?', required: true },
          { id: 'props_secure', type: 'yesno', label: 'Propellers properly secured?', required: true },
          { id: 'motors_free', type: 'yesno', label: 'Motors spin freely without grinding?', required: true },
          { id: 'motor_mounts', type: 'yesno', label: 'Motor mounts secure?', required: true },
          { id: 'esc_wiring', type: 'yesno', label: 'ESC wiring secure and undamaged?', required: true },
          { id: 'propulsion_notes', type: 'textarea', label: 'Propulsion Notes', required: false },
        ]
      },
      {
        id: 'battery',
        title: 'Battery Check',
        fields: [
          { id: 'battery_id', type: 'text', label: 'Battery ID', required: true },
          { id: 'battery_cycles', type: 'number', label: 'Battery Cycle Count', required: true },
          { id: 'battery_voltage', type: 'number', label: 'Voltage (%)', required: true },
          { id: 'battery_swelling', type: 'yesno', label: 'Battery free of swelling?', required: true },
          { id: 'battery_damage', type: 'yesno', label: 'Battery casing undamaged?', required: true },
          { id: 'connectors_clean', type: 'yesno', label: 'Connectors clean and secure?', required: true },
          { id: 'battery_temp', type: 'select', label: 'Battery Temperature', required: true, options: [
            { value: 'normal', label: 'Normal (room temp)' },
            { value: 'warm', label: 'Warm (recently charged)' },
            { value: 'cold', label: 'Cold (needs warming)' },
          ]},
          { id: 'battery_notes', type: 'textarea', label: 'Battery Notes', required: false },
        ]
      },
      {
        id: 'systems',
        title: 'Systems Check',
        fields: [
          { id: 'compass_cal', type: 'yesno', label: 'Compass calibration current?', required: true },
          { id: 'gps_lock', type: 'yesno', label: 'GPS acquiring satellites?', required: true },
          { id: 'rc_link', type: 'yesno', label: 'RC link established?', required: true },
          { id: 'video_feed', type: 'yesno', label: 'Video feed working?', required: true },
          { id: 'failsafe_set', type: 'yesno', label: 'Failsafe settings verified?', required: true },
          { id: 'rth_altitude', type: 'number', label: 'RTH Altitude (m AGL)', required: true },
          { id: 'firmware_current', type: 'yesno', label: 'Firmware up to date?', required: true },
          { id: 'firmware_version', type: 'text', label: 'Firmware Version', required: false },
          { id: 'systems_notes', type: 'textarea', label: 'Systems Notes', required: false },
        ]
      },
      {
        id: 'ground_control',
        title: 'Ground Control Station',
        fields: [
          { id: 'gcs_battery', type: 'number', label: 'GCS Battery (%)', required: true },
          { id: 'gcs_app', type: 'yesno', label: 'Flight app functioning?', required: true },
          { id: 'tablet_screen', type: 'yesno', label: 'Screen visible in conditions?', required: true },
          { id: 'sun_shade', type: 'yesno', label: 'Sun shade attached if needed?', required: false },
          { id: 'gcs_notes', type: 'textarea', label: 'GCS Notes', required: false },
        ]
      },
      {
        id: 'result',
        title: 'Inspection Result',
        fields: [
          { id: 'airworthy', type: 'yesno', label: 'Aircraft Airworthy for Flight?', required: true },
          { id: 'issues_found', type: 'textarea', label: 'Issues Requiring Attention', required: false, showIf: 'airworthy === false' },
          { id: 'deferred_items', type: 'textarea', label: 'Deferred Maintenance Items', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'inspector_signature', type: 'signature', label: 'Inspector Signature', required: true },
          { id: 'inspection_time', type: 'time', label: 'Inspection Complete Time', required: true },
        ]
      }
    ]
  },

  // ========================================
  // POST-FLIGHT INSPECTION (AIRCRAFT)
  // ========================================
  post_flight_inspection: {
    id: 'post_flight_inspection',
    name: 'Post-Flight Aircraft Inspection',
    shortName: 'Post-Flight',
    category: 'maintenance',
    description: 'RPAS post-flight inspection and flight data logging',
    icon: 'Plane',
    version: '1.0',
    maintenanceType: 'inspection',
    sections: [
      {
        id: 'header',
        title: 'Flight Information',
        fields: [
          { id: 'inspection_id', type: 'auto_id', label: 'Inspection ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'flight_duration', type: 'number', label: 'Flight Duration (minutes)', required: true },
          { id: 'landing_type', type: 'select', label: 'Landing Type', required: true, options: [
            { value: 'normal', label: 'Normal' },
            { value: 'hard', label: 'Hard Landing' },
            { value: 'emergency', label: 'Emergency/RTH' },
            { value: 'crash', label: 'Crash/Incident' },
          ]},
          { id: 'inspector', type: 'operator_select', label: 'Inspector (PIC)', required: true },
        ]
      },
      {
        id: 'post_checks',
        title: 'Post-Flight Checks',
        fields: [
          { id: 'props_damage', type: 'yesno', label: 'Propellers undamaged?', required: true },
          { id: 'motors_hot', type: 'select', label: 'Motor Temperature', required: true, options: [
            { value: 'normal', label: 'Normal - warm to touch' },
            { value: 'hot', label: 'Hot - requires cooldown' },
            { value: 'concerning', label: 'Excessively hot - investigate' },
          ]},
          { id: 'unusual_sounds', type: 'yesno', label: 'No unusual sounds during flight?', required: true },
          { id: 'airframe_post', type: 'yesno', label: 'Airframe undamaged?', required: true },
          { id: 'gimbal_function', type: 'yesno', label: 'Gimbal functioned correctly?', required: true },
        ]
      },
      {
        id: 'battery_post',
        title: 'Battery Post-Flight',
        fields: [
          { id: 'battery_end_voltage', type: 'number', label: 'End Voltage (%)', required: true },
          { id: 'battery_temp_post', type: 'select', label: 'Battery Temperature', required: true, options: [
            { value: 'normal', label: 'Normal' },
            { value: 'warm', label: 'Warm' },
            { value: 'hot', label: 'Hot - do not recharge immediately' },
          ]},
          { id: 'battery_swelling_post', type: 'yesno', label: 'Battery still free of swelling?', required: true },
          { id: 'cycles_to_add', type: 'number', label: 'Cycles to Add', required: true, defaultValue: 1 },
        ]
      },
      {
        id: 'flight_data',
        title: 'Flight Data Update',
        fields: [
          { id: 'hours_to_add', type: 'number', label: 'Flight Hours to Add', required: true, helpText: 'Convert minutes to decimal hours' },
          { id: 'max_altitude', type: 'number', label: 'Max Altitude Reached (m AGL)', required: false },
          { id: 'airdata_synced', type: 'yesno', label: 'AirData Log Synced?', required: true },
          { id: 'airdata_id', type: 'text', label: 'AirData Flight ID', required: false },
        ]
      },
      {
        id: 'issues',
        title: 'Issues Observed',
        repeatable: true,
        repeatLabel: 'Add Issue',
        fields: [
          { id: 'issue_description', type: 'textarea', label: 'Issue Description', required: true },
          { id: 'issue_severity', type: 'select', label: 'Severity', required: true, options: [
            { value: 'minor', label: 'Minor - monitor' },
            { value: 'moderate', label: 'Moderate - service soon' },
            { value: 'major', label: 'Major - ground until fixed' },
          ]},
          { id: 'issue_photo', type: 'file_upload', label: 'Photo', required: false, accept: 'image/*' },
        ]
      },
      {
        id: 'result',
        title: 'Post-Flight Result',
        fields: [
          { id: 'serviceable', type: 'yesno', label: 'Aircraft Serviceable for Next Flight?', required: true },
          { id: 'maintenance_required', type: 'yesno', label: 'Maintenance Required?', required: true },
          { id: 'maintenance_description', type: 'textarea', label: 'Maintenance Needed', required: false, showIf: 'maintenance_required === true' },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'inspector_signature', type: 'signature', label: 'Inspector Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // 100-HOUR AIRCRAFT INSPECTION
  // ========================================
  hundred_hour_inspection: {
    id: 'hundred_hour_inspection',
    name: '100-Hour Aircraft Inspection',
    shortName: '100-Hour',
    category: 'maintenance',
    description: 'Comprehensive 100 flight hour inspection per RPAS policy',
    icon: 'Wrench',
    version: '1.0',
    maintenanceType: 'scheduled',
    sections: [
      {
        id: 'header',
        title: 'Inspection Information',
        fields: [
          { id: 'inspection_id', type: 'auto_id', label: 'Inspection ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'current_hours', type: 'number', label: 'Current Flight Hours', required: true },
          { id: 'current_cycles', type: 'number', label: 'Current Cycles', required: true },
          { id: 'last_100hr_date', type: 'date', label: 'Last 100-Hour Inspection Date', required: false },
          { id: 'last_100hr_hours', type: 'number', label: 'Hours at Last 100-Hour', required: false },
          { id: 'inspector', type: 'operator_select', label: 'Technician', required: true },
        ]
      },
      {
        id: 'airframe_detailed',
        title: 'Airframe Detailed Inspection',
        fields: [
          { id: 'frame_cracks', type: 'yesno', label: 'Frame inspected for cracks - none found?', required: true },
          { id: 'arm_hinges', type: 'yesno', label: 'Arm hinges/locks in good condition?', required: true },
          { id: 'body_screws', type: 'yesno', label: 'All body screws torqued?', required: true },
          { id: 'arm_screws', type: 'yesno', label: 'All arm screws torqued?', required: true },
          { id: 'landing_gear_wear', type: 'yesno', label: 'Landing gear wear acceptable?', required: true },
          { id: 'vibration_dampers', type: 'yesno', label: 'Vibration dampers in good condition?', required: true },
          { id: 'shell_condition', type: 'yesno', label: 'Shell/cover undamaged?', required: true },
          { id: 'antenna_condition', type: 'yesno', label: 'Antennas secure and undamaged?', required: true },
        ]
      },
      {
        id: 'motor_inspection',
        title: 'Motor Inspection',
        fields: [
          { id: 'motor_1_bearing', type: 'yesno', label: 'Motor 1 bearings smooth?', required: true },
          { id: 'motor_2_bearing', type: 'yesno', label: 'Motor 2 bearings smooth?', required: true },
          { id: 'motor_3_bearing', type: 'yesno', label: 'Motor 3 bearings smooth?', required: true },
          { id: 'motor_4_bearing', type: 'yesno', label: 'Motor 4 bearings smooth?', required: true },
          { id: 'motor_5_bearing', type: 'yesno', label: 'Motor 5 bearings smooth? (if applicable)', required: false },
          { id: 'motor_6_bearing', type: 'yesno', label: 'Motor 6 bearings smooth? (if applicable)', required: false },
          { id: 'motor_mounts_all', type: 'yesno', label: 'All motor mounts secure?', required: true },
          { id: 'esc_inspection', type: 'yesno', label: 'ESCs inspected - no damage?', required: true },
          { id: 'motor_wiring', type: 'yesno', label: 'Motor wiring secure and undamaged?', required: true },
        ]
      },
      {
        id: 'propeller_inspection',
        title: 'Propeller Inspection',
        fields: [
          { id: 'prop_chips', type: 'yesno', label: 'All propellers free of chips?', required: true },
          { id: 'prop_cracks', type: 'yesno', label: 'All propellers free of cracks?', required: true },
          { id: 'prop_balance', type: 'yesno', label: 'Propeller balance acceptable?', required: true },
          { id: 'prop_hub_wear', type: 'yesno', label: 'Prop hub wear acceptable?', required: true },
          { id: 'props_replaced', type: 'yesno', label: 'Propellers replaced this inspection?', required: true },
          { id: 'prop_replacement_reason', type: 'text', label: 'Replacement Reason', required: false, showIf: 'props_replaced === true' },
        ]
      },
      {
        id: 'battery_assessment',
        title: 'Battery Fleet Assessment',
        repeatable: true,
        repeatLabel: 'Add Battery',
        fields: [
          { id: 'battery_id', type: 'text', label: 'Battery ID', required: true },
          { id: 'battery_cycles', type: 'number', label: 'Cycle Count', required: true },
          { id: 'battery_age_months', type: 'number', label: 'Age (months)', required: true },
          { id: 'internal_resistance', type: 'text', label: 'Internal Resistance (if measurable)', required: false },
          { id: 'battery_condition', type: 'select', label: 'Overall Condition', required: true, options: [
            { value: 'good', label: 'Good - continue use' },
            { value: 'monitor', label: 'Monitor - showing wear' },
            { value: 'retire', label: 'Retire - end of life' },
          ]},
          { id: 'battery_swelling_check', type: 'yesno', label: 'Free of swelling?', required: true },
        ]
      },
      {
        id: 'firmware_check',
        title: 'Firmware & Calibration',
        fields: [
          { id: 'firmware_version', type: 'text', label: 'Current Firmware Version', required: true },
          { id: 'firmware_latest', type: 'yesno', label: 'Firmware is latest stable version?', required: true },
          { id: 'firmware_updated', type: 'yesno', label: 'Firmware updated this inspection?', required: true },
          { id: 'compass_recal', type: 'yesno', label: 'Compass recalibrated?', required: true },
          { id: 'imu_calibrated', type: 'yesno', label: 'IMU calibration checked?', required: true },
          { id: 'gimbal_calibrated', type: 'yesno', label: 'Gimbal calibrated?', required: true },
        ]
      },
      {
        id: 'parts_replaced',
        title: 'Parts Replaced',
        repeatable: true,
        repeatLabel: 'Add Part',
        fields: [
          { id: 'part_name', type: 'text', label: 'Part Name', required: true },
          { id: 'part_number', type: 'text', label: 'Part Number', required: false },
          { id: 'quantity', type: 'number', label: 'Quantity', required: true },
          { id: 'part_cost', type: 'number', label: 'Cost ($)', required: false },
          { id: 'reason', type: 'text', label: 'Reason for Replacement', required: true },
        ]
      },
      {
        id: 'issues_found',
        title: 'Issues Found',
        repeatable: true,
        repeatLabel: 'Add Issue',
        fields: [
          { id: 'issue_description', type: 'textarea', label: 'Issue Description', required: true },
          { id: 'corrective_action', type: 'textarea', label: 'Corrective Action Taken', required: true },
          { id: 'issue_photos', type: 'file_upload', label: 'Photos', required: false, multiple: true, accept: 'image/*' },
        ]
      },
      {
        id: 'photos',
        title: 'Inspection Photos',
        fields: [
          { id: 'overall_photo', type: 'file_upload', label: 'Overall Aircraft Photo', required: true, accept: 'image/*' },
          { id: 'detail_photos', type: 'file_upload', label: 'Detail Photos', required: false, multiple: true, accept: 'image/*' },
        ]
      },
      {
        id: 'result',
        title: 'Inspection Result',
        fields: [
          { id: 'labor_hours', type: 'number', label: 'Labor Hours', required: true },
          { id: 'total_parts_cost', type: 'number', label: 'Total Parts Cost ($)', required: false },
          { id: 'airworthy', type: 'yesno', label: 'Aircraft Returned to Airworthy Status?', required: true },
          { id: 'grounded_reason', type: 'textarea', label: 'Reason if NOT Airworthy', required: false, showIf: 'airworthy === false' },
          { id: 'next_100hr_due', type: 'number', label: 'Next 100-Hour Due At (hours)', required: true },
          { id: 'remarks', type: 'textarea', label: 'Additional Remarks', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'technician_signature', type: 'signature', label: 'Technician Signature', required: true },
          { id: 'supervisor_signature', type: 'signature', label: 'Supervisor Approval (if required)', required: false },
          { id: 'return_to_service', type: 'checkbox', label: 'Aircraft Released to Service', required: true },
        ]
      }
    ]
  },

  // ========================================
  // EQUIPMENT SERVICE RECORD
  // ========================================
  equipment_service: {
    id: 'equipment_service',
    name: 'Equipment Service Record',
    shortName: 'Equip Service',
    category: 'maintenance',
    description: 'General equipment maintenance and service logging',
    icon: 'Package',
    version: '1.0',
    maintenanceType: 'scheduled',
    sections: [
      {
        id: 'header',
        title: 'Service Information',
        fields: [
          { id: 'service_id', type: 'auto_id', label: 'Service ID', required: true },
          { id: 'date', type: 'date', label: 'Service Date', required: true, defaultToday: true },
          { id: 'equipment', type: 'equipment_select', label: 'Equipment', required: true },
          { id: 'current_hours', type: 'number', label: 'Current Hours (if applicable)', required: false },
          { id: 'technician', type: 'operator_select', label: 'Technician', required: true },
          { id: 'service_type', type: 'select', label: 'Service Type', required: true, options: [
            { value: 'scheduled', label: 'Scheduled Maintenance' },
            { value: 'unscheduled', label: 'Unscheduled Repair' },
            { value: 'inspection', label: 'Inspection Only' },
            { value: 'calibration', label: 'Calibration' },
          ]},
        ]
      },
      {
        id: 'condition',
        title: 'Condition Assessment',
        fields: [
          { id: 'visual_condition', type: 'select', label: 'Visual Condition', required: true, options: [
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' },
          ]},
          { id: 'functional_test', type: 'yesno', label: 'Functional Test Passed?', required: true },
          { id: 'condition_notes', type: 'textarea', label: 'Condition Notes', required: false },
        ]
      },
      {
        id: 'service_performed',
        title: 'Service Performed',
        fields: [
          { id: 'service_description', type: 'textarea', label: 'Service Description', required: true },
          { id: 'checklist_items', type: 'multiselect', label: 'Tasks Completed', required: false, options: [
            { value: 'cleaned', label: 'Cleaned/decontaminated' },
            { value: 'lubricated', label: 'Lubricated moving parts' },
            { value: 'calibrated', label: 'Calibrated' },
            { value: 'firmware', label: 'Firmware updated' },
            { value: 'batteries', label: 'Batteries checked/replaced' },
            { value: 'cables', label: 'Cables/connectors checked' },
            { value: 'storage_case', label: 'Storage case inspected' },
          ]},
        ]
      },
      {
        id: 'parts_consumables',
        title: 'Parts & Consumables',
        repeatable: true,
        repeatLabel: 'Add Item',
        fields: [
          { id: 'item_name', type: 'text', label: 'Item Name', required: true },
          { id: 'item_number', type: 'text', label: 'Part/Item Number', required: false },
          { id: 'quantity', type: 'number', label: 'Quantity', required: true },
          { id: 'cost', type: 'number', label: 'Cost ($)', required: false },
        ]
      },
      {
        id: 'issues',
        title: 'Issues Found',
        repeatable: true,
        repeatLabel: 'Add Issue',
        fields: [
          { id: 'issue', type: 'textarea', label: 'Issue Description', required: true },
          { id: 'severity', type: 'select', label: 'Severity', required: true, options: [
            { value: 'minor', label: 'Minor' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'major', label: 'Major' },
          ]},
          { id: 'action_taken', type: 'textarea', label: 'Action Taken', required: true },
          { id: 'photo', type: 'file_upload', label: 'Photo', required: false, accept: 'image/*' },
        ]
      },
      {
        id: 'result',
        title: 'Service Result',
        fields: [
          { id: 'labor_hours', type: 'number', label: 'Labor Hours', required: true },
          { id: 'serviceable', type: 'yesno', label: 'Equipment Serviceable?', required: true },
          { id: 'next_service', type: 'date', label: 'Next Service Due', required: false },
          { id: 'remarks', type: 'textarea', label: 'Remarks', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'technician_signature', type: 'signature', label: 'Technician Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // BATTERY CYCLE LOG
  // ========================================
  battery_cycle_log: {
    id: 'battery_cycle_log',
    name: 'Battery Cycle Log',
    shortName: 'Battery Log',
    category: 'maintenance',
    description: 'Track battery cycles, voltage, and condition',
    icon: 'Battery',
    version: '1.0',
    maintenanceType: 'tracking',
    sections: [
      {
        id: 'header',
        title: 'Log Information',
        fields: [
          { id: 'log_id', type: 'auto_id', label: 'Log ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'battery_id', type: 'text', label: 'Battery ID/Serial', required: true },
          { id: 'battery_type', type: 'text', label: 'Battery Type', required: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Associated Aircraft', required: false },
          { id: 'logged_by', type: 'operator_select', label: 'Logged By', required: true },
        ]
      },
      {
        id: 'pre_flight',
        title: 'Pre-Flight Check',
        fields: [
          { id: 'starting_voltage', type: 'number', label: 'Starting Voltage (%)', required: true },
          { id: 'cell_balance', type: 'yesno', label: 'Cell Voltage Balanced?', required: true },
          { id: 'swelling_check', type: 'yesno', label: 'No Swelling Detected?', required: true },
          { id: 'connector_condition', type: 'yesno', label: 'Connectors Clean/Undamaged?', required: true },
        ]
      },
      {
        id: 'post_flight',
        title: 'Post-Flight Data',
        fields: [
          { id: 'end_voltage', type: 'number', label: 'End Voltage (%)', required: true },
          { id: 'flight_time', type: 'number', label: 'Flight Time (minutes)', required: true },
          { id: 'temperature', type: 'select', label: 'Temperature After Flight', required: true, options: [
            { value: 'cool', label: 'Cool' },
            { value: 'warm', label: 'Warm (normal)' },
            { value: 'hot', label: 'Hot (concerning)' },
          ]},
          { id: 'swelling_post', type: 'yesno', label: 'No Swelling Post-Flight?', required: true },
        ]
      },
      {
        id: 'cycle_update',
        title: 'Cycle Update',
        fields: [
          { id: 'previous_cycles', type: 'number', label: 'Previous Cycle Count', required: true },
          { id: 'cycles_to_add', type: 'number', label: 'Cycles to Add', required: true, defaultValue: 1 },
          { id: 'new_total', type: 'number', label: 'New Total Cycles', required: true },
        ]
      },
      {
        id: 'condition',
        title: 'Battery Condition',
        fields: [
          { id: 'overall_status', type: 'select', label: 'Overall Status', required: true, options: [
            { value: 'good', label: 'Good - Normal Use' },
            { value: 'monitor', label: 'Monitor - Showing Wear' },
            { value: 'retire', label: 'Retire - End of Life' },
          ]},
          { id: 'notes', type: 'textarea', label: 'Notes', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'logger_signature', type: 'signature', label: 'Logged By Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // GROUNDING / RETURN TO SERVICE
  // ========================================
  grounding_rts: {
    id: 'grounding_rts',
    name: 'Grounding / Return to Service',
    shortName: 'Ground/RTS',
    category: 'maintenance',
    description: 'Document grounding of equipment and return to service authorization',
    icon: 'AlertOctagon',
    version: '1.0',
    maintenanceType: 'grounding',
    sections: [
      {
        id: 'header',
        title: 'Form Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'action_type', type: 'select', label: 'Action Type', required: true, options: [
            { value: 'grounding', label: 'Grounding' },
            { value: 'return_to_service', label: 'Return to Service' },
          ]},
          { id: 'item_type', type: 'select', label: 'Item Type', required: true, options: [
            { value: 'aircraft', label: 'Aircraft' },
            { value: 'equipment', label: 'Equipment' },
          ]},
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: false, showIf: 'item_type === "aircraft"' },
          { id: 'equipment', type: 'equipment_select', label: 'Equipment', required: false, showIf: 'item_type === "equipment"' },
        ]
      },
      {
        id: 'grounding',
        title: 'Grounding Details',
        showIf: 'action_type === "grounding"',
        fields: [
          { id: 'grounding_reason', type: 'select', label: 'Reason Category', required: true, options: [
            { value: 'defect', label: 'Defect/Malfunction' },
            { value: 'damage', label: 'Damage' },
            { value: 'maintenance_due', label: 'Maintenance Due' },
            { value: 'incident', label: 'Post-Incident' },
            { value: 'regulatory', label: 'Regulatory Requirement' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'defect_description', type: 'textarea', label: 'Detailed Description', required: true },
          { id: 'safety_impact', type: 'select', label: 'Safety Impact', required: true, options: [
            { value: 'low', label: 'Low - Operational inconvenience' },
            { value: 'medium', label: 'Medium - Could affect safety' },
            { value: 'high', label: 'High - Significant safety concern' },
            { value: 'critical', label: 'Critical - Immediate hazard' },
          ]},
          { id: 'photos', type: 'file_upload', label: 'Evidence Photos', required: false, multiple: true, accept: 'image/*' },
          { id: 'grounded_by', type: 'operator_select', label: 'Grounded By', required: true },
        ]
      },
      {
        id: 'rts',
        title: 'Return to Service Details',
        showIf: 'action_type === "return_to_service"',
        fields: [
          { id: 'corrective_actions', type: 'textarea', label: 'Corrective Actions Taken', required: true },
          { id: 'parts_replaced', type: 'textarea', label: 'Parts Replaced', required: false },
          { id: 'inspection_ref', type: 'text', label: 'Related Inspection Form ID', required: false },
          { id: 'testing_performed', type: 'textarea', label: 'Testing/Verification Performed', required: true },
          { id: 'test_results', type: 'yesno', label: 'All Tests Passed?', required: true },
        ]
      },
      {
        id: 'verification',
        title: 'Verification Checks',
        showIf: 'action_type === "return_to_service"',
        fields: [
          { id: 'visual_inspection', type: 'yesno', label: 'Visual Inspection Completed?', required: true },
          { id: 'functional_test', type: 'yesno', label: 'Functional Test Completed?', required: true },
          { id: 'ground_test', type: 'yesno', label: 'Ground Run/Test Completed?', required: false, showIf: 'item_type === "aircraft"' },
          { id: 'test_flight', type: 'yesno', label: 'Test Flight Required/Completed?', required: false, showIf: 'item_type === "aircraft"' },
          { id: 'documentation_complete', type: 'yesno', label: 'All Documentation Complete?', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Authorization',
        fields: [
          { id: 'authorized_by', type: 'operator_select', label: 'Authorized By', required: true },
          { id: 'authorization_signature', type: 'signature', label: 'Signature', required: true },
          { id: 'supervisor_approval', type: 'signature', label: 'Supervisor Approval (if required)', required: false },
          { id: 'effective_date', type: 'datetime', label: 'Effective Date/Time', required: true },
          { id: 'remarks', type: 'textarea', label: 'Additional Remarks', required: false },
        ]
      }
    ]
  },

  // ========================================
  // VEHICLE MAINTENANCE LOG
  // ========================================
  vehicle_maintenance: {
    id: 'vehicle_maintenance',
    name: 'Vehicle Maintenance Log',
    shortName: 'Vehicle Maint',
    category: 'maintenance',
    description: 'Track vehicle service and maintenance history',
    icon: 'Truck',
    version: '1.0',
    maintenanceType: 'scheduled',
    sections: [
      {
        id: 'header',
        title: 'Service Information',
        fields: [
          { id: 'service_id', type: 'auto_id', label: 'Service ID', required: true },
          { id: 'date', type: 'date', label: 'Service Date', required: true, defaultToday: true },
          { id: 'vehicle_id', type: 'text', label: 'Vehicle ID/Plate', required: true },
          { id: 'odometer', type: 'number', label: 'Odometer Reading (km)', required: true },
          { id: 'service_provider', type: 'text', label: 'Service Provider', required: true },
          { id: 'logged_by', type: 'operator_select', label: 'Logged By', required: true },
        ]
      },
      {
        id: 'service_type',
        title: 'Service Type',
        fields: [
          { id: 'service_category', type: 'select', label: 'Service Category', required: true, options: [
            { value: 'oil_change', label: 'Oil Change' },
            { value: 'tire_rotation', label: 'Tire Rotation' },
            { value: 'brake_service', label: 'Brake Service' },
            { value: 'transmission', label: 'Transmission Service' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'repair', label: 'Repair' },
            { value: 'recall', label: 'Recall/TSB' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'service_description', type: 'textarea', label: 'Service Description', required: true },
        ]
      },
      {
        id: 'tasks',
        title: 'Tasks Completed',
        fields: [
          { id: 'tasks_performed', type: 'multiselect', label: 'Tasks Performed', required: false, options: [
            { value: 'oil_filter', label: 'Oil & Filter Changed' },
            { value: 'air_filter', label: 'Air Filter Replaced' },
            { value: 'cabin_filter', label: 'Cabin Filter Replaced' },
            { value: 'fluids_topped', label: 'Fluids Topped Up' },
            { value: 'tires_rotated', label: 'Tires Rotated' },
            { value: 'brakes_inspected', label: 'Brakes Inspected' },
            { value: 'battery_tested', label: 'Battery Tested' },
            { value: 'lights_checked', label: 'Lights Checked' },
            { value: 'wipers_replaced', label: 'Wipers Replaced' },
          ]},
        ]
      },
      {
        id: 'parts',
        title: 'Parts & Costs',
        repeatable: true,
        repeatLabel: 'Add Part/Service',
        fields: [
          { id: 'item_description', type: 'text', label: 'Item/Service', required: true },
          { id: 'part_number', type: 'text', label: 'Part Number', required: false },
          { id: 'quantity', type: 'number', label: 'Quantity', required: true },
          { id: 'cost', type: 'number', label: 'Cost ($)', required: true },
        ]
      },
      {
        id: 'receipts',
        title: 'Documentation',
        fields: [
          { id: 'receipt_upload', type: 'file_upload', label: 'Upload Receipt(s)', required: false, multiple: true },
          { id: 'total_cost', type: 'number', label: 'Total Cost ($)', required: true },
          { id: 'warranty_work', type: 'yesno', label: 'Warranty Work?', required: true },
        ]
      },
      {
        id: 'next_service',
        title: 'Next Service',
        fields: [
          { id: 'next_service_date', type: 'date', label: 'Next Service Due Date', required: false },
          { id: 'next_service_km', type: 'number', label: 'Next Service Due (km)', required: false },
          { id: 'notes', type: 'textarea', label: 'Notes/Recommendations', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'technician_signature', type: 'signature', label: 'Technician/Logger Signature', required: true },
        ]
      }
    ]
  },
}

// ============================================
// FORM TEMPLATE METADATA
// ============================================

export const MAINTENANCE_FORM_CATEGORIES = {
  inspection: { label: 'Inspection', description: 'Pre/post flight and routine inspections' },
  scheduled: { label: 'Scheduled Maintenance', description: 'Periodic maintenance tasks' },
  tracking: { label: 'Tracking', description: 'Usage and condition tracking' },
  grounding: { label: 'Grounding/RTS', description: 'Out of service management' },
}

/**
 * Get all maintenance form templates
 * @returns {Array} Array of template objects
 */
export function getMaintenanceFormTemplates() {
  return Object.values(MAINTENANCE_FORM_TEMPLATES)
}

/**
 * Get a specific maintenance form template by ID
 * @param {string} templateId - Template ID
 * @returns {Object|null} Template object or null
 */
export function getMaintenanceFormTemplate(templateId) {
  return MAINTENANCE_FORM_TEMPLATES[templateId] || null
}

/**
 * Get templates by maintenance type
 * @param {string} maintenanceType - Type: 'inspection' | 'scheduled' | 'tracking' | 'grounding'
 * @returns {Array} Filtered templates
 */
export function getTemplatesByMaintenanceType(maintenanceType) {
  return Object.values(MAINTENANCE_FORM_TEMPLATES).filter(
    t => t.maintenanceType === maintenanceType
  )
}

export default MAINTENANCE_FORM_TEMPLATES
