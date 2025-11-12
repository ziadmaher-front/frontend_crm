import { base44 } from '@/api/base44Client';

/**
 * ActivityService - Handles all activity-related business logic and API interactions
 */
export class ActivityService {
  /**
   * Get all activities with optional filtering and sorting
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Sort field (default: '-activity_date')
   * @param {string} options.filterBy - Filter criteria
   * @param {string} options.search - Search term
   * @param {number} options.limit - Limit results
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} List of activities
   */
  static async getActivities(options = {}) {
    try {
      const {
        sortBy = '-activity_date',
        filterBy,
        search,
        limit,
        offset
      } = options;

      let query = sortBy;
      const params = new URLSearchParams();

      if (filterBy) params.append('filter', filterBy);
      if (search) params.append('search', search);
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);

      const queryString = params.toString();
      if (queryString) {
        query += `?${queryString}`;
      }

      return await base44.entities.Activity.list(query);
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }
  }

  /**
   * Get activities by related entity
   * @param {string} entityType - Type of related entity (lead, contact, deal, etc.)
   * @param {string} entityId - ID of related entity
   * @returns {Promise<Array>} List of related activities
   */
  static async getActivitiesByEntity(entityType, entityId) {
    try {
      return await base44.entities.Activity.list(`-activity_date?related_to_type=${entityType}&related_to_id=${entityId}`);
    } catch (error) {
      console.error('Error fetching entity activities:', error);
      throw new Error('Failed to fetch entity activities');
    }
  }

  /**
   * Get activity by ID
   * @param {string} id - Activity ID
   * @returns {Promise<Object>} Activity details
   */
  static async getActivity(id) {
    try {
      return await base44.entities.Activity.get(id);
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity');
    }
  }

  /**
   * Create a new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity
   */
  static async createActivity(activityData) {
    try {
      // Validate required fields
      this.validateActivityData(activityData);

      // Process and format data
      const processedData = this.processActivityData(activityData);

      return await base44.entities.Activity.create(processedData);
    } catch (error) {
      console.error('Error creating activity:', error);
      throw new Error('Failed to create activity');
    }
  }

  /**
   * Update an existing activity
   * @param {string} id - Activity ID
   * @param {Object} activityData - Updated activity data
   * @returns {Promise<Object>} Updated activity
   */
  static async updateActivity(id, activityData) {
    try {
      // Validate required fields
      this.validateActivityData(activityData, false);

      // Process and format data
      const processedData = this.processActivityData(activityData);

      return await base44.entities.Activity.update(id, processedData);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw new Error('Failed to update activity');
    }
  }

  /**
   * Delete an activity
   * @param {string} id - Activity ID
   * @returns {Promise<void>}
   */
  static async deleteActivity(id) {
    try {
      return await base44.entities.Activity.delete(id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw new Error('Failed to delete activity');
    }
  }

  /**
   * Get activity analytics and metrics
   * @param {Object} options - Analytics options
   * @param {string} options.period - Time period (week, month, quarter, year)
   * @param {string} options.startDate - Start date for custom period
   * @param {string} options.endDate - End date for custom period
   * @returns {Promise<Object>} Activity analytics
   */
  static async getActivityAnalytics(options = {}) {
    try {
      const { period = 'month', startDate, endDate } = options;
      
      // Get activities for the specified period
      const activities = await this.getActivities({
        filterBy: this.buildDateFilter(period, startDate, endDate)
      });

      return this.calculateActivityMetrics(activities);
    } catch (error) {
      console.error('Error fetching activity analytics:', error);
      throw new Error('Failed to fetch activity analytics');
    }
  }

  /**
   * Get upcoming activities (scheduled/pending)
   * @param {number} days - Number of days to look ahead (default: 7)
   * @returns {Promise<Array>} Upcoming activities
   */
  static async getUpcomingActivities(days = 7) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      return await base44.entities.Activity.list(
        `-activity_date?status=Scheduled&activity_date__lte=${endDate.toISOString()}`
      );
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
      throw new Error('Failed to fetch upcoming activities');
    }
  }

  /**
   * Get overdue activities
   * @returns {Promise<Array>} Overdue activities
   */
  static async getOverdueActivities() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return await base44.entities.Activity.list(
        `-activity_date?status=Scheduled&activity_date__lt=${today}`
      );
    } catch (error) {
      console.error('Error fetching overdue activities:', error);
      throw new Error('Failed to fetch overdue activities');
    }
  }

  /**
   * Mark activity as completed
   * @param {string} id - Activity ID
   * @param {Object} completionData - Completion data (outcome, notes, etc.)
   * @returns {Promise<Object>} Updated activity
   */
  static async completeActivity(id, completionData = {}) {
    try {
      const updateData = {
        status: 'Completed',
        completed_date: new Date().toISOString(),
        ...completionData
      };

      return await this.updateActivity(id, updateData);
    } catch (error) {
      console.error('Error completing activity:', error);
      throw new Error('Failed to complete activity');
    }
  }

  /**
   * Reschedule an activity
   * @param {string} id - Activity ID
   * @param {string} newDate - New activity date
   * @param {string} reason - Reason for rescheduling
   * @returns {Promise<Object>} Updated activity
   */
  static async rescheduleActivity(id, newDate, reason = '') {
    try {
      const updateData = {
        activity_date: newDate,
        status: 'Scheduled',
        outcome: 'Rescheduled',
        reschedule_reason: reason,
        reschedule_count: 1 // This should be incremented based on existing count
      };

      return await this.updateActivity(id, updateData);
    } catch (error) {
      console.error('Error rescheduling activity:', error);
      throw new Error('Failed to reschedule activity');
    }
  }

  /**
   * Validate activity data
   * @param {Object} data - Activity data to validate
   * @param {boolean} isCreate - Whether this is for creation (requires all fields)
   * @throws {Error} If validation fails
   */
  static validateActivityData(data, isCreate = true) {
    const requiredFields = ['activity_type', 'subject'];
    
    if (isCreate) {
      requiredFields.push('activity_date');
    }

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate activity type
    const validTypes = ['Call', 'Meeting', 'Email', 'Task', 'Note', 'Visit'];
    if (data.activity_type && !validTypes.includes(data.activity_type)) {
      throw new Error('Invalid activity type');
    }

    // Validate status
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new Error('Invalid activity status');
    }

    // Validate outcome
    const validOutcomes = ['Successful', 'Unsuccessful', 'Rescheduled', 'No Answer'];
    if (data.outcome && !validOutcomes.includes(data.outcome)) {
      throw new Error('Invalid activity outcome');
    }

    // Validate duration
    if (data.duration_minutes && (data.duration_minutes < 0 || data.duration_minutes > 1440)) {
      throw new Error('Duration must be between 0 and 1440 minutes');
    }
  }

  /**
   * Process and format activity data before saving
   * @param {Object} data - Raw activity data
   * @returns {Object} Processed activity data
   */
  static processActivityData(data) {
    const processed = { ...data };

    // Ensure proper date formatting
    if (processed.activity_date) {
      processed.activity_date = new Date(processed.activity_date).toISOString();
    }

    // Set default values
    if (!processed.duration_minutes) {
      processed.duration_minutes = this.getDefaultDuration(processed.activity_type);
    }

    if (!processed.status) {
      processed.status = 'Scheduled';
    }

    if (!processed.outcome && processed.status === 'Completed') {
      processed.outcome = 'Successful';
    }

    // Add metadata
    processed.created_date = processed.created_date || new Date().toISOString();
    processed.updated_date = new Date().toISOString();

    return processed;
  }

  /**
   * Get default duration for activity type
   * @param {string} activityType - Type of activity
   * @returns {number} Default duration in minutes
   */
  static getDefaultDuration(activityType) {
    const durations = {
      'Call': 15,
      'Meeting': 60,
      'Email': 5,
      'Task': 30,
      'Note': 5,
      'Visit': 120
    };

    return durations[activityType] || 30;
  }

  /**
   * Build date filter for analytics
   * @param {string} period - Time period
   * @param {string} startDate - Custom start date
   * @param {string} endDate - Custom end date
   * @returns {string} Filter string
   */
  static buildDateFilter(period, startDate, endDate) {
    if (startDate && endDate) {
      return `activity_date__gte=${startDate}&activity_date__lte=${endDate}`;
    }

    const now = new Date();
    let start;

    switch (period) {
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        start = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        start = new Date(now.setMonth(now.getMonth() - 1));
    }

    return `activity_date__gte=${start.toISOString().split('T')[0]}`;
  }

  /**
   * Calculate activity metrics from activity data
   * @param {Array} activities - List of activities
   * @returns {Object} Calculated metrics
   */
  static calculateActivityMetrics(activities) {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'Completed').length;
    const scheduled = activities.filter(a => a.status === 'Scheduled').length;
    const cancelled = activities.filter(a => a.status === 'Cancelled').length;

    // Group by type
    const byType = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {});

    // Group by outcome
    const byOutcome = activities.reduce((acc, activity) => {
      if (activity.outcome) {
        acc[activity.outcome] = (acc[activity.outcome] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate completion rate
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

    // Calculate success rate (successful outcomes vs total completed)
    const successful = byOutcome['Successful'] || 0;
    const successRate = completed > 0 ? (successful / completed * 100).toFixed(1) : 0;

    // Calculate average duration
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    return {
      total,
      completed,
      scheduled,
      cancelled,
      completionRate: parseFloat(completionRate),
      successRate: parseFloat(successRate),
      avgDuration,
      byType,
      byOutcome,
      trends: this.calculateTrends(activities)
    };
  }

  /**
   * Calculate activity trends
   * @param {Array} activities - List of activities
   * @returns {Object} Trend data
   */
  static calculateTrends(activities) {
    // Group activities by date
    const byDate = activities.reduce((acc, activity) => {
      const date = activity.activity_date.split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, completed: 0 };
      }
      acc[date].total++;
      if (activity.status === 'Completed') {
        acc[date].completed++;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    const trendData = Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? (data.completed / data.total * 100).toFixed(1) : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return trendData;
  }

  /**
   * Get activity templates for quick creation
   * @returns {Array} List of activity templates
   */
  static getActivityTemplates() {
    return [
      {
        id: 'follow-up-call',
        name: 'Follow-up Call',
        activity_type: 'Call',
        subject: 'Follow-up call',
        duration_minutes: 15,
        description: 'Follow up on previous conversation'
      },
      {
        id: 'demo-meeting',
        name: 'Product Demo',
        activity_type: 'Meeting',
        subject: 'Product demonstration',
        duration_minutes: 60,
        description: 'Demonstrate product features and capabilities'
      },
      {
        id: 'proposal-email',
        name: 'Send Proposal',
        activity_type: 'Email',
        subject: 'Proposal submission',
        duration_minutes: 30,
        description: 'Send detailed proposal and pricing information'
      },
      {
        id: 'site-visit',
        name: 'Site Visit',
        activity_type: 'Visit',
        subject: 'On-site visit',
        duration_minutes: 120,
        description: 'Visit client location for assessment or meeting'
      }
    ];
  }
}

export default ActivityService;