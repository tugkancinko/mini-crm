from django.urls import path
from .views import (
    CustomerNoteListCreateView,
    LoginView,
    MeView,
    RegisterView,
    CustomerListCreateView,
    CustomerRetrieveUpdateDeleteView,
    CustomerNoteListCreateView,
    OpportunityListCreateView,
    OpportunityRetrieveUpdateView,
    DashboardSummaryView,
    HealthCheckView,
)

urlpatterns = [
    path("", HealthCheckView.as_view(), name="health-check"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/register/", RegisterView.as_view(), name="register"),

    path("customers/", CustomerListCreateView.as_view(), name="customer-list-create"),
    path("customers/<int:pk>/", CustomerRetrieveUpdateDeleteView.as_view(), name="customer-detail"),

    path("customers/<int:pk>/notes/", CustomerNoteListCreateView.as_view()),

    path("opportunities/", OpportunityListCreateView.as_view(), name="opportunity-list-create"),
    path("opportunities/<int:pk>/", OpportunityRetrieveUpdateView.as_view(), name="opportunity-detail-update"),

    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    
]