import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../useNotifications';
import { useAuth } from '../useAuth';

// Social media providers configuration
const SOCIAL_PROVIDERS = {
  LINKEDIN: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0077B5',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: [
      'r_liteprofile',
      'r_emailaddress',
      'w_member_social',
      'r_organization_social',
      'w_organization_social'
    ],
    clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID
  },
  TWITTER: {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: [
      'tweet.read',
      'tweet.write',
      'users.read',
      'follows.read',
      'follows.write'
    ],
    clientId: process.env.REACT_APP_TWITTER_CLIENT_ID
  },
  FACEBOOK: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: [
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_show_list',
      'business_management'
    ],
    clientId: process.env.REACT_APP_FACEBOOK_CLIENT_ID
  },
  INSTAGRAM: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: [
      'user_profile',
      'user_media'
    ],
    clientId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID
  }
};

// Post types
const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  CAROUSEL: 'carousel',
  STORY: 'story',
  ARTICLE: 'article'
};

// Engagement types
const ENGAGEMENT_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  SHARE: 'share',
  RETWEET: 'retweet',
  REACTION: 'reaction',
  CLICK: 'click',
  IMPRESSION: 'impression'
};

class SocialMediaIntegrationEngine {
  constructor(provider, config, notifications) {
    this.provider = provider;
    this.config = config;
    this.notifications = notifications;
    this.accessToken = null;
    this.refreshToken = null;
    this.pageTokens = new Map(); // For Facebook pages
  }

  // Authentication methods
  async authenticate() {
    try {
      switch (this.provider) {
        case 'LINKEDIN':
          return await this.authenticateLinkedIn();
        case 'TWITTER':
          return await this.authenticateTwitter();
        case 'FACEBOOK':
          return await this.authenticateFacebook();
        case 'INSTAGRAM':
          return await this.authenticateInstagram();
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Social media authentication failed:', error);
      this.notifications.error(`Failed to authenticate with ${this.provider}`);
      throw error;
    }
  }

  async authenticateLinkedIn() {
    const state = this.generateState();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SOCIAL_PROVIDERS.LINKEDIN.clientId,
      redirect_uri: `${window.location.origin}/auth/linkedin/callback`,
      state: state,
      scope: SOCIAL_PROVIDERS.LINKEDIN.scopes.join(' ')
    });

