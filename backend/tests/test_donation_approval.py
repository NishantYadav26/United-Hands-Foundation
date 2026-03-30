"""
Donation Approval/Rejection Tests
Tests for: POST /api/donations/approve with auth token
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "avdhut456@gmail.com"
ADMIN_PASSWORD = "Omkar@123123"


class TestDonationApproval:
    """Donation approval and rejection tests"""
    
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
    
    @pytest.fixture
    def test_donation(self):
        """Create a test donation for approval testing"""
        donation_data = {
            "donor_name": f"TEST_ApprovalDonor_{uuid.uuid4().hex[:8]}",
            "donor_email": "testapproval@example.com",
            "donor_phone": "9999999999",
            "donor_pan": "ABCDE1234F",
            "amount": 500,
            "utr_number": f"TEST_UTR_{uuid.uuid4().hex[:12]}",
            "screenshot_url": "https://example.com/screenshot.jpg",
            "payment_mode": "manual_qr"
        }
        response = requests.post(f"{BASE_URL}/api/donations", json=donation_data)
        assert response.status_code == 200
        return response.json()
    
    def test_approve_donation_success(self, admin_token, test_donation):
        """Test approving a donation with valid auth token"""
        donation_id = test_donation["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/donations/approve",
            json={"donation_id": donation_id, "status": "approved"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "receipt_number" in data
        print(f"✓ Donation approved: {donation_id}, receipt: {data.get('receipt_number')}")
        
        # Verify donation status changed
        donations = requests.get(f"{BASE_URL}/api/donations").json()
        approved_donation = next((d for d in donations if d["id"] == donation_id), None)
        assert approved_donation is not None
        assert approved_donation["status"] == "approved"
        print(f"✓ Donation status verified as 'approved'")
    
    def test_reject_donation_success(self, admin_token, test_donation):
        """Test rejecting a donation with valid auth token"""
        donation_id = test_donation["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/donations/approve",
            json={"donation_id": donation_id, "status": "rejected"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "rejected" in data["message"].lower()
        print(f"✓ Donation rejected: {donation_id}")
        
        # Verify donation status changed
        donations = requests.get(f"{BASE_URL}/api/donations").json()
        rejected_donation = next((d for d in donations if d["id"] == donation_id), None)
        assert rejected_donation is not None
        assert rejected_donation["status"] == "rejected"
        print(f"✓ Donation status verified as 'rejected'")
    
    def test_approve_donation_without_auth(self, test_donation):
        """Test approving donation without auth token fails"""
        donation_id = test_donation["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/donations/approve",
            json={"donation_id": donation_id, "status": "approved"}
        )
        
        # Should fail without auth
        assert response.status_code in [401, 403]
        print(f"✓ Approval without auth correctly rejected: {response.status_code}")
    
    def test_approve_nonexistent_donation(self, admin_token):
        """Test approving non-existent donation returns 404"""
        fake_id = str(uuid.uuid4())
        
        response = requests.post(
            f"{BASE_URL}/api/donations/approve",
            json={"donation_id": fake_id, "status": "approved"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
        print(f"✓ Non-existent donation correctly returns 404")


class TestSiteAssets:
    """Site assets tests - QR code, logo, founders"""
    
    def test_get_qr_code(self):
        """Test QR code asset returns valid URL"""
        response = requests.get(f"{BASE_URL}/api/site-assets/qr_code")
        assert response.status_code == 200
        data = response.json()
        assert "asset_url" in data
        assert data["asset_url"] != ""
        assert "cloudinary" in data["asset_url"] or "emergentagent" in data["asset_url"]
        print(f"✓ QR code URL: {data['asset_url'][:80]}...")
    
    def test_get_logo(self):
        """Test logo asset returns valid URL"""
        response = requests.get(f"{BASE_URL}/api/site-assets/logo")
        assert response.status_code == 200
        data = response.json()
        assert "asset_url" in data
        assert data["asset_url"] != ""
        print(f"✓ Logo URL: {data['asset_url'][:80]}...")
    
    def test_get_all_site_assets(self):
        """Test getting all site assets"""
        response = requests.get(f"{BASE_URL}/api/site-assets")
        assert response.status_code == 200
        data = response.json()
        assert "assets" in data
        assert isinstance(data["assets"], list)
        print(f"✓ Total site assets: {len(data['assets'])}")


class TestUnifiedLogin:
    """Unified login tests - admin and user via same endpoint"""
    
    def test_admin_login_via_unified_endpoint(self):
        """Test admin can login via /api/auth/login and gets role=admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login via unified endpoint: role={data['user']['role']}")
    
    def test_user_login_via_unified_endpoint(self):
        """Test regular user login via /api/auth/login gets role=user"""
        # First register a test user
        test_email = f"unifiedtest_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Unified Test User",
            "email": test_email,
            "password": "Test@123"
        })
        assert reg_response.status_code == 200
        
        # Now login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "Test@123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "user"
        print(f"✓ User login via unified endpoint: role={data['user']['role']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
