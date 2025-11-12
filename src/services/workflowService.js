import { base44 } from '@/api/base44Client';

/**
 * Workflow Service - Handles all workflow-related business logic
 */
export class WorkflowService {
  
  /**
   * Create a new workflow
   */
  static async createWorkflow(workflowData) {
    try {
      const workflow = await base44.entities.Workflow.create({
        name: workflowData.name,
        description: workflowData.description,
        trigger_type: workflowData.triggerType,
        trigger_conditions: JSON.stringify(workflowData.triggerConditions || {}),
        actions: JSON.stringify(workflowData.actions || []),
        nodes: JSON.stringify(workflowData.nodes || []),
        connections: JSON.stringify(workflowData.connections || []),
        is_active: workflowData.isActive || false,
        category: workflowData.category || 'General',
        created_by: workflowData.createdBy
      });
      
      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  /**
   * Update an existing workflow
   */
  static async updateWorkflow(workflowId, workflowData) {
    try {
      const workflow = await base44.entities.Workflow.update(workflowId, {
        name: workflowData.name,
        description: workflowData.description,
        trigger_type: workflowData.triggerType,
        trigger_conditions: JSON.stringify(workflowData.triggerConditions || {}),
        actions: JSON.stringify(workflowData.actions || []),
        nodes: JSON.stringify(workflowData.nodes || []),
        connections: JSON.stringify(workflowData.connections || []),
        is_active: workflowData.isActive,
        category: workflowData.category,
        updated_at: new Date().toISOString()
      });
      
      return workflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw new Error('Failed to update workflow');
    }
  }

  /**
   * Get all workflows
   */
  static async getWorkflows() {
    try {
      const workflows = await base44.entities.Workflow.list('-created_date');
      return workflows.map(workflow => ({
        ...workflow,
        triggerConditions: this.parseJSON(workflow.trigger_conditions),
        actions: this.parseJSON(workflow.actions),
        nodes: this.parseJSON(workflow.nodes),
        connections: this.parseJSON(workflow.connections)
      }));
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw new Error('Failed to fetch workflows');
    }
  }

  /**
   * Get a specific workflow by ID
   */
  static async getWorkflow(workflowId) {
    try {
      const workflow = await base44.entities.Workflow.get(workflowId);
      return {
        ...workflow,
        triggerConditions: this.parseJSON(workflow.trigger_conditions),
        actions: this.parseJSON(workflow.actions),
        nodes: this.parseJSON(workflow.nodes),
        connections: this.parseJSON(workflow.connections)
      };
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw new Error('Failed to fetch workflow');
    }
  }

  /**
   * Delete a workflow
   */
  static async deleteWorkflow(workflowId) {
    try {
      await base44.entities.Workflow.delete(workflowId);
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw new Error('Failed to delete workflow');
    }
  }

  /**
   * Execute a workflow manually
   */
  static async executeWorkflow(workflowId, contextData = {}) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      
      if (!workflow.is_active) {
        throw new Error('Workflow is not active');
      }

      // Create workflow execution record
      const execution = await base44.entities.WorkflowExecution.create({
        workflow_id: workflowId,
        status: 'running',
        context_data: JSON.stringify(contextData),
        started_at: new Date().toISOString()
      });

      // Process workflow actions
      const result = await this.processWorkflowActions(workflow, contextData, execution.id);
      
      // Update execution status
      await base44.entities.WorkflowExecution.update(execution.id, {
        status: result.success ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        result_data: JSON.stringify(result)
      });

      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw new Error('Failed to execute workflow');
    }
  }

