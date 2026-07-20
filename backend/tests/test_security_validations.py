import os

import pytest
from pydantic import ValidationError

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "test_database")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")

from backend.server import (  # noqa: E402
    DonationCreate,
    RazorpayOrderCreate,
    RazorpayVerifyRequest,
    create_receipt_access_token,
    receipt_access_token_is_valid,
)


def test_donation_create_normalizes_and_validates_sensitive_fields():
    donation = DonationCreate(
        donor_name="Test Donor",
        donor_email="TEST@Example.COM",
        donor_phone="+919876543210",
        donor_pan="abcde1234f",
        amount=500,
        utr_number="UTR12345",
        screenshot_url="data:image/png;base64,abc",
    )

    assert donation.donor_email == "test@example.com"
    assert donation.donor_pan == "ABCDE1234F"


@pytest.mark.parametrize(
    "payload",
    [
        {"amount": 0},
        {"donor_pan": "not-a-pan"},
        {"donor_phone": "bad"},
        {"screenshot_url": "javascript:alert(1)"},
        {"payment_mode": "razorpay"},
    ],
)
def test_donation_create_rejects_invalid_payloads(payload):
    valid_payload = {
        "donor_name": "Test Donor",
        "donor_email": "test@example.com",
        "donor_phone": "+919876543210",
        "donor_pan": "ABCDE1234F",
        "amount": 500,
        "utr_number": "UTR12345",
        "screenshot_url": "data:image/png;base64,abc",
        "payment_mode": "manual_qr",
    }
    valid_payload.update(payload)

    with pytest.raises(ValidationError):
        DonationCreate(**valid_payload)


def test_razorpay_models_validate_amount_and_normalize_identity_fields():
    order = RazorpayOrderCreate(
        amount=1,
        donor_name="Test Donor",
        donor_email="TEST@Example.COM",
    )
    verify = RazorpayVerifyRequest(
        razorpay_order_id="order_123",
        razorpay_payment_id="pay_123",
        razorpay_signature="signature",
        donor_name="Test Donor",
        donor_email="TEST@Example.COM",
        donor_phone="+919876543210",
        donor_pan="abcde1234f",
        amount=1,
    )

    assert order.donor_email == "test@example.com"
    assert verify.donor_email == "test@example.com"
    assert verify.donor_pan == "ABCDE1234F"


def test_receipt_access_token_is_bound_to_donation_identity():
    donation = {
        "id": "donation-1",
        "donor_email": "test@example.com",
        "donor_pan": "ABCDE1234F",
        "receipt_number": "UHF-80G-2026-0001",
    }
    token = create_receipt_access_token(donation)

    assert receipt_access_token_is_valid(donation, token)
    assert not receipt_access_token_is_valid({**donation, "donor_pan": "ZZZZZ9999Z"}, token)
    assert not receipt_access_token_is_valid(donation, "invalid-token")
