import React, { useEffect, useState } from 'react';
import { getAllTweets, toggleTweetLike, createTweet, getCurrentUser, updateTweet, deleteTweet } from '../services/api';
import TweetCard from '../components/TweetCard';

const TweetsPage = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tweetText, setTweetText] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editTweetId, setEditTweetId] = useState(null);
  const [editTweetText, setEditTweetText] = useState("");
  const [deletingTweetId, setDeletingTweetId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllTweets()
      .then(res => setTweets(res.data?.data?.docs || []))
      .catch(() => setError('Failed to load tweets'))
      .finally(() => setLoading(false));
    // Fetch current user
    getCurrentUser()
      .then(res => setCurrentUser(res.data?.data || null))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleLikeTweet = async (tweet) => {
    // Optimistically update UI
    setTweets((prev) =>
      prev.map((t) =>
        t._id === tweet._id
          ? {
              ...t,
              likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1,
              isLiked: !t.isLiked,
            }
          : t
      )
    );

    try {
      await toggleTweetLike(tweet._id);
      // Optionally: refetch or sync with server if needed
    } catch (err) {
      // Revert UI if error
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweet._id
            ? {
                ...t,
                likesCount: t.isLiked ? t.likesCount + 1 : t.likesCount - 1, // revert
                isLiked: !t.isLiked, // revert
              }
            : t
        )
      );
      // Optionally show error message
    }
  };

  const handlePostTweet = async () => {
    if (!tweetText.trim()) return;
    setPosting(true);
    try {
      const res = await createTweet(tweetText.trim());
      const newTweet = res.data?.data;
      // Inject user info for optimistic UI
      setTweets((prev) => [{
        ...newTweet,
        owner: currentUser ? {
          avatar: currentUser.avatar,
          fullName: currentUser.fullName,
          username: currentUser.username
        } : undefined,
        likesCount: 0,
        isLiked: false
      }, ...prev]);
      setTweetText("");
    } catch (err) {
      // Optionally set error
    } finally {
      setPosting(false);
    }
  };

  const handleUpdateTweet = (tweet) => {
    setEditTweetId(tweet._id);
    setEditTweetText(tweet.content);
  };

  const handleSaveUpdate = async () => {
    if (!editTweetText.trim()) return;
    try {
      await updateTweet(editTweetId, editTweetText.trim());
      setTweets((prev) => prev.map((t) => t._id === editTweetId ? { ...t, content: editTweetText.trim() } : t));
      setEditTweetId(null);
      setEditTweetText("");
    } catch (err) {
      // Optionally show error
    }
  };

  const handleDeleteTweet = (tweet) => {
    setDeletingTweetId(tweet._id);
  };

  const confirmDeleteTweet = async () => {
    try {
      await deleteTweet(deletingTweetId);
      setTweets((prev) => prev.filter((t) => t._id !== deletingTweetId));
      setDeletingTweetId(null);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>Tweets</h2>
      {/* Tweet input UI */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <input
          value={tweetText}
          onChange={e => setTweetText(e.target.value)}
          placeholder="Create a tweet..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc', backgroundColor: '#111', color: '#fff' }}
          onKeyDown={e => { if (e.key === 'Enter') handlePostTweet(); }}
          disabled={posting}
        />
        <button
          onClick={handlePostTweet}
          style={{ backgroundColor: '#fff', border: '2px solid #111', padding: '6px 12px', cursor: 'pointer', borderRadius: 4, color: '#111', fontWeight: 'bold' }}
          disabled={posting || !tweetText.trim()}
        >
          Post
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && tweets.length === 0 && <div>No tweets found.</div>}
      {!loading && !error && tweets.map((tweet) => (
        <div key={tweet._id}>
          {editTweetId === tweet._id ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                value={editTweetText}
                onChange={e => setEditTweetText(e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc', backgroundColor: '#111', color: '#fff' }}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveUpdate(); if (e.key === 'Escape') setEditTweetId(null); }}
                autoFocus
              />
              <button onClick={handleSaveUpdate} style={{ backgroundColor: '#fff', border: '2px solid #111', padding: '6px 12px', borderRadius: 4, color: '#111', fontWeight: 'bold' }}>Save</button>
              <button onClick={() => setEditTweetId(null)} style={{ backgroundColor: 'transparent', border: '1px solid #666', color: '#fff', borderRadius: 4 }}>Cancel</button>
            </div>
          ) : (
            <TweetCard
              tweet={tweet}
              onLike={handleLikeTweet}
              currentUser={currentUser}
              onUpdate={handleUpdateTweet}
              onDelete={handleDeleteTweet}
            />
          )}
          {/* Delete confirmation modal */}
          {deletingTweetId === tweet._id && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
              <div style={{ background: '#222', padding: 24, borderRadius: 8, minWidth: 300 }}>
                <p style={{ marginBottom: 16, color: '#fff' }}>Are you sure you want to delete this tweet?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button style={{ padding: '4px 8px', backgroundColor: 'transparent', border: '1px solid #666', color: '#fff', borderRadius: 4 }} onClick={() => setDeletingTweetId(null)}>Cancel</button>
                  <button style={{ padding: '4px 8px', backgroundColor: '#d32f2f', border: 'none', color: '#fff', borderRadius: 4 }} onClick={confirmDeleteTweet}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TweetsPage; 