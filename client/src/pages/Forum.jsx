import { useState, useEffect } from "react";
import { getForumPosts, createForumPost, upvoteForumPost, addForumReply, deleteForumPost } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helpers";

const CATEGORIES = [
  { key: "", label: "All Posts", icon: "📋" },
  { key: "placement-tips", label: "Placement Tips", icon: "🎯" },
  { key: "company-reviews", label: "Company Reviews", icon: "🏢" },
  { key: "doubt-clearing", label: "Doubt Clearing", icon: "❓" },
  { key: "resources", label: "Resources", icon: "📚" },
  { key: "general", label: "General", icon: "💬" },
];

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "", page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general", tags: "" });
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => { fetchPosts(); }, [filters.category, filters.page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await getForumPosts(filters);
      setPosts(data.posts || []);
      setPagination(data.pagination || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createForumPost({
        ...newPost,
        tags: newPost.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setShowCreate(false);
      setNewPost({ title: "", content: "", category: "general", tags: "" });
      fetchPosts();
    } catch (err) { alert(err.response?.data?.message || "Failed to create post."); }
    finally { setCreating(false); }
  };

  const handleUpvote = async (id) => {
    try {
      const { data } = await upvoteForumPost(id);
      setPosts(posts.map((p) => p._id === id ? { ...p, upvotes: data.upvoted ? [...(p.upvotes || []), user._id] : (p.upvotes || []).filter((u) => u !== user._id) } : p));
    } catch (err) { console.error(err); }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const { data } = await addForumReply(id, replyText);
      setPosts(posts.map((p) => p._id === id ? data.post : p));
      setReplyText("");
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try { await deleteForumPost(id); fetchPosts(); }
    catch (err) { alert("Failed to delete post."); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="forum-page">
      <div className="forum-container">
        <div className="forum-header">
          <div>
            <h1>💬 Discussion Forum</h1>
            <p>Share tips, ask doubts, and connect with fellow placement aspirants</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "✍️ New Post"}
          </button>
        </div>

        {/* Create Post Form */}
        {showCreate && (
          <div className="forum-create-card">
            <h2>✍️ Create New Post</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <input type="text" placeholder="Post title..." value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required maxLength={200} />
              </div>
              <div className="form-group">
                <textarea placeholder="Share your thoughts..." value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} required rows={4} maxLength={5000} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
                    {CATEGORIES.slice(1).map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Tags (comma-separated)" value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "Posting..." : "📤 Post"}
              </button>
            </form>
          </div>
        )}

        {/* Category Tabs */}
        <div className="forum-categories">
          {CATEGORIES.map((c) => (
            <button key={c.key}
              className={`forum-cat-btn ${filters.category === c.key ? "active" : ""}`}
              onClick={() => setFilters({ ...filters, category: c.key, page: 1 })}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="forum-search">
          <input type="text" placeholder="Search posts..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <button type="submit">🔍</button>
        </form>

        {/* Posts List */}
        {loading ? (
          <div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading posts...</p></div></div>
        ) : posts.length === 0 ? (
          <div className="empty-state"><p>No posts yet. Be the first to share something!</p></div>
        ) : (
          <div className="forum-posts-list">
            {posts.map((post) => (
              <div key={post._id} className={`forum-post-card ${post.isPinned ? "pinned" : ""}`}>
                <div className="forum-post-header">
                  <div className="forum-post-author">
                    <div className="avatar">{post.userId?.name?.charAt(0)?.toUpperCase() || "?"}</div>
                    <div>
                      <span className="author-name">{post.userId?.name || "Unknown"}</span>
                      <span className="post-date">{formatDate(post.createdAt)} · 👁️ {post.views}</span>
                    </div>
                  </div>
                  {post.isPinned && <span className="pin-badge">📌 Pinned</span>}
                </div>

                <h3 className="forum-post-title" onClick={() => setExpandedId(expandedId === post._id ? null : post._id)}>
                  {post.title}
                </h3>

                <div className="forum-post-meta">
                  <span className="forum-post-category">{CATEGORIES.find((c) => c.key === post.category)?.icon} {post.category}</span>
                  {post.tags?.map((t, i) => <span key={i} className="forum-tag">{t}</span>)}
                </div>

                {expandedId === post._id && (
                  <div className="forum-post-body">
                    <p className="forum-post-content">{post.content}</p>

                    {/* Replies */}
                    {post.replies?.length > 0 && (
                      <div className="forum-replies">
                        <h4>💬 {post.replies.length} {post.replies.length === 1 ? "Reply" : "Replies"}</h4>
                        {post.replies.map((reply, i) => (
                          <div key={i} className="forum-reply">
                            <div className="reply-author">
                              <div className="avatar-sm">{reply.userId?.name?.charAt(0)?.toUpperCase() || "?"}</div>
                              <span className="reply-name">{reply.userId?.name}</span>
                              <span className="reply-date">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p>{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="forum-reply-input">
                      <input type="text" placeholder="Write a reply..." value={expandedId === post._id ? replyText : ""}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleReply(post._id)} />
                      <button onClick={() => handleReply(post._id)} className="reply-btn">Reply</button>
                    </div>
                  </div>
                )}

                <div className="forum-post-actions">
                  <button className={`upvote-btn ${post.upvotes?.includes(user?._id) ? "upvoted" : ""}`} onClick={() => handleUpvote(post._id)}>
                    ▲ {post.upvotes?.length || 0}
                  </button>
                  <button className="comment-btn" onClick={() => setExpandedId(expandedId === post._id ? null : post._id)}>
                    💬 {post.replies?.length || 0}
                  </button>
                  {(post.userId?._id === user?._id || user?.role === "admin") && (
                    <button className="delete-btn-sm" onClick={() => handleDelete(post._id)}>🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="forum-pagination">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="page-btn">← Prev</button>
            <span>Page {pagination.current} of {pagination.total}</span>
            <button disabled={filters.page >= pagination.total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="page-btn">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
