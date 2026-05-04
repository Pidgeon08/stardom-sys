from django.contrib import admin
from .models import User, Course, Student, Teacher, Schedule, Billing, Specialization

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'first_name', 'last_name', 'email', 'role']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email', 'role')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if change:
            old_role = obj.role
            new_role = form.cleaned_data.get('role', old_role)
            if new_role != old_role:
                self._cleanup_profiles(obj)
        super().save_model(request, obj, form, change)
    
    def _cleanup_profiles(self, user):
        """Clean up Student/Teacher profiles when role changes to 'admin'"""
        from .models import Student, Teacher, Billing, Schedule
        
        # Delete Student profile
        if hasattr(user, 'student'):
            student = user.student
            # Clear m2m relations first
            student.schedules.clear()
            student.enrolled_courses.clear()
            # Delete related billings
            Billing.objects.filter(student=student).delete()
            student.delete()
        
        # Delete Teacher profile
        if hasattr(user, 'teacher'):
            teacher = user.teacher
            teacher.specializations.clear()
            # Delete schedules taught by this teacher
            Schedule.objects.filter(teacher=teacher).delete()
            teacher.delete()

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'levels', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'get_email', 'is_active']
    list_filter = ['is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_name.short_description = 'Name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'get_email', 'is_active']
    list_filter = ['is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_name.short_description = 'Name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['course', 'teacher', 'day', 'time', 'sessionType', 'active']
    list_filter = ['day', 'course', 'active']
    search_fields = ['course__name', 'teacher__user__first_name']

@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'amount', 'is_paid', 'due_date']
    list_filter = ['is_paid', 'due_date', 'created_at']
    search_fields = ['student__user__first_name', 'course__name']
