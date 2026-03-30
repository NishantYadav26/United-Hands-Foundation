"""
New Features Tests - Iteration 3
Tests for: Videos CRUD, AI extraction endpoint, Razorpay settings, Admin settings persistence
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "avdhut456@gmail.com"
ADMIN_PASSWORD = "Omkar@123123"


class TestVideoCRUD:
    """Video clips CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    def test_get_videos_public(self):
        """Test GET /api/videos (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/videos: {len(data)} videos found")
    
    def test_create_video(self, admin_token):
        """Test POST /api/videos (requires auth)"""
        video_data = {
            "title": f"TEST_Video_{uuid.uuid4().hex[:8]}",
            "description": "Test video description",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "thumbnail_url": "https://example.com/thumb.jpg",
            "category": "Field Work"
        }
        response = requests.post(
            f"{BASE_URL}/api/videos",
            json=video_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == video_data["title"]
        assert "id" in data
        print(f"✓ POST /api/videos: Created video {data['id']}")
        return data["id"]
    
    def test_create_video_without_auth(self):
        """Test POST /api/videos without auth fails"""
        video_data = {
            "title": "Unauthorized Video",
            "description": "Should fail",
            "video_url": "https://youtube.com/watch?v=test",
            "thumbnail_url": "",
            "category": "Events"
        }
        response = requests.post(f"{BASE_URL}/api/videos", json=video_data)
        assert response.status_code in [401, 403]
        print("✓ POST /api/videos without auth correctly rejected")
    
    def test_delete_video(self, admin_token):
        """Test DELETE /api/videos/{id}"""
        # First create a video
        create_response = requests.post(
            f"{BASE_URL}/api/videos",
            json={
                "title": f"TEST_DeleteVideo_{uuid.uuid4().hex[:8]}",
                "description": "To be deleted",
                "video_url": "https://youtube.com/watch?v=delete123",
                "thumbnail_url": "",
                "category": "Events"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        video_id = create_response.json()["id"]
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/videos/{video_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        print(f"✓ DELETE /api/videos/{video_id}: Video deleted")
        
        # Verify deletion - video should not be in list
        videos = requests.get(f"{BASE_URL}/api/videos").json()
        video_ids = [v["id"] for v in videos]
        assert video_id not in video_ids
        print("✓ Video deletion verified")
    
    def test_delete_nonexistent_video(self, admin_token):
        """Test DELETE /api/videos/{id} for non-existent video returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/videos/{fake_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
        print("✓ DELETE non-existent video correctly returns 404")


class TestAIExtraction:
    """AI extraction endpoint tests (without actual file upload to save API credits)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    def test_ai_extract_endpoint_exists(self, admin_token):
        """Test that POST /api/ai/extract-story endpoint exists and requires file"""
        # Send request without file - should get 422 (validation error) not 404
        response = requests.post(
            f"{BASE_URL}/api/ai/extract-story",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # 422 means endpoint exists but validation failed (no file)
        # 404 would mean endpoint doesn't exist
        assert response.status_code in [422, 400]
        print(f"✓ POST /api/ai/extract-story endpoint exists (status: {response.status_code})")
    
    def test_ai_extract_without_auth(self):
        """Test POST /api/ai/extract-story without auth fails"""
        response = requests.post(f"{BASE_URL}/api/ai/extract-story")
        assert response.status_code in [401, 403]
        print("✓ POST /api/ai/extract-story without auth correctly rejected")


class TestRazorpaySettings:
    """Razorpay configuration settings tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    def test_get_settings_has_razorpay_fields(self):
        """Test GET /api/admin/settings includes Razorpay fields"""
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Check Razorpay fields exist
        assert "razorpay_key_id" in data
        assert "razorpay_key_secret" in data
        assert "razorpay_enabled" in data
        assert "payment_mode" in data
        print(f"✓ Settings include Razorpay fields: key_id={data.get('razorpay_key_id', '')[:10]}...")
    
    def test_update_razorpay_settings(self, admin_token):
        """Test PUT /api/admin/settings updates Razorpay credentials"""
        # Get current settings
        current = requests.get(f"{BASE_URL}/api/admin/settings").json()
        
        # Update with test Razorpay credentials
        test_key_id = f"rzp_test_{uuid.uuid4().hex[:12]}"
        test_secret = f"secret_{uuid.uuid4().hex[:16]}"
        
        updated_settings = {
            **current,
            "razorpay_key_id": test_key_id,
            "razorpay_key_secret": test_secret
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json=updated_settings,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print("✓ PUT /api/admin/settings: Razorpay credentials updated")
        
        # Verify persistence
        verify = requests.get(f"{BASE_URL}/api/admin/settings").json()
        assert verify["razorpay_key_id"] == test_key_id
        assert verify["razorpay_key_secret"] == test_secret
        print("✓ Razorpay credentials persisted in MongoDB")
    
    def test_update_settings_without_auth(self):
        """Test PUT /api/admin/settings without auth fails"""
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json={"payment_mode": "razorpay"}
        )
        assert response.status_code in [401, 403]
        print("✓ PUT /api/admin/settings without auth correctly rejected")
    
    def test_toggle_payment_mode(self, admin_token):
        """Test toggling payment mode between manual_qr and razorpay"""
        # Get current settings
        current = requests.get(f"{BASE_URL}/api/admin/settings").json()
        original_mode = current["payment_mode"]
        
        # Toggle to opposite mode
        new_mode = "razorpay" if original_mode == "manual_qr" else "manual_qr"
        updated = {**current, "payment_mode": new_mode}
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json=updated,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        # Verify change
        verify = requests.get(f"{BASE_URL}/api/admin/settings").json()
        assert verify["payment_mode"] == new_mode
        print(f"✓ Payment mode toggled from {original_mode} to {new_mode}")
        
        # Restore original mode
        restore = {**verify, "payment_mode": original_mode}
        requests.put(
            f"{BASE_URL}/api/admin/settings",
            json=restore,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print(f"✓ Payment mode restored to {original_mode}")


class TestPressMediaEndpoint:
    """Press media endpoint tests"""
    
    def test_get_press_media(self):
        """Test GET /api/press-media"""
        response = requests.get(f"{BASE_URL}/api/press-media")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/press-media: {len(data)} items found")
    
    def test_get_press_media_with_filters(self):
        """Test GET /api/press-media with district and year filters"""
        response = requests.get(f"{BASE_URL}/api/press-media", params={
            "district": "Latur",
            "year": "2025"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/press-media with filters: {len(data)} items found")


class TestSuccessStories:
    """Success stories endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    def test_get_success_stories(self):
        """Test GET /api/success-stories"""
        response = requests.get(f"{BASE_URL}/api/success-stories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/success-stories: {len(data)} stories found")
    
    def test_create_success_story(self, admin_token):
        """Test POST /api/success-stories"""
        story_data = {
            "location": "Latur",
            "patient_count": 50,
            "date": "2026-01-15",
            "story_text": f"TEST_Story_{uuid.uuid4().hex[:8]} - Medical camp success",
            "images": []
        }
        response = requests.post(
            f"{BASE_URL}/api/success-stories",
            json=story_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["location"] == story_data["location"]
        assert "id" in data
        print(f"✓ POST /api/success-stories: Created story {data['id']}")


class TestDonationApprovalEmail:
    """Donation approval with email tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]
    
    def test_approve_donation_sends_receipt(self, admin_token):
        """Test that approving donation generates receipt and attempts email"""
        # Create a test donation
        donation_data = {
            "donor_name": f"TEST_EmailDonor_{uuid.uuid4().hex[:8]}",
            "donor_email": "test@example.com",
            "donor_phone": "9999999999",
            "donor_pan": "ABCDE1234F",
            "amount": 1000,
            "utr_number": f"TEST_UTR_{uuid.uuid4().hex[:12]}",
            "screenshot_url": "https://example.com/screenshot.jpg",
            "payment_mode": "manual_qr"
        }
        create_response = requests.post(f"{BASE_URL}/api/donations", json=donation_data)
        assert create_response.status_code == 200
        donation_id = create_response.json()["id"]
        
        # Approve the donation
        response = requests.post(
            f"{BASE_URL}/api/donations/approve",
            json={"donation_id": donation_id, "status": "approved"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "receipt_number" in data
        # Message should indicate either success or email failure (both are valid)
        assert "approved" in data["message"].lower() or "receipt" in data["message"].lower()
        print(f"✓ Donation approved with receipt: {data['receipt_number']}")
        print(f"  Message: {data['message']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
