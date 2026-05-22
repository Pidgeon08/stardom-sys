from django.test import TestCase
from django.utils import timezone
from .models import User, Student, Course, Billing
from datetime import date
from rest_framework.test import APIClient
from rest_framework import status

class BillingArchiveTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='teststudent',
            email='student@test.com',
            first_name='Test',
            last_name='Student',
            role='student',
            password='Password123'
        )
        self.student = Student.objects.create(user=self.user, is_active=True)
        self.course = Course.objects.create(name='Test Course', is_active=True)
        self.billing = Billing.objects.create(
            student=self.student,
            course=self.course,
            amount=100.00,
            due_date=date.today(),
            payment_type='fullpayment',
            is_paid=False,
            is_active=True
        )

    def test_auto_archive_on_save(self):
        self.assertTrue(self.billing.is_active)
        self.assertFalse(self.billing.is_paid)

        self.billing.is_paid = True
        self.billing.save()

        self.assertFalse(self.billing.is_active)


class UserPasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@test.com',
            first_name='Admin',
            last_name='User',
            role='admin',
            password='AdminPassword123'
        )
        self.student_user = User.objects.create_user(
            username='studentuser',
            email='student@test.com',
            first_name='Student',
            last_name='User',
            role='student',
            password='StudentPassword123'
        )
        self.target_user = User.objects.create_user(
            username='targetuser',
            email='target@test.com',
            first_name='Target',
            last_name='User',
            role='student',
            password='InitialPassword123'
        )

    def test_admin_can_reset_password(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/users/{self.target_user.id}/reset-password/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify the password was reset to 'Stardom123'
        self.target_user.refresh_from_db()
        self.assertTrue(self.target_user.check_password('Stardom123'))

    def test_non_admin_cannot_reset_password(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(f'/api/users/{self.target_user.id}/reset-password/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify the password was NOT reset
        self.target_user.refresh_from_db()
        self.assertFalse(self.target_user.check_password('Stardom123'))

