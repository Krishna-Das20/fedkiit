"use client";

import { useEffect, useState } from "react";
import type { SocialPost, Platform } from "@/lib/types/SocialPost";
import styles from "./SocialManagementAdmin.module.scss";

const API = "/api/social-posts";

/**
 * No credential is handled here. The session cookie is httpOnly, so the browser
 * attaches it to these requests on its own and this component never sees it.
 *
 * This replaced a password prompt whose value was kept in sessionStorage and a
 * readable cookie — anything that could run script on the page could read the
 * admin password and keep it for a day.
 */
const JSON_HEADERS = { "Content-Type": "application/json" };

export default function SocialManagementAdminPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [platform, setPlatform] = useState<Platform>("instagram");
  const [postUrl, setPostUrl] = useState("");
  const [caption, setCaption] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editCaption, setEditCaption] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch(API);
    if (res.status === 401 || res.status === 403) {
      setError("You do not have permission to manage social posts.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      setPosts(data.data);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(API, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ platform, url: postUrl, caption }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.message || "Failed to add post");
      return;
    }
    setPostUrl("");
    setCaption("");
    fetchPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function handleVisibilityToggle(id: string, current: boolean) {
    await fetch(`${API}/${id}/visibility`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ isVisible: !current }),
    });
    fetchPosts();
  }

  async function handleEditSave(id: string, currentPlatform: Platform) {
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        platform: currentPlatform,
        url: editUrl,
        caption: editCaption,
      }),
    });
    setEditId(null);
    fetchPosts();
  }

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>
        <span>Social</span> Posts Management
      </h1>

      <form onSubmit={handleAdd} className={styles.addCard}>
        <h2 className={styles.addTitle}>Add new post</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.fields}>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className={styles.select}
            aria-label="Platform"
          >
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <input
            type="url"
            placeholder="Post URL"
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            required
            className={`${styles.input} ${styles.inputUrl}`}
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={`${styles.input} ${styles.inputCaption}`}
          />
          <button type="submit" className={styles.btnPrimary}>
            Add
          </button>
        </div>
      </form>

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colPlatform}>Platform</th>
                <th>URL</th>
                <th>Caption</th>
                <th className={styles.colVisible}>Visible</th>
                <th className={styles.colActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) =>
                editId === post.id ? (
                  <tr key={post.id}>
                    <td data-label="Platform" className={styles.platform}>
                      {post.platform}
                    </td>
                    <td data-label="URL" className={styles.cellStacked}>
                      <input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className={styles.editInput}
                        aria-label="Post URL"
                      />
                    </td>
                    <td data-label="Caption" className={styles.cellStacked}>
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className={styles.editInput}
                        aria-label="Caption"
                      />
                    </td>
                    <td data-label="Visible" className={styles.muted}>
                      —
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleEditSave(post.id, post.platform)}
                          className={styles.btnSave}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className={styles.btnLink}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={post.id}>
                    <td data-label="Platform" className={styles.platform}>
                      {post.platform}
                    </td>
                    <td data-label="URL" className={styles.cellStacked}>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        {post.url}
                      </a>
                    </td>
                    <td data-label="Caption" className={styles.caption}>
                      {post.caption || "—"}
                    </td>
                    <td data-label="Visible">
                      <button
                        onClick={() => handleVisibilityToggle(post.id, post.isVisible)}
                        className={`${styles.toggle} ${
                          post.isVisible ? styles.toggleOn : ""
                        }`}
                        role="switch"
                        aria-checked={post.isVisible}
                        aria-label={
                          post.isVisible ? "Hide this post" : "Show this post"
                        }
                      >
                        <span
                          className={`${styles.knob} ${
                            post.isVisible ? styles.knobOn : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        <button
                          onClick={() => {
                            setEditId(post.id);
                            setEditUrl(post.url);
                            setEditCaption(post.caption ?? "");
                          }}
                          className={styles.btnLink}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className={styles.btnDanger}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
