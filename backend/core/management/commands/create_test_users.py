from django.core.management.base import BaseCommand
from core.models import User, Student, Teacher, Course

class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@stardom.local',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: admin / admin123'))
        else:
            self.stdout.write('✗ Admin user already exists')

        # Create teacher user
        if not User.objects.filter(username='teacher').exists():
            teacher_user = User.objects.create_user(
                username='teacher',
                email='teacher@stardom.local',
                password='teacher123',
                first_name='John',
                last_name='Instructor',
                role='teacher'
            )
            Teacher.objects.create(user=teacher_user, phone='555-0001', is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created teacher user: teacher / teacher123'))
        else:
            self.stdout.write('✗ Teacher user already exists')

        # Create student user
        if not User.objects.filter(username='student').exists():
            student_user = User.objects.create_user(
                username='student',
                email='student@stardom.local',
                password='student123',
                first_name='Jane',
                last_name='Learner',
                role='student'
            )
            Student.objects.create(user=student_user, phone='555-0002', is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created student user: student / student123'))
        else:
            self.stdout.write('✗ Student user already exists')

        # Create a test course
        if not Course.objects.filter(name='Piano Basics').exists():
            course = Course.objects.create(
                name='Piano Basics',
                description='Learn the fundamentals of piano',
                levels=1,
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created test course: Piano Basics'))
        else:
            self.stdout.write('✗ Piano Basics course already exists')

        self.stdout.write(self.style.SUCCESS('\n✓ Test users created successfully!'))
        self.stdout.write('\nYou can now login with:')
        self.stdout.write('  Admin:   admin / admin123')
        self.stdout.write('  Teacher: teacher / teacher123')
        self.stdout.write('  Student: student / student123')
