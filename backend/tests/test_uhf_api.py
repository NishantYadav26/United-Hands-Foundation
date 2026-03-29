"""
United Hands Foundation API Tests
Tests for: Auth (user/admin), Projects CRUD, Gallery CRUD, Donations, Settings
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "avdhut456@gmail.com"
ADMIN_PASSWORD = "Omkar@123123"
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@uhf.com"
TEST_USER_PASSWORD = "Test@123"
TEST_USER_NAME = "Test User"


class TestHealthAndBasics:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root working: {data['message']}")
    
    def test_stats_endpoint(self):
        """Test stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "patients_served" in data
        assert "districts_covered" in data
        print(f"✓ Stats endpoint working: {data}")


class TestUserAuth:
    """User authentication tests"""
    
    def test_user_registration(self):
        """Test user registration"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "phone": "9999999999",
            "pan": "ABCDE1234F"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert data["user"]["name"] == TEST_USER_NAME
        print(f"✓ User registration successful: {data['user']['email']}")
        return data["access_token"]
    
    def test_user_registration_duplicate(self):
        """Test duplicate email registration fails"""
        # First register
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Dup User",
            "email": f"dup_{uuid.uuid4().hex[:8]}@test.com",
            "password": "Test@123"
        })
        # Try same email again
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Dup User 2",
            "email": TEST_USER_EMAIL,  # Already registered
            "password": "Test@456"
        })
        assert response.status_code == 400
        print("✓ Duplicate registration correctly rejected")
    
    def test_user_login(self):
        """Test user login"""
        # First ensure user exists
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Login Test",
            "email": f"login_{uuid.uuid4().hex[:8]}@test.com",
            "password": "Test@123"
        })
        
        # Create a new user for login test
        email = f"logintest_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Login Test User",
            "email": email,
            "password": "Test@123"
        })
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": "Test@123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        print(f"✓ User login successful: {data['user']['email']}")
    
    def test_user_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Admin login successful")
        return data["access_token"]
    
    def test_admin_login_wrong_email(self):
        """Test admin login with wrong email"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": "wrong@admin.com",
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 401
        print("✓ Wrong admin email correctly rejected")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Wrong admin password correctly rejected")


