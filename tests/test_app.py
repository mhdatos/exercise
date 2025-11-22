import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_for_activity_success():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already present
    client.delete(f"/activities/{activity}/signup?email={email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Clean up
    client.delete(f"/activities/{activity}/signup?email={email}")

def test_signup_for_activity_duplicate():
    email = "testdupe@mergington.edu"
    activity = "Chess Club"
    # Ensure user is signed up
    client.delete(f"/activities/{activity}/signup?email={email}")
    client.post(f"/activities/{activity}/signup?email={email}")
    # Try duplicate
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]
    # Clean up
    client.delete(f"/activities/{activity}/signup?email={email}")

def test_signup_for_nonexistent_activity():
    response = client.post("/activities/NonexistentActivity/signup?email=foo@mergington.edu")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
