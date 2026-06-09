import os
import pytest

os.environ.setdefault("ADMIN_SECRET", "test-secret")


class TestHealth:
    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json() == {"status": "healthy"}


class TestPosts:
    def test_get_posts_empty(self, client):
        r = client.get("/api/posts")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_post_not_found(self, client):
        r = client.get("/api/posts/nonexistent-slug")
        assert r.status_code == 404

    def test_create_and_get_post(self, client):
        payload = {
            "slug": "test-post",
            "title": "Test Post",
            "summary": "Summary",
            "content": "<p>Content</p>",
            "category": "Geopolítica",
            "read_time": 2,
        }
        r = client.post(
            "/api/admin/posts",
            json=payload,
            headers={"Authorization": "Bearer test-secret"},
        )
        assert r.status_code == 201
        assert r.json()["slug"] == "test-post"

        r = client.get("/api/posts/test-post")
        assert r.status_code == 200
        assert r.json()["title"] == "Test Post"

    def test_create_post_duplicate_slug(self, client):
        payload = {
            "slug": "duplicate-slug",
            "title": "Post A",
            "summary": "s",
            "content": "c",
            "category": "Test",
            "read_time": 1,
        }
        headers = {"Authorization": "Bearer test-secret"}
        client.post("/api/admin/posts", json=payload, headers=headers)
        r = client.post("/api/admin/posts", json=payload, headers=headers)
        assert r.status_code == 400

    def test_search_posts(self, client):
        r = client.get("/api/posts?q=Test")
        assert r.status_code == 200

    def test_filter_posts_by_category(self, client):
        r = client.get("/api/posts?category=Geopolítica")
        assert r.status_code == 200


class TestAdmin:
    def test_login_success(self, client):
        r = client.post("/api/admin/login", json={"secret": "test-secret"})
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_wrong_secret(self, client):
        r = client.post("/api/admin/login", json={"secret": "wrong"})
        assert r.status_code == 401

    def test_stats_unauthorized(self, client):
        r = client.get("/api/admin/stats")
        assert r.status_code == 422  # missing Authorization header

    def test_stats_wrong_token(self, client):
        r = client.get("/api/admin/stats", headers={"Authorization": "Bearer wrong"})
        assert r.status_code == 401

    def test_stats_authorized(self, client):
        r = client.get("/api/admin/stats", headers={"Authorization": "Bearer test-secret"})
        assert r.status_code == 200
        data = r.json()
        assert "posts" in data
        assert "comments" in data
        assert "subscribers" in data

    def test_delete_post(self, client):
        headers = {"Authorization": "Bearer test-secret"}
        client.post(
            "/api/admin/posts",
            json={"slug": "to-delete", "title": "Del", "summary": "s", "content": "c", "category": "Test", "read_time": 1},
            headers=headers,
        )
        r = client.delete("/api/admin/posts/to-delete", headers=headers)
        assert r.status_code == 204

        r = client.get("/api/posts/to-delete")
        assert r.status_code == 404


class TestNewsletter:
    def test_subscribe(self, client):
        r = client.post("/api/newsletter/subscribe", json={"email": "test@example.com"})
        assert r.status_code == 200

    def test_subscribe_duplicate(self, client):
        client.post("/api/newsletter/subscribe", json={"email": "dup@example.com"})
        r = client.post("/api/newsletter/subscribe", json={"email": "dup@example.com"})
        assert r.status_code == 200  # idempotent

    def test_admin_list_subscribers(self, client):
        r = client.get("/api/admin/newsletter", headers={"Authorization": "Bearer test-secret"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)
