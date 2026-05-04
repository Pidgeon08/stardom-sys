from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Student, Teacher, Billing, Schedule

User = get_user_model()

class Command(BaseCommand):
    help = 'Fix user roles by cleaning up orphaned Student/Teacher profiles and related records'

    def add_arguments(self, parser):
        parser.add_argument('user_id', type=int, help='User ID to fix')

    def handle(self, *args, **options):
        user_id = options['user_id']
        try:
            user = User.objects.get(id=user_id)
            self.stdout.write(f'Processing user {user.username} (role: {user.role})')

            # Cleanup Student profile if exists
            if hasattr(user, 'student'):
                student = user.student
                # Clear m2m
                student.schedules.clear()
                student.enrolled_courses.clear()
                # Delete related billing
                Billing.objects.filter(student=student).delete()
                # Delete student
                student.delete()
                self.stdout.write(self.style.SUCCESS(f'Deleted Student profile for {user.username}'))

            # Cleanup Teacher profile if exists
            if hasattr(user, 'teacher'):
                teacher = user.teacher
                # Clear m2m
                teacher.specializations.clear()
                # Remove from schedules (reverse)
                Schedule.objects.filter(teacher=teacher).delete()
                # Delete teacher
                teacher.delete()
                self.stdout.write(self.style.SUCCESS(f'Deleted Teacher profile for {user.username}'))

            self.stdout.write(self.style.SUCCESS(f'Successfully fixed user {user_id}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {user_id} not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))

