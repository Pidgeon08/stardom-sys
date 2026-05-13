from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Course, Student, Teacher, Schedule, Billing, User, Specialization
from .serializers import CourseSerializer, StudentSerializer, TeacherSerializer, ScheduleSerializer, BillingSerializer, UserSerializer, SpecializationSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create a new user with the specified role and default password"""
        username = request.data.get('username')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        password = request.data.get('password')
        role = request.data.get('role', 'student')

        # Validate required fields
        if not all([username, email, first_name, last_name, password]):
            return Response(
                {'detail': 'username, email, first_name, last_name, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password,
                role=role
            )
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'user archived'})

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        # If reactivating the user, also reactivate linked Student or Teacher
        if request.data.get('is_active') is True:
            user.is_active = True
            user.save()
            if hasattr(user, 'student'):
                user.student.is_active = True
                user.student.save()
            if hasattr(user, 'teacher'):
                user.teacher.is_active = True
                user.teacher.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        return super().partial_update(request, *args, **kwargs)

class SpecializationViewSet(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [IsAuthenticated]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter by is_active but allow admin to see all
        if self.request.user.role == 'admin':
            return Course.objects.all()
        return Course.objects.filter(is_active=True)

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        course = self.get_object()
        course.is_active = False
        course.save()
        return Response({'status': 'course archived'})

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.filter(is_active=True)
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        from .models import User
        user_data = {
            'username': request.data.get('username'),
            'email': request.data.get('email'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
        }
        password = request.data.get('password', 'Stardom123')  # Default password
        
        if not all([user_data['username'], user_data['email']]):
            return Response({'detail': 'username and email are required'}, status=400)
        
        user = User.objects.create_user(**user_data, password=password, role='student')
        student = Student.objects.create(user=user, is_active=True)
        
        # Add enrolled courses
        course_ids = request.data.get('course_ids', [])
        for course_id in course_ids:
            try:
                course = Course.objects.get(id=course_id)
                student.enrolled_courses.add(course)
            except Course.DoesNotExist:
                pass
        
        serializer = self.get_serializer(student)
        return Response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        student = self.get_object()
        
        # Update user fields
        if 'email' in request.data:
            student.user.email = request.data['email']
        if 'first_name' in request.data:
            student.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            student.user.last_name = request.data['last_name']
        
        # Update enrolled courses if provided
        if 'course_ids' in request.data:
            student.enrolled_courses.clear()
            course_ids = request.data.get('course_ids', [])
            for course_id in course_ids:
                try:
                    course = Course.objects.get(id=course_id)
                    student.enrolled_courses.add(course)
                except Course.DoesNotExist:
                    pass
        
        student.user.save()
        student.save()
        
        serializer = self.get_serializer(student)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        student = self.get_object()
        student.is_active = False
        student.save()
        # Also archive the linked user account so UsersAdmin stays in sync
        student.user.is_active = False
        student.user.save()
        return Response({'status': 'student archived'})

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.filter(is_active=True)
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        from .models import User

        user_data = {
            'username': request.data.get('username'),
            'email': request.data.get('email'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name')
        }
        password = request.data.get('password', 'Stardom123')
        
        if not all([user_data['username'], password, user_data['email']]):
            return Response({'detail': 'username, email, and password are required'}, status=400)
        
        user = User.objects.create_user(**user_data, password=password, role='teacher')
        teacher = Teacher.objects.create(
            user=user,
            phone=request.data.get('phone', ''),
            experience=request.data.get('experience', 1),
            is_active=True
        )
        
        # Add specializations
        specialization_ids = request.data.get('specialization_ids', [])
        for spec_id in specialization_ids:
            try:
                specialization = Specialization.objects.get(id=spec_id)
                teacher.specializations.add(specialization)
            except Specialization.DoesNotExist:
                pass
        
        serializer = self.get_serializer(teacher)
        return Response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        teacher = self.get_object()
        
        # Update teacher fields
        if 'phone' in request.data:
            teacher.phone = request.data['phone']
        if 'experience' in request.data:
            teacher.experience = request.data['experience']
        if 'bio' in request.data:
            teacher.bio = request.data['bio']
        
        # Update specializations if provided
        if 'specialization_ids' in request.data:
            teacher.specializations.clear()
            specialization_ids = request.data.get('specialization_ids', [])
            for spec_id in specialization_ids:
                try:
                    specialization = Specialization.objects.get(id=spec_id)
                    teacher.specializations.add(specialization)
                except Specialization.DoesNotExist:
                    pass
        
        # Update user fields
        if 'email' in request.data:
            teacher.user.email = request.data['email']
        if 'first_name' in request.data:
            teacher.user.first_name = request.data['name']
        if 'last_name' in request.data:
            teacher.user.last_name = request.data['last_name']
        
        teacher.user.save()
        teacher.save()
        
        serializer = self.get_serializer(teacher)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        teacher = self.get_object()
        teacher.is_active = False
        teacher.save()
        # Also archive the linked user account so UsersAdmin stays in sync
        teacher.user.is_active = False
        teacher.user.save()
        return Response({'status': 'teacher archived'})

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        schedule = self.get_object()
        schedule.active = False
        schedule.save()
        return Response({'status': 'schedule archived'})

class BillingViewSet(viewsets.ModelViewSet):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['patch'])
    def mark_paid(self, request, pk=None):
        billing = self.get_object()
        billing.is_paid = True
        billing.save()
        return Response({'status': 'billing marked as paid'})

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Allow login with username
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'user': UserSerializer(user).data
            })
        return Response({'detail': 'Invalid credentials'}, status=401)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint - just confirm the logout.
    Token invalidation happens on the client side by clearing localStorage.
    """
    return Response({'detail': 'Successfully logged out'})