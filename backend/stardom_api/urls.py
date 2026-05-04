from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import UserViewSet, SpecializationViewSet, CourseViewSet, StudentViewSet, TeacherViewSet, ScheduleViewSet, BillingViewSet, CustomTokenObtainPairView, get_current_user, logout_view

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'specializations', SpecializationViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'billings', BillingViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/me/', get_current_user, name='current_user'),
]