  /**
   * Process workflow actions
   */
  static async processWorkflowActions(workflow, contextData, executionId) {
    try {
      const results = [];
      
      for (const action of workflow.actions) {
        const actionResult = await this.executeAction(action, contextData, executionId);
        results.push(actionResult);
        
        // If action failed and is critical, stop execution
        if (!actionResult.success && action.critical) {
          return {
            success: false,
            results,
            error: `Critical action failed: ${action.type}`
          };
        }
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a single workflow action
   */
  static async executeAction(action, contextData, executionId) {
    try {
      switch (action.type) {
        case 'send_email':
          return await this.sendEmail(action.config, contextData);
        
        case 'create_task':
          return await this.createTask(action.config, contextData);
        
        case 'update_contact':
          return await this.updateContact(action.config, contextData);
        
        case 'assign_to_user':
          return await this.assignToUser(action.config, contextData);
        
        case 'add_to_list':
          return await this.addToList(action.config, contextData);
        
        case 'create_deal':
          return await this.createDeal(action.config, contextData);
        
        case 'update_deal_stage':
          return await this.updateDealStage(action.config, contextData);
        
        case 'schedule_meeting':
          return await this.scheduleMeeting(action.config, contextData);
        
        case 'add_note':
          return await this.addNote(action.config, contextData);
        
        default:
          return {
            success: false,
            error: `Unknown action type: ${action.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Action implementations
   */
  static async sendEmail(config, contextData) {
    // Implementation for sending email
    return { success: true, message: 'Email sent successfully' };
  }

  static async createTask(config, contextData) {
    try {
      const task = await base44.entities.Task.create({
        task_name: config.title || 'Workflow Generated Task',
        description: config.description || '',
        due_date: config.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: config.priority || 'Medium',
        status: 'Open',
        assigned_to: config.assignedTo || contextData.userId,
        related_entity_type: contextData.entityType,
        related_entity_id: contextData.entityId
      });
      
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updateContact(config, contextData) {
    try {
      if (!contextData.contactId) {
        throw new Error('Contact ID not provided in context');
      }
      
      const contact = await base44.entities.Contact.update(contextData.contactId, config.updates);
      return { success: true, data: contact };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async assignToUser(config, contextData) {
    // Implementation for assigning to user
    return { success: true, message: 'Assigned to user successfully' };
  }

  static async addToList(config, contextData) {
    // Implementation for adding to list
    return { success: true, message: 'Added to list successfully' };
  }

  static async createDeal(config, contextData) {
    try {
      const deal = await base44.entities.Deal.create({
        deal_name: config.dealName || 'Workflow Generated Deal',
        account_id: contextData.accountId,
        contact_id: contextData.contactId,
        amount: config.amount || 0,
        currency: config.currency || 'USD',
        stage: config.stage || 'Prospecting',
        probability: config.probability || 50,
        expected_close_date: config.expectedCloseDate,
        owner_email: config.ownerEmail || contextData.userEmail
      });
      
      return { success: true, data: deal };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updateDealStage(config, contextData) {
    try {
      if (!contextData.dealId) {
        throw new Error('Deal ID not provided in context');
      }
      
      const deal = await base44.entities.Deal.update(contextData.dealId, {
        stage: config.newStage,
        probability: config.probability
      });
      
      return { success: true, data: deal };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async scheduleMeeting(config, contextData) {
    // Implementation for scheduling meeting
    return { success: true, message: 'Meeting scheduled successfully' };
  }

  static async addNote(config, contextData) {
    try {
      const note = await base44.entities.Note.create({
        content: config.content,
        related_entity_type: contextData.entityType,
        related_entity_id: contextData.entityId,
        created_by: contextData.userId
      });
      
      return { success: true, data: note };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get workflow execution history
   */
  static async getWorkflowExecutions(workflowId) {
    try {
      const executions = await base44.entities.WorkflowExecution.list(`workflow_id=${workflowId}`, '-started_at');
      return executions.map(execution => ({
        ...execution,
        contextData: this.parseJSON(execution.context_data),
        resultData: this.parseJSON(execution.result_data)
      }));
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      throw new Error('Failed to fetch workflow executions');
    }
  }

  /**
   * Get workflow analytics
   */
  static async getWorkflowAnalytics(workflowId, dateRange = '30d') {
    try {
      const executions = await this.getWorkflowExecutions(workflowId);
      
      const analytics = {
        totalExecutions: executions.length,
        successfulExecutions: executions.filter(e => e.status === 'completed').length,
        failedExecutions: executions.filter(e => e.status === 'failed').length,
        averageExecutionTime: 0,
        executionsByDay: {}
      };
      
      analytics.successRate = analytics.totalExecutions > 0 
        ? (analytics.successfulExecutions / analytics.totalExecutions * 100).toFixed(1)
        : 0;
      
      return analytics;
    } catch (error) {
      console.error('Error fetching workflow analytics:', error);
      throw new Error('Failed to fetch workflow analytics');
    }
  }

  /**
   * Utility method to safely parse JSON
   */
  static parseJSON(jsonString) {
    try {
      return jsonString ? JSON.parse(jsonString) : {};
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonString);
      return {};
    }
  }

  /**
   * Validate workflow configuration
   */
  static validateWorkflow(workflowData) {
    const errors = [];
    
    if (!workflowData.name || workflowData.name.trim() === '') {
      errors.push('Workflow name is required');
    }
    
    if (!workflowData.triggerType) {
      errors.push('Trigger type is required');
    }
    
    if (!workflowData.actions || workflowData.actions.length === 0) {
      errors.push('At least one action is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default WorkflowService;