    const authUrl = `${SOCIAL_PROVIDERS.LINKEDIN.authUrl}?${params}`;
    return this.openAuthPopup(authUrl, 'linkedin-auth', 'LINKEDIN_AUTH');
  }

  async authenticateTwitter() {
    const state = this.generateState();
    const codeChallenge = this.generateCodeChallenge();
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SOCIAL_PROVIDERS.TWITTER.clientId,
      redirect_uri: `${window.location.origin}/auth/twitter/callback`,
      scope: SOCIAL_PROVIDERS.TWITTER.scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${SOCIAL_PROVIDERS.TWITTER.authUrl}?${params}`;
    return this.openAuthPopup(authUrl, 'twitter-auth', 'TWITTER_AUTH');
  }

  async authenticateFacebook() {
    const state = this.generateState();
    const params = new URLSearchParams({
      client_id: SOCIAL_PROVIDERS.FACEBOOK.clientId,
      redirect_uri: `${window.location.origin}/auth/facebook/callback`,
      scope: SOCIAL_PROVIDERS.FACEBOOK.scopes.join(','),
      response_type: 'code',
      state: state
    });

    const authUrl = `${SOCIAL_PROVIDERS.FACEBOOK.authUrl}?${params}`;
    return this.openAuthPopup(authUrl, 'facebook-auth', 'FACEBOOK_AUTH');
  }

  async authenticateInstagram() {
    const state = this.generateState();
    const params = new URLSearchParams({
      client_id: SOCIAL_PROVIDERS.INSTAGRAM.clientId,
      redirect_uri: `${window.location.origin}/auth/instagram/callback`,
      scope: SOCIAL_PROVIDERS.INSTAGRAM.scopes.join(','),
      response_type: 'code',
      state: state
    });

    const authUrl = `${SOCIAL_PROVIDERS.INSTAGRAM.authUrl}?${params}`;
    return this.openAuthPopup(authUrl, 'instagram-auth', 'INSTAGRAM_AUTH');
  }

  openAuthPopup(authUrl, windowName, messageType) {
    const popup = window.open(authUrl, windowName, 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === `${messageType}_SUCCESS`) {
          clearInterval(checkClosed);
          popup.close();
          this.accessToken = event.data.accessToken;
          this.refreshToken = event.data.refreshToken;
          resolve(event.data);
        } else if (event.data.type === `${messageType}_ERROR`) {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  // Profile and account management
  async getProfile() {
    try {
      switch (this.provider) {
        case 'LINKEDIN':
          return await this.getLinkedInProfile();
        case 'TWITTER':
          return await this.getTwitterProfile();
        case 'FACEBOOK':
          return await this.getFacebookProfile();
        case 'INSTAGRAM':
          return await this.getInstagramProfile();
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }

  async getLinkedInProfile() {
    const response = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const profile = await response.json();
    return {
      id: profile.id,
      name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
      firstName: profile.localizedFirstName,
      lastName: profile.localizedLastName,
      headline: profile.localizedHeadline,
      profilePicture: profile.profilePicture?.displayImage,
      provider: 'LINKEDIN'
    };
  }

  async getTwitterProfile() {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const user = data.data;
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      description: user.description,
      profileImageUrl: user.profile_image_url,
      followersCount: user.public_metrics?.followers_count,
      followingCount: user.public_metrics?.following_count,
      provider: 'TWITTER'
    };
  }

  async getFacebookProfile() {
    const response = await fetch('https://graph.facebook.com/me?fields=id,name,email,picture', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const profile = await response.json();
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      profilePicture: profile.picture?.data?.url,
      provider: 'FACEBOOK'
    };
  }

  async getInstagramProfile() {
    const response = await fetch('https://graph.instagram.com/me?fields=id,username,account_type,media_count', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const profile = await response.json();
    return {
      id: profile.id,
      username: profile.username,
      accountType: profile.account_type,
      mediaCount: profile.media_count,
      provider: 'INSTAGRAM'
    };
  }

  // Post management
  async createPost(postData) {
    try {
      switch (this.provider) {
        case 'LINKEDIN':
          return await this.createLinkedInPost(postData);
        case 'TWITTER':
          return await this.createTwitterPost(postData);
        case 'FACEBOOK':
          return await this.createFacebookPost(postData);
        case 'INSTAGRAM':
          return await this.createInstagramPost(postData);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      this.notifications.error('Failed to create social media post');
      throw error;
    }
  }

  async createLinkedInPost(postData) {
    const post = {
      author: `urn:li:person:${postData.authorId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postData.text
          },
          shareMediaCategory: postData.media ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (postData.media) {
      post.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        description: {
          text: postData.mediaDescription || ''
        },
        media: postData.media.url,
        title: {
          text: postData.mediaTitle || ''
        }
      }];
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    return await response.json();
  }

  async createTwitterPost(postData) {
    const tweet = {
      text: postData.text
    };

    if (postData.media) {
      // First upload media
      const mediaId = await this.uploadTwitterMedia(postData.media);
      tweet.media = { media_ids: [mediaId] };
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tweet)
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    return await response.json();
  }

  async createFacebookPost(postData) {
    const post = {
      message: postData.text
    };

    if (postData.media) {
      post.url = postData.media.url;
    }

    const endpoint = postData.pageId 
      ? `https://graph.facebook.com/${postData.pageId}/feed`
      : 'https://graph.facebook.com/me/feed';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    return await response.json();
  }

  async createInstagramPost(postData) {
    // Instagram requires a two-step process: create media object, then publish
    const mediaObject = await this.createInstagramMediaObject(postData);
    
    const response = await fetch(`https://graph.instagram.com/${postData.accountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: mediaObject.id
      })
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    return await response.json();
  }

  async createInstagramMediaObject(postData) {
    const mediaData = {
      image_url: postData.media.url,
      caption: postData.text
    };

    const response = await fetch(`https://graph.instagram.com/${postData.accountId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mediaData)
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    return await response.json();
  }

  // Analytics and insights
  async getAnalytics(timeRange) {
    try {
      switch (this.provider) {
        case 'LINKEDIN':
          return await this.getLinkedInAnalytics(timeRange);
        case 'TWITTER':
          return await this.getTwitterAnalytics(timeRange);
        case 'FACEBOOK':
          return await this.getFacebookAnalytics(timeRange);
        case 'INSTAGRAM':
          return await this.getInstagramAnalytics(timeRange);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  async getLinkedInAnalytics(timeRange) {
    const response = await fetch(`https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${this.config.organizationId}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${timeRange.start}&timeIntervals.timeRange.end=${timeRange.end}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    return await response.json();
  }

  async getTwitterAnalytics(timeRange) {
    const response = await fetch(`https://api.twitter.com/2/users/${this.config.userId}/tweets?tweet.fields=public_metrics&start_time=${timeRange.start}&end_time=${timeRange.end}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    return await response.json();
  }

  async getFacebookAnalytics(timeRange) {
    const response = await fetch(`https://graph.facebook.com/${this.config.pageId}/insights?metric=page_impressions,page_reach,page_engaged_users&since=${timeRange.start}&until=${timeRange.end}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    return await response.json();
  }

  async getInstagramAnalytics(timeRange) {
    const response = await fetch(`https://graph.instagram.com/${this.config.accountId}/insights?metric=impressions,reach,profile_views&period=day&since=${timeRange.start}&until=${timeRange.end}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    return await response.json();
  }

  // Lead generation and prospecting
  async searchProspects(criteria) {
    try {
      switch (this.provider) {
        case 'LINKEDIN':
          return await this.searchLinkedInProspects(criteria);
        case 'TWITTER':
          return await this.searchTwitterProspects(criteria);
        default:
          throw new Error(`Prospect search not supported for ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to search prospects:', error);
      throw error;
    }
  }

  async searchLinkedInProspects(criteria) {
    const params = new URLSearchParams({
      keywords: criteria.keywords || '',
      facet: `industry,${criteria.industry || ''}`,
      count: criteria.limit || 25
    });

    const response = await fetch(`https://api.linkedin.com/v2/people-search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    return await response.json();
  }

  async searchTwitterProspects(criteria) {
    const params = new URLSearchParams({
      query: criteria.keywords || '',
      'user.fields': 'public_metrics,description,location',
      max_results: criteria.limit || 25
    });

    const response = await fetch(`https://api.twitter.com/2/users/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    return await response.json();
  }

  // Utility methods
  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  generateCodeChallenge() {
    const array = new Uint32Array(56/2);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  async uploadTwitterMedia(media) {
    const formData = new FormData();
    formData.append('media', media.file);

    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Twitter media upload error: ${response.status}`);
    }

    const result = await response.json();
    return result.media_id_string;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      let tokenUrl, params;

      switch (this.provider) {
        case 'LINKEDIN':
          tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
          params = {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: SOCIAL_PROVIDERS.LINKEDIN.clientId,
            client_secret: process.env.REACT_APP_LINKEDIN_CLIENT_SECRET
          };
          break;
        case 'TWITTER':
          tokenUrl = 'https://api.twitter.com/2/oauth2/token';
          params = {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: SOCIAL_PROVIDERS.TWITTER.clientId
          };
          break;
        case 'FACEBOOK':
          tokenUrl = 'https://graph.facebook.com/oauth/access_token';
          params = {
            grant_type: 'fb_exchange_token',
            client_id: SOCIAL_PROVIDERS.FACEBOOK.clientId,
            client_secret: process.env.REACT_APP_FACEBOOK_CLIENT_SECRET,
            fb_exchange_token: this.accessToken
          };
          break;
        default:
          throw new Error(`Token refresh not supported for ${this.provider}`);
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;
      
      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token;
      }

      return tokens;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }
}

// Main hook
export const useSocialMediaIntegration = (options = {}) => {
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [socialEngine, setSocialEngine] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { user } = useAuth();

  // Load connected providers
  const { data: providers, isLoading: providersLoading } = useQuery(
    ['social-providers', user?.id],
    async () => {
      const response = await fetch('/api/social/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
    { enabled: !!user }
  );

  useEffect(() => {
    if (providers) {
      setConnectedProviders(providers);
      if (providers.length > 0 && !activeProvider) {
        setActiveProvider(providers[0]);
      }
    }
  }, [providers, activeProvider]);

  // Initialize social engine
  useEffect(() => {
    if (activeProvider) {
      const engine = new SocialMediaIntegrationEngine(
        activeProvider.type,
        activeProvider.config,
        notifications
      );
      engine.accessToken = activeProvider.accessToken;
      engine.refreshToken = activeProvider.refreshToken;
      setSocialEngine(engine);
    }
  }, [activeProvider, notifications]);

  // Connect to social provider
  const connectProvider = useCallback(async (providerType, config = {}) => {
    setIsConnecting(true);
    
    try {
      const engine = new SocialMediaIntegrationEngine(providerType, config, notifications);
      const authResult = await engine.authenticate();
      
      const response = await fetch('/api/social/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: providerType,
          config: config,
          accessToken: engine.accessToken,
          refreshToken: engine.refreshToken,
          ...authResult
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save provider configuration');
      }

      const savedProvider = await response.json();
      
      setConnectedProviders(prev => [...prev, savedProvider]);
      setActiveProvider(savedProvider);
      
      notifications.success(`Successfully connected to ${SOCIAL_PROVIDERS[providerType].name}`);
      queryClient.invalidateQueries(['social-providers']);
      
      return savedProvider;
    } catch (error) {
      console.error('Failed to connect social provider:', error);
      notifications.error(`Failed to connect to ${SOCIAL_PROVIDERS[providerType].name}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [notifications, queryClient]);

  // Get profile
  const { data: profile, isLoading: profileLoading } = useQuery(
    ['social-profile', activeProvider?.id],
    async () => {
      if (!socialEngine) return null;
      return await socialEngine.getProfile();
    },
    { enabled: !!socialEngine }
  );

  // Create post mutation
  const createPostMutation = useMutation(
    async (postData) => {
      if (!socialEngine) {
        throw new Error('No social media provider connected');
      }
      return await socialEngine.createPost(postData);
    },
    {
      onSuccess: () => {
        notifications.success('Post created successfully');
        queryClient.invalidateQueries(['social-posts']);
      },
      onError: (error) => {
        console.error('Failed to create post:', error);
        notifications.error('Failed to create post');
      }
    }
  );

  // Get analytics
  const getAnalytics = useCallback(async (timeRange) => {
    if (!socialEngine) return null;
    return await socialEngine.getAnalytics(timeRange);
  }, [socialEngine]);

  // Search prospects
  const searchProspects = useCallback(async (criteria) => {
    if (!socialEngine) return [];
    return await socialEngine.searchProspects(criteria);
  }, [socialEngine]);

  return {
    // State
    connectedProviders,
    activeProvider,
    isConnecting,
    providersLoading,
    profileLoading,
    
    // Data
    profile,
    availableProviders: SOCIAL_PROVIDERS,
    postTypes: POST_TYPES,
    engagementTypes: ENGAGEMENT_TYPES,
    
    // Actions
    connectProvider,
    setActiveProvider,
    createPost: createPostMutation.mutate,
    getAnalytics,
    searchProspects,
    
    // Loading states
    isCreatingPost: createPostMutation.isLoading,
    
    // Utilities
    socialEngine
  };
};

export default useSocialMediaIntegration;