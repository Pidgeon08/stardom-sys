from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)

    # Override to avoid reverse accessor clashes
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='core_users',
        related_query_name='core_user',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='core_users',
        related_query_name='core_user',
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    levels = models.PositiveIntegerField(default=1, help_text="Number of levels in this course")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    enrolled_courses = models.ManyToManyField(Course, related_name='students')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.user)

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    specializations = models.ManyToManyField(Specialization, related_name='teachers')
    experience = models.PositiveIntegerField(default=1, help_text="Years of experience")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.user)

class Schedule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    students = models.ManyToManyField(Student, blank=True, related_name='schedules')
    day = models.CharField(max_length=20, default='Monday')  # Day of week
    time = models.CharField(max_length=20)  # Time slot like "7:30 AM"
    sessionType = models.CharField(max_length=20, default='Single')  # Single, Duo, Trio, Group
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.name} - {self.day} {self.time}"

class Billing(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('online', 'Online'),
        ('downpayment', 'Downpayment'),
        ('fullpayment', 'Fullpayment'),
    ]
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='fullpayment', null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_paid:
            self.is_active = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Billing for {self.student} - {self.amount} ({self.get_payment_type_display()})"


# Signal to automatically create Specialization when Course is created
@receiver(post_save, sender=Course)
def create_specialization_for_course(sender, instance, created, **kwargs):
    """Automatically create a Specialization with the same name when a Course is created"""
    if created:
        Specialization.objects.get_or_create(name=instance.name)
