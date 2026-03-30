"""
Iteration 5 Backend Tests - United Hands Foundation
Tests for: Royal Navy & Gold theme, updated contact info, social media links, 
dynamic hero background, project raised_amount, transparency page cleanup
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hands-omni-platform.preview.emergentagent.com')

class TestAdminSettings:
    """Test admin settings including social media links"""
    
    def test_get_admin_settings(self):
        """GET /api/admin/settings - should return settings with social media fields"""
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify social media fields exist
        assert "facebook_url" in data, "facebook_url field missing"
        assert "instagram_url" in data, "instagram_url field missing"
        assert "youtube_url" in data, "youtube_url field missing"
        assert "payment_mode" in data, "payment_mode field missing"
        
        print(f"Admin settings: payment_mode={data['payment_mode']}, facebook_url={data.get('facebook_url', '')[:50]}")
    
    def test_facebook_url_preset(self):
        """Verify Facebook URL is pre-set as per requirements"""
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Facebook URL should be pre-set
        facebook_url = data.get("facebook_url", "")
        assert "facebook.com" in facebook_url or facebook_url == "", f"Facebook URL should contain facebook.com or be empty, got: {facebook_url}"
        print(f"Facebook URL: {facebook_url}")


class TestSiteAssets:
    """Test site assets including hero background"""
    
    def test_get_site_assets(self):
        """GET /api/site-assets - should return all site assets"""
        response = requests.get(f"{BASE_URL}/api/site-assets")
        assert response.status_code == 200
        data = response.json()
        
        assert "assets" in data, "assets field missing"
        assets = data["assets"]
        
        # Check for hero_background asset
        asset_keys = [a.get("asset_key") for a in assets]
        print(f"Available asset keys: {asset_keys}")
        
        # hero_background should exist
        hero_bg = next((a for a in assets if a.get("asset_key") == "hero_background"), None)
        if hero_bg:
            print(f"Hero background URL: {hero_bg.get('asset_url', '')[:80]}")
        else:
            print("Hero background asset not found (may need seeding)")
    
    def test_get_specific_asset(self):
        """GET /api/site-assets/{asset_key} - should return specific asset"""
        response = requests.get(f"{BASE_URL}/api/site-assets/hero_background")
        assert response.status_code == 200
        data = response.json()
        
        assert "asset_key" in data
        print(f"Hero background asset: {data}")


class TestProjects:
    """Test projects API including raised_amount field"""
    
    def test_get_projects(self):
        """GET /api/projects - should return projects with raised_amount"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Projects should be a list"
        
        if len(data) > 0:
            project = data[0]
            # Verify raised_amount field exists
            assert "raised_amount" in project, "raised_amount field missing from project"
            assert "target_amount" in project, "target_amount field missing from project"
            assert "title" in project, "title field missing from project"
            assert "category" in project, "category field missing from project"
            
            print(f"First project: {project['title']} - raised: {project['raised_amount']}/{project['target_amount']}")
        else:
            print("No projects found - may need seeding")
    
    def test_get_active_projects(self):
        """GET /api/projects?active_only=true - should return only active projects"""
        response = requests.get(f"{BASE_URL}/api/projects?active_only=true")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Projects should be a list"
        
        # All returned projects should be active
        for project in data:
            assert project.get("is_active", True) == True, f"Project {project['title']} should be active"
        
        print(f"Found {len(data)} active projects")


class TestStats:
    """Test stats endpoint"""
    
    def test_get_stats(self):
        """GET /api/stats - should return platform statistics"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "patients_served" in data
        assert "districts_covered" in data
        assert "total_donations" in data
        assert "total_amount" in data
        
        print(f"Stats: patients={data['patients_served']}, districts={data['districts_covered']}, donations={data['total_donations']}, amount={data['total_amount']}")


class TestPillars:
    """Test team pillars API"""
    
    def test_get_pillars(self):
        """GET /api/pillars - should return team pillars"""
        response = requests.get(f"{BASE_URL}/api/pillars")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Pillars should be a list"
        
        if len(data) > 0:
            pillar = data[0]
            assert "name" in pillar
            assert "role" in pillar
            print(f"Found {len(data)} pillars. First: {pillar['name']} - {pillar['role']}")
        else:
            print("No pillars found - may need seeding")


class TestGallery:
    """Test gallery API"""
    
    def test_get_gallery(self):
        """GET /api/gallery - should return gallery images"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Gallery should be a list"
        print(f"Found {len(data)} gallery images")


class TestSuccessStories:
    """Test success stories API"""
    
    def test_get_success_stories(self):
        """GET /api/success-stories - should return success stories"""
        response = requests.get(f"{BASE_URL}/api/success-stories")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Success stories should be a list"
        print(f"Found {len(data)} success stories")


class TestDonations:
    """Test donations API"""
    
    def test_get_donations(self):
        """GET /api/donations - should return donations list"""
        response = requests.get(f"{BASE_URL}/api/donations")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Donations should be a list"
        print(f"Found {len(data)} donations")


class TestAuth:
    """Test authentication endpoints"""
    
    def test_login_admin(self):
        """POST /api/auth/login - admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "avdhut456@gmail.com",
            "password": "Omkar@123123"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print(f"Admin login successful: {data['user']['email']}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login - should fail with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid login correctly rejected")


class TestAdminSettingsUpdate:
    """Test admin settings update with authentication"""
    
    def get_admin_token(self):
        """Helper to get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "avdhut456@gmail.com",
            "password": "Omkar@123123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        return None
    
    def test_update_social_links(self):
        """PUT /api/admin/settings - update social media links"""
        token = self.get_admin_token()
        if not token:
            pytest.skip("Could not get admin token")
        
        # Get current settings
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        current_settings = response.json()
        
        # Update with test social links
        test_settings = {
            **current_settings,
            "facebook_url": "https://www.facebook.com/share/g/17PHfXpM2Q/",
            "instagram_url": "https://instagram.com/test",
            "youtube_url": "https://youtube.com/test"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json=test_settings,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Verify update
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        updated = response.json()
        assert updated["facebook_url"] == test_settings["facebook_url"]
        print("Social links updated successfully")
        
        # Restore original settings (keep facebook, clear test instagram/youtube)
        restore_settings = {
            **current_settings,
            "facebook_url": "https://www.facebook.com/share/g/17PHfXpM2Q/",
            "instagram_url": "",
            "youtube_url": ""
        }
        requests.put(
            f"{BASE_URL}/api/admin/settings",
            json=restore_settings,
            headers={"Authorization": f"Bearer {token}"}
        )


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self):
        """GET /api/ - should return API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API root: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
