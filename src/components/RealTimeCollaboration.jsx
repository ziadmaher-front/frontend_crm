import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Users, 
  MessageCircle, 
  Activity, 
  Send, 
  X, 
  Eye,
  Edit3,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useCollaboration } from '../hooks/useWebSocket';

const LiveCursor = ({ cursor, userId }) => {
  if (!cursor || cursor.userId === userId) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      <div className="flex items-center space-x-1">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {cursor.userName}
        </div>
      </div>
    </div>
  );
};

const CommentBubble = ({ comment, onClose }) => {
  return (
    <div
      className="fixed z-40 max-w-xs"
      style={{
        left: comment.x,
        top: comment.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <Card className="shadow-lg border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {comment.userName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{comment.userName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700">{comment.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const OnlineUsers = ({ users, currentUserId }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Users className="h-4 w-4" />
          <span>Online ({users.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="text-gray-500 ml-1">(You)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role || 'Team Member'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_joined':
        return <Users className="h-3 w-3 text-green-500" />;
      case 'user_left':
        return <Users className="h-3 w-3 text-gray-500" />;
      case 'comment_added':
        return <MessageCircle className="h-3 w-3 text-blue-500" />;
      case 'record_updated':
        return <Edit3 className="h-3 w-3 text-orange-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'user_joined':
        return `${activity.user.name} joined the session`;
      case 'user_left':
        return `User left the session`;
      case 'comment_added':
        return `${activity.comment.userName} added a comment`;
      case 'record_updated':
        return `${activity.user.name} updated ${activity.recordType}`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Activity className="h-4 w-4" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {activities.slice(-10).reverse().map((activity) => (
              <div key={activity.id} className="flex items-start space-x-2">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const RealTimeCollaboration = ({ roomId, recordType, recordId }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [visibleComments, setVisibleComments] = useState([]);
  const containerRef = useRef(null);

  // Mock user data - in real app, get from auth context
  const currentUser = {
    id: 'user-123',
    name: 'John Doe',
    avatar: null
  };

  const {
    onlineUsers,
    cursors,
    comments,
    activities,
    connectionStatus,
    isConnected,
    sendCursorPosition,
    addComment,
    updateRecord,
    broadcastActivity
  } = useCollaboration(roomId, currentUser.id, currentUser.name);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isConnected) {
        sendCursorPosition(e.clientX, e.clientY);
      }
    };

    const handleClick = (e) => {
      if (e.shiftKey) {
        setCommentPosition({ x: e.clientX, y: e.clientY });
        setShowComments(true);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [isConnected, sendCursorPosition]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(newComment, commentPosition.x, commentPosition.y, recordId);
      setNewComment('');
      setShowComments(false);
    }
  };

  const toggleCommentVisibility = (commentId) => {
    setVisibleComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Live Cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <LiveCursor key={userId} cursor={cursor} userId={currentUser.id} />
      ))}

      {/* Visible Comments */}
      {comments
        .filter(comment => visibleComments.includes(comment.id))
        .map((comment) => (
          <CommentBubble
            key={comment.id}
            comment={comment}
            onClose={() => toggleCommentVisibility(comment.id)}
          />
        ))}

      {/* Comment Input Modal */}
      {showComments && (
        <div
          className="fixed z-50 bg-white border rounded-lg shadow-lg p-4 w-80"
          style={{
            left: Math.min(commentPosition.x, window.innerWidth - 320),
            top: Math.min(commentPosition.y, window.innerHeight - 200)
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Add Comment</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Type your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddComment}>
                <Send className="h-4 w-4 mr-1" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Panel */}
      <div className="fixed top-4 right-4 w-80 space-y-4 z-30">
        {/* Connection Status */}
        <Card className="bg-white/95 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {connectionStatus}
                </span>
              </div>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Online Users */}
        <OnlineUsers users={onlineUsers} currentUserId={currentUser.id} />

        {/* Comments Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Comments ({comments.length})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVisibleComments(
                  visibleComments.length === comments.length 
                    ? [] 
                    : comments.map(c => c.id)
                )}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleCommentVisibility(comment.id)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {comment.userName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {comment.userName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-2 text-xs text-gray-500">
              Shift + Click to add comment
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
};

export default RealTimeCollaboration;