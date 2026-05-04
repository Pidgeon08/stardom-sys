from rest_framework import serializers
from .models import User, Course, Student, Teacher, Schedule, Billing, Specialization

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active']

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'levels', 'is_active', 'created_at']

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    enrolled_courses = CourseSerializer(many=True, read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    course_ids = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True, write_only=True, required=False, source='enrolled_courses')
    name = serializers.SerializerMethodField()
    
    def get_name(self, obj):
        return obj.user.get_full_name()
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'user_details', 'enrolled_courses', 'is_active', 'username', 'email', 'password', 'first_name', 'last_name', 'name', 'course_ids']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField(read_only=True)
    specializations = SpecializationSerializer(many=True, read_only=True)
    # For creating/updating teachers
    username = serializers.CharField(write_only=True, required=False)
    email_input = serializers.EmailField(write_only=True, required=False, source='email')
    password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    specialization_ids = serializers.PrimaryKeyRelatedField(queryset=Specialization.objects.all(), many=True, write_only=True, required=False, source='specializations')
    experience = serializers.IntegerField(required=False)
    
    def get_name(self, obj):
        return obj.user.get_full_name()
    
    def get_email(self, obj):
        return obj.user.email
    
    def to_internal_value(self, data):
        # Map 'email' to 'email_input' for the write operation
        if 'email' in data and 'email_input' not in data:
            data = data.copy() if hasattr(data, 'copy') else dict(data)
            data['email_input'] = data.get('email')
        return super().to_internal_value(data)
    
    class Meta:
        model = Teacher
        fields = ['id', 'user', 'name', 'email', 'username', 'email_input', 'password', 'first_name', 'last_name', 'bio', 'phone', 'specializations', 'specialization_ids', 'experience', 'is_active']

class ScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    student_names = serializers.SerializerMethodField()
    students = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True, required=False)
    student_ids = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True, write_only=True, required=False, source='students')
    
    def get_student_names(self, obj):
        return [student.user.get_full_name() for student in obj.students.all()]
    
    class Meta:
        model = Schedule
        fields = ['id', 'course', 'course_name', 'teacher', 'teacher_name', 'day', 'time', 'sessionType', 'students', 'student_names', 'student_ids', 'active']

class BillingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = Billing
        fields = ['id', 'student', 'student_name', 'course', 'course_name', 'amount', 'payment_type', 'payment_type_display', 'is_paid', 'due_date', 'created_at']