class TestProjectsCRUD:
    """Projects CRUD tests"""
    
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
    
    def test_get_projects(self):
        """Test GET projects (public)"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET projects: {len(data)} projects found")
    
    def test_create_project(self, admin_token):
        """Test CREATE project"""
        project_data = {
            "title": f"TEST_Project_{uuid.uuid4().hex[:8]}",
            "category": "Education",
            "description": "Test project description",
            "hero_image": "https://example.com/test.jpg",
            "target_amount": 100000,
            "is_active": True
        }
        response = requests.post(
            f"{BASE_URL}/api/projects",
            json=project_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == project_data["title"]
        assert "id" in data
        print(f"✓ CREATE project: {data['title']}")
        return data["id"]
    
    def test_update_project(self, admin_token):
        """Test UPDATE project"""
        # First create a project
        create_response = requests.post(
            f"{BASE_URL}/api/projects",
            json={
                "title": f"TEST_Update_{uuid.uuid4().hex[:8]}",
                "category": "Health",
                "description": "Original description",
                "hero_image": "",
                "target_amount": 50000,
                "is_active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = create_response.json()["id"]
        
        # Update it
        response = requests.put(
            f"{BASE_URL}/api/projects/{project_id}",
            json={
                "title": "Updated Title",
                "category": "Health",
                "description": "Updated description",
                "hero_image": "",
                "target_amount": 75000,
                "is_active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ UPDATE project: {project_id}")
    
    def test_delete_project(self, admin_token):
        """Test DELETE project"""
        # First create a project
        create_response = requests.post(
            f"{BASE_URL}/api/projects",
            json={
                "title": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
                "category": "General",
                "description": "To be deleted",
                "hero_image": "",
                "target_amount": 10000,
                "is_active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = create_response.json()["id"]
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/projects/{project_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 404
        print(f"✓ DELETE project: {project_id}")


class TestGalleryCRUD:
    """Gallery (Heartiest Moments) CRUD tests"""
    
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
    
    def test_get_gallery(self):
        """Test GET gallery (public)"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET gallery: {len(data)} images found")
    
    def test_create_gallery_image(self, admin_token):
        """Test CREATE gallery image"""
        image_data = {
            "title": f"TEST_Image_{uuid.uuid4().hex[:8]}",
            "description": "Test image description",
            "image_url": "https://example.com/test-image.jpg",
            "category": "impact",
            "display_priority": 0
        }
        response = requests.post(
            f"{BASE_URL}/api/gallery",
            json=image_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == image_data["title"]
        assert "id" in data
        print(f"✓ CREATE gallery image: {data['title']}")
        return data["id"]
    
    def test_update_gallery_image(self, admin_token):
        """Test UPDATE gallery image"""
        # First create an image
        create_response = requests.post(
            f"{BASE_URL}/api/gallery",
            json={
                "title": f"TEST_UpdateImg_{uuid.uuid4().hex[:8]}",
                "description": "Original",
                "image_url": "https://example.com/original.jpg",
                "category": "impact",
                "display_priority": 0
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        image_id = create_response.json()["id"]
        
        # Update it
        response = requests.put(
            f"{BASE_URL}/api/gallery/{image_id}",
            json={
                "title": "Updated Image Title",
                "description": "Updated description",
                "image_url": "https://example.com/updated.jpg",
                "category": "events",
                "display_priority": 1
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ UPDATE gallery image: {image_id}")
    
    def test_delete_gallery_image(self, admin_token):
        """Test DELETE gallery image"""
        # First create an image
        create_response = requests.post(
            f"{BASE_URL}/api/gallery",
            json={
                "title": f"TEST_DeleteImg_{uuid.uuid4().hex[:8]}",
                "description": "To be deleted",
                "image_url": "https://example.com/delete.jpg",
                "category": "field_work",
                "display_priority": 0
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        image_id = create_response.json()["id"]
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/gallery/{image_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ DELETE gallery image: {image_id}")


class TestDonations:
    """Donations API tests"""
    
    def test_get_donations(self):
        """Test GET donations"""
        response = requests.get(f"{BASE_URL}/api/donations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET donations: {len(data)} donations found")
    
    def test_create_donation(self):
        """Test CREATE donation"""
        donation_data = {
            "donor_name": "TEST_Donor",
            "donor_email": "testdonor@example.com",
            "donor_phone": "9999999999",
            "donor_pan": "ABCDE1234F",
            "amount": 1000,
            "utr_number": f"TEST_{uuid.uuid4().hex[:12]}",
            "screenshot_url": "https://example.com/screenshot.jpg",
            "payment_mode": "manual_qr"
        }
        response = requests.post(f"{BASE_URL}/api/donations", json=donation_data)
        assert response.status_code == 200
        data = response.json()
        assert data["donor_name"] == donation_data["donor_name"]
        assert data["status"] == "pending"
        print(f"✓ CREATE donation: {data['id']}")


class TestAdminSettings:
    """Admin settings tests"""
    
    def test_get_settings(self):
        """Test GET settings (public)"""
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        data = response.json()
        assert "payment_mode" in data
        print(f"✓ GET settings: payment_mode={data['payment_mode']}")


class TestPillars:
    """Team Pillars API tests"""
    
    def test_get_pillars(self):
        """Test GET pillars"""
        response = requests.get(f"{BASE_URL}/api/pillars")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET pillars: {len(data)} pillars found")


class TestSuccessStories:
    """Success stories API tests"""
    
    def test_get_success_stories(self):
        """Test GET success stories"""
        response = requests.get(f"{BASE_URL}/api/success-stories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET success stories: {len(data)} stories found")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
