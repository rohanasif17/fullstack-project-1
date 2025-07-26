import React, { useEffect, useRef, useState } from 'react';
import {
  toggleVideoLike,
  getVideoComments,
  addVideoComment,
  toggleCommentLike,
  getCurrentUser,
  getChannelSubscribers,
  toggleChannelSubscription,
  addVideoView,
  updateComment,
  deleteComment
} from '../services/api';
import CommentItem from './CommentItem';

const VideoPlayer = ({ video, onEnded, playNextPrompt, onPlayNext }) => {
  const videoRef = useRef(null);
  const hasCountedViewRef = useRef(false);

  const [videoData, setVideoData] = useState(video);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(Boolean(video?.isLiked));
  const [likesCount, setLikesCount] = useState(video?.likesCount || 0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [channelId, setChannelId] = useState(video?.owner?.[0]?._id);
  const [subscribersList, setSubscribersList] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);

  const isOwner = Boolean(
    currentUser?._id && (Array.isArray(videoData?.owner) ? videoData?.owner?.[0]?._id : videoData?.owner?._id) === currentUser._id
  );

  useEffect(() => {
    setVideoData(video);
    // Initialize like state from video data
    if (video) {
      setIsLiked(Boolean(video.isLiked));
      setLikesCount(video.likesCount || 0);
    } else {
      setIsLiked(false);
      setLikesCount(0);
    }
    // Handle both array and object formats for owner
    const ownerId = Array.isArray(video?.owner) ? video?.owner?.[0]?._id : video?.owner?._id;
    setChannelId(ownerId);
    setError('');
    setDescExpanded(false);
    setComments([]);
    setCommentText('');
    setSubscribersList([]);
    setSubCount(0);
    hasCountedViewRef.current = false;
    setVideoEnded(false);
  }, [video]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCurrentUser();
        setCurrentUser(res.data?.data || null);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    if (!channelId) return;
    getChannelSubscribers(channelId)
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setSubCount(list.length);
        setSubscribersList(list);
      })
      .catch(() => {});
  }, [channelId]);

  useEffect(() => {
    if (currentUser && subscribersList.length) {
      const subscribed = subscribersList.some((s) => s.subscriber === currentUser._id);
      setIsSubscribed(subscribed);
    }
  }, [currentUser, subscribersList]);

  useEffect(() => {
    if (!videoData?._id) return;
    const fetchComments = async () => {
      try {
        const res = await getVideoComments(videoData._id);
        const data = res.data?.data;
        const commentDocs = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : [];
        setComments(commentDocs);
      } catch {
        /* ignore for now */
      }
    };
    fetchComments();
  }, [videoData?._id]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoData?._id) return;

    const registerView = async () => {
      if (hasCountedViewRef.current) return;
      try {
        await addVideoView(videoData._id);
        hasCountedViewRef.current = true;
        setVideoData((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : prev));
      } catch {
        /* ignore */
      }
    };

    const handleTimeUpdate = () => {
      if (vid.currentTime >= 30) {
        registerView();
      }
    };

    const handlePlay = () => {
      setVideoEnded(false);
    };

    const handleEnded = () => {
      setVideoEnded(true);
      if (onEnded) onEnded();
    };

    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('ended', handleEnded);
    vid.addEventListener('play', handlePlay);

    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('ended', handleEnded);
      vid.removeEventListener('play', handlePlay);
    };
  }, [videoData?._id, onEnded]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return;
      if (e.key === 'ArrowLeft') {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
      } else if (e.key === 'ArrowRight') {
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration || 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLike = async () => {
    if (isOwner) return;
    try {
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => prev + (isLiked ? -1 : 1));
      await toggleVideoLike(videoData._id);
    } catch (error) {
      // revert on error
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => prev + (isLiked ? 1 : -1));
    }
  };

  const handleAddComment = async () => {
    if (isOwner) return;
    if (!commentText.trim()) return;
    try {
      const res = await addVideoComment(videoData._id, commentText.trim());
      const newComment = {
        ...res.data?.data,
        owner: currentUser,
        likesCount: 0,
        isLiked: false,
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch {
      /* ignore */
    }
  };

  const handleToggleCommentLike = async (cId, idx) => {
    try {
      setComments((prev) =>
        prev.map((c, i) => {
          if (i === idx) {
            const liked = !c.isLiked;
            return {
              ...c,
              isLiked: liked,
              likesCount: (c.likesCount || 0) + (liked ? 1 : -1),
            };
          }
          return c;
        })
      );
      await toggleCommentLike(cId);
    } catch {
      setComments((prev) =>
        prev.map((c, i) => {
          if (i === idx) {
            const liked = !c.isLiked;
            return {
              ...c,
              isLiked: liked,
              likesCount: (c.likesCount || 0) + (liked ? 1 : -1),
            };
          }
          return c;
        })
      );
    }
  };

  const handleUpdateComment = async (commentId, newContent, idx) => {
    const oldContent = comments[idx]?.content;
    try {
      setComments((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, content: newContent } : c))
      );
      await updateComment(commentId, newContent);
    } catch {
      setComments((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, content: oldContent } : c))
      );
    }
  };

  const handleDeleteComment = async (commentId, idx) => {
    try {
      setComments((prev) => prev.filter((_, i) => i !== idx));
      await deleteComment(commentId);
    } catch {
      // on error, ideally refetch comments; here, ignore for brevity
    }
  };

  const handleToggleSubscription = async () => {
    if (!channelId) return;
    console.log('Toggling subscription for channelId:', channelId);
    try {
      const res = await toggleChannelSubscription(channelId);
      const subscribed = res.data?.data?.subscribed;
      console.log('Subscription response:', res.data?.data);
      if (typeof subscribed === 'boolean') {
        setIsSubscribed(subscribed);
        setSubCount((prev) => prev + (subscribed ? 1 : -1));
      }
    } catch (error) {
      console.error('Subscription error:', error);
      /* ignore */
    }
  };

  if (!videoData) return null;

  const {
    videoFile,
    title,
    owner,
    description = '',
    views = 0,
    createdAt,
  } = videoData;

  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  const displayDesc = descExpanded || description.length <= 200 ? description : description.slice(0, 200) + '...';

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          src={videoFile?.url || videoFile}
          autoPlay
          controls
          style={styles.video}
          onEnded={onEnded}
        />
        {playNextPrompt && videoEnded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 2
          }}>
            <button
              onClick={onPlayNext}
              style={{
                color: '#e0e0e0',
                background: 'rgba(30,30,30,0.25)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: 'none',
                borderRadius: 12,
                padding: '16px 36px',
                fontWeight: 800,
                fontSize: 22,
                cursor: 'pointer',
                boxShadow: '0 2px 16px #0006',
                pointerEvents: 'auto',
                opacity: 0.97,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {playNextPrompt}
            </button>
          </div>
        )}
      </div>
      <h2 style={styles.title}>{title}</h2>
      <span style={styles.meta}>
        {formatNumber(views)} views{createdAt ? ` · ${getTimeAgo(createdAt)}` : ''}
      </span>
      <div style={styles.channelRow}>
        <img
          src={(Array.isArray(owner) ? owner?.[0]?.avatar?.url : owner?.avatar?.url) || ''}
          alt={(Array.isArray(owner) ? owner?.[0]?.fullName : owner?.fullName) || 'avatar'}
          style={styles.avatar}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={styles.ownerName}>{(Array.isArray(owner) ? owner?.[0]?.fullName : owner?.fullName) || 'Unknown'}</span>
          <span style={styles.subscribers}>{subCount} subscribers</span>
        </div>
        <button
          onClick={handleToggleSubscription}
          style={isSubscribed ? styles.subscribedBtn : styles.subscribeBtn}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
        {!isOwner && (
          <>
            <div style={styles.divider}></div>
            <div style={styles.likeWrapper} onClick={toggleLike} role="button" tabIndex={0}>
              {isLiked ? '👍' : '👍🏻'} &nbsp;{likesCount}
            </div>
          </>
        )}
      </div>
      <div style={styles.descriptionWrapper}>
        <p style={styles.description}>{displayDesc}</p>
        {description.length > 200 && (
          <button style={styles.showMoreBtn} onClick={() => setDescExpanded((p) => !p)}>
            {descExpanded ? 'Show less' : 'See more'}
          </button>
        )}
      </div>
      <h3 style={styles.commentHeading}>{comments.length} Comments</h3>
      {!isOwner && (
        <div style={styles.addCommentRow}>
          <img
            src={currentUser?.avatar?.url || (Array.isArray(owner) ? owner?.[0]?.avatar?.url : owner?.avatar?.url) || ''}
            alt="avatar"
            style={styles.commentAvatar}
          />
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{ ...styles.commentInput, backgroundColor: 'transparent', border: 'none', outline: 'none' }}
            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
          />
          <button onClick={handleAddComment} style={styles.commentPostBtn}>Post</button>
        </div>
      )}
      {comments.map((c, idx) => (
        <CommentItem
          key={c._id}
          comment={c}
          index={idx}
          onToggleLike={handleToggleCommentLike}
          currentUser={currentUser}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          getTimeAgo={getTimeAgo}
        />
      ))}
    </div>
  );
};

