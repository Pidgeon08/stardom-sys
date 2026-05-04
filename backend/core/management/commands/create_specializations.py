from django.core.management.base import BaseCommand
from core.models import Course, Specialization

class Command(BaseCommand):
    help = 'Ensure specializations exist for all courses'

    def handle(self, *args, **options):
        # Get all courses and create specializations for them if they don't exist
        courses = Course.objects.all()
        created_count = 0
        existing_count = 0

        for course in courses:
            specialization, created = Specialization.objects.get_or_create(name=course.name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created specialization: {course.name}'))
                created_count += 1
            else:
                existing_count += 1

        # Remove specializations that don't match any course
        course_names = set(courses.values_list('name', flat=True))
        all_specs = Specialization.objects.all()
        for spec in all_specs:
            if spec.name not in course_names:
                self.stdout.write(self.style.WARNING(f'Removing specialization not matching any course: {spec.name}'))
                spec.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully verified specializations - Created: {created_count}, Already existed: {existing_count}'
            )
        )

