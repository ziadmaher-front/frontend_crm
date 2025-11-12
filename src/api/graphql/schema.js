import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # User Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    avatar: String
    isActive: Boolean!
    lastLogin: DateTime
    preferences: UserPreferences
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserPreferences {
    theme: String
    language: String
    timezone: String
    notifications: NotificationSettings
  }

  type NotificationSettings {
    email: Boolean!
    push: Boolean!
    sms: Boolean!
    inApp: Boolean!
  }

  enum UserRole {
    ADMIN
    MANAGER
    SALES_REP
    MARKETING
    SUPPORT
  }

  # Contact Types
  type Contact {
    id: ID!
    firstName: String!
    lastName: String!
    email: String
    phone: String
    company: Company
    position: String
    source: String
    status: ContactStatus!
    tags: [String!]!
    customFields: JSON
    activities: [Activity!]!
    deals: [Deal!]!
    assignedTo: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ContactStatus {
    NEW
    QUALIFIED
    CONTACTED
    NURTURING
    CONVERTED
    LOST
  }

  # Company Types
  type Company {
    id: ID!
    name: String!
    website: String
    industry: String
    size: CompanySize
    revenue: Float
    address: Address
    contacts: [Contact!]!
    deals: [Deal!]!
    customFields: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum CompanySize {
    STARTUP
    SMALL
    MEDIUM
    LARGE
    ENTERPRISE
  }

  type Address {
    street: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  # Deal Types
  type Deal {
    id: ID!
    title: String!
    value: Float!
    currency: String!
    stage: DealStage!
    probability: Float
    expectedCloseDate: DateTime
    actualCloseDate: DateTime
    contact: Contact!
    company: Company
    assignedTo: User!
    products: [Product!]!
    activities: [Activity!]!
    customFields: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum DealStage {
    PROSPECTING
    QUALIFICATION
    PROPOSAL
    NEGOTIATION
    CLOSED_WON
    CLOSED_LOST
  }

  # Product Types
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    currency: String!
    category: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Activity Types
  type Activity {
    id: ID!
    type: ActivityType!
    subject: String!
    description: String
    dueDate: DateTime
    completedAt: DateTime
    priority: Priority!
    status: ActivityStatus!
    contact: Contact
    deal: Deal
    assignedTo: User!
    createdBy: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ActivityType {
    CALL
    EMAIL
    MEETING
    TASK
    NOTE
    FOLLOW_UP
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum ActivityStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  # Campaign Types
  type Campaign {
    id: ID!
    name: String!
    type: CampaignType!
    status: CampaignStatus!
    startDate: DateTime!
    endDate: DateTime
    budget: Float
    channels: [CampaignChannel!]!
    targets: [Contact!]!
    metrics: CampaignMetrics
    createdBy: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum CampaignType {
    EMAIL
    SMS
    SOCIAL_MEDIA
    PHONE
    MULTI_CHANNEL
  }

  enum CampaignStatus {
    DRAFT
    SCHEDULED
    ACTIVE
    PAUSED
    COMPLETED
    CANCELLED
  }

  enum CampaignChannel {
    EMAIL
    SMS
    FACEBOOK
    LINKEDIN
    TWITTER
    PHONE
  }

  type CampaignMetrics {
    sent: Int!
    delivered: Int!
    opened: Int!
    clicked: Int!
    replied: Int!
    converted: Int!
    bounced: Int!
    unsubscribed: Int!
  }

  # Analytics Types
  type SalesMetrics {
    totalRevenue: Float!
    totalDeals: Int!
    averageDealSize: Float!
    winRate: Float!
    salesCycle: Float!
    pipeline: [PipelineStage!]!
    topPerformers: [UserPerformance!]!
  }

  type PipelineStage {
    stage: DealStage!
    count: Int!
    value: Float!
  }

  type UserPerformance {
    user: User!
    revenue: Float!
    deals: Int!
    activities: Int!
  }

  # Input Types
  input ContactInput {
    firstName: String!
    lastName: String!
    email: String
    phone: String
    companyId: ID
    position: String
    source: String
    status: ContactStatus
    tags: [String!]
    customFields: JSON
    assignedToId: ID
  }

  input ContactUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    companyId: ID
    position: String
    source: String
    status: ContactStatus
    tags: [String!]
    customFields: JSON
    assignedToId: ID
  }

  input CompanyInput {
    name: String!
    website: String
    industry: String
    size: CompanySize
    revenue: Float
    address: AddressInput
    customFields: JSON
  }

  input AddressInput {
    street: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  input DealInput {
    title: String!
    value: Float!
    currency: String!
    stage: DealStage!
    probability: Float
    expectedCloseDate: DateTime
    contactId: ID!
    companyId: ID
    assignedToId: ID!
    productIds: [ID!]
    customFields: JSON
  }

  input ActivityInput {
    type: ActivityType!
    subject: String!
    description: String
    dueDate: DateTime
    priority: Priority!
    contactId: ID
    dealId: ID
    assignedToId: ID!
  }

  input CampaignInput {
    name: String!
    type: CampaignType!
    startDate: DateTime!
    endDate: DateTime
    budget: Float
    channels: [CampaignChannel!]!
    targetIds: [ID!]!
  }

  # Filter and Sort Types
  input ContactFilter {
    status: ContactStatus
    assignedToId: ID
    companyId: ID
    tags: [String!]
    createdAfter: DateTime
    createdBefore: DateTime
  }

  input DealFilter {
    stage: DealStage
    assignedToId: ID
    companyId: ID
    minValue: Float
    maxValue: Float
    expectedCloseBefore: DateTime
    expectedCloseAfter: DateTime
  }

  enum SortOrder {
    ASC
    DESC
  }

  input ContactSort {
    field: ContactSortField!
    order: SortOrder!
  }

  enum ContactSortField {
    CREATED_AT
    UPDATED_AT
    FIRST_NAME
    LAST_NAME
    COMPANY
  }

  # Pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type ContactConnection {
    edges: [ContactEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ContactEdge {
    node: Contact!
    cursor: String!
  }

  # Queries
  type Query {
    # User queries
    me: User
    users(first: Int, after: String): [User!]!
    user(id: ID!): User

    # Contact queries
    contacts(
      first: Int
      after: String
      filter: ContactFilter
      sort: ContactSort
    ): ContactConnection!
    contact(id: ID!): Contact
    searchContacts(query: String!): [Contact!]!

    # Company queries
    companies(first: Int, after: String): [Company!]!
    company(id: ID!): Company
    searchCompanies(query: String!): [Company!]!

    # Deal queries
    deals(
      first: Int
      after: String
      filter: DealFilter
    ): [Deal!]!
    deal(id: ID!): Deal
    myDeals: [Deal!]!

    # Product queries
    products: [Product!]!
    product(id: ID!): Product

    # Activity queries
    activities(first: Int, after: String): [Activity!]!
    activity(id: ID!): Activity
    myActivities: [Activity!]!
    upcomingActivities: [Activity!]!

    # Campaign queries
    campaigns: [Campaign!]!
    campaign(id: ID!): Campaign
    myCampaigns: [Campaign!]!

    # Analytics queries
    salesMetrics(startDate: DateTime, endDate: DateTime): SalesMetrics!
    dashboardData: JSON!
  }

  # Mutations
  type Mutation {
    # Contact mutations
    createContact(input: ContactInput!): Contact!
    updateContact(id: ID!, input: ContactUpdateInput!): Contact!
    deleteContact(id: ID!): Boolean!
    bulkUpdateContacts(ids: [ID!]!, input: ContactUpdateInput!): [Contact!]!

    # Company mutations
    createCompany(input: CompanyInput!): Company!
    updateCompany(id: ID!, input: CompanyInput!): Company!
    deleteCompany(id: ID!): Boolean!

    # Deal mutations
    createDeal(input: DealInput!): Deal!
    updateDeal(id: ID!, input: DealInput!): Deal!
    deleteDeal(id: ID!): Boolean!
    moveDealStage(id: ID!, stage: DealStage!): Deal!

    # Activity mutations
    createActivity(input: ActivityInput!): Activity!
    updateActivity(id: ID!, input: ActivityInput!): Activity!
    deleteActivity(id: ID!): Boolean!
    completeActivity(id: ID!): Activity!

    # Campaign mutations
    createCampaign(input: CampaignInput!): Campaign!
    updateCampaign(id: ID!, input: CampaignInput!): Campaign!
    deleteCampaign(id: ID!): Boolean!
    launchCampaign(id: ID!): Campaign!
    pauseCampaign(id: ID!): Campaign!

    # User mutations
    updateProfile(input: UserUpdateInput!): User!
    updatePreferences(input: UserPreferencesInput!): User!
  }

  input UserUpdateInput {
    firstName: String
    lastName: String
    avatar: String
  }

  input UserPreferencesInput {
    theme: String
    language: String
    timezone: String
    notifications: NotificationSettingsInput
  }

  input NotificationSettingsInput {
    email: Boolean
    push: Boolean
    sms: Boolean
    inApp: Boolean
  }

  # Subscriptions
  type Subscription {
    # Real-time updates
    contactUpdated(id: ID): Contact!
    dealUpdated(id: ID): Deal!
    activityCreated(assignedToId: ID): Activity!
    campaignMetricsUpdated(id: ID!): Campaign!
    
    # Notifications
    newNotification(userId: ID!): Notification!
  }

  type Notification {
    id: ID!
    type: NotificationType!
    title: String!
    message: String!
    data: JSON
    read: Boolean!
    createdAt: DateTime!
  }

  enum NotificationType {
    DEAL_WON
    DEAL_LOST
    ACTIVITY_DUE
    CAMPAIGN_COMPLETED
    SYSTEM_ALERT
  }
`;

export default typeDefs;