const styles = {
  pageWrapper: {
    width: '100%',
    maxWidth: 900,
    margin: '0 auto',
    padding: 16,
    color: '#fff',
    position: 'relative',
    overflow: 'visible',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 'auto',
    borderRadius: 12,
  },
  title: {
    marginTop: 16,
    fontSize: 20,
  },
  channelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  ownerName: {
    fontWeight: 'bold',
  },
  subscribers: {
    fontSize: 12,
    color: '#aaa',
  },
  likeWrapper: {
    backgroundColor: '#212121',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#444',
    marginLeft: 12,
  },
  subscribeBtn: {
    backgroundColor: '#fff',
    border: '2px solid #fff',
    color: '#111',
    padding: '6px 16px',
    cursor: 'pointer',
    borderRadius: 24,
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  subscribedBtn: {
    backgroundColor: 'transparent',
    border: '2px solid #fff',
    color: '#fff',
    padding: '6px 16px',
    cursor: 'pointer',
    borderRadius: 24,
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  descriptionWrapper: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  description: {
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  showMoreBtn: {
    background: 'transparent',
    border: 'none',
    color: '#3ea6ff',
    cursor: 'pointer',
  },
  commentHeading: {
    marginTop: 24,
  },
  addCommentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentInput: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    border: 'none',
    backgroundColor: '#111',
    color: '#fff',
  },
  commentPostBtn: {
    backgroundColor: '#fff',
    border: '2px solid #111',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: 4,
    color: '#111',
    fontWeight: 'bold',
    transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
  },
  commentRow: {
    display: 'flex',
    gap: 12,
    marginTop: 16,
  },
  commentBody: {
    flex: 1,
  },
  commentOwner: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    margin: '4px 0',
  },
  commentLikeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#3ea6ff',
    cursor: 'pointer',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    color: '#fff',
  },
  meta: {
    color: '#aaa',
    fontSize: 14,
  },
};

export default VideoPlayer; 