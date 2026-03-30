from django.contrib.auth import authenticate,get_user_model
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta

from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Customer, Note, Opportunity
from .pagination import CustomerPagination
from .serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
    NoteSerializer,
    OpportunitySerializer,
    UserSimpleSerializer,
    RegisterSerializer,
)

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "CRM API is running"})
    

User = get_user_model()


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )
    


    
class MeView(APIView):
    def get(self, request):
        serializer = UserSimpleSerializer(request.user)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]    


class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerListSerializer
    pagination_class = CustomerPagination

    def get_queryset(self):
        queryset = Customer.objects.filter(is_active=True).order_by("-created_at")

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company__icontains=search)
            )

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CustomerCreateUpdateSerializer
        return CustomerListSerializer


class CustomerRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.filter(is_active=True).prefetch_related(
        "notes__created_by",
        "opportunities__assigned_to",
    )

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CustomerCreateUpdateSerializer
        return CustomerDetailSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class NoteCreateView(generics.CreateAPIView):
    serializer_class = NoteSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class OpportunityListCreateView(generics.ListCreateAPIView):
    serializer_class = OpportunitySerializer

    def get_queryset(self):
        queryset = Opportunity.objects.select_related("customer", "assigned_to").order_by("-created_at")

        stage = self.request.query_params.get("stage")
        if stage:
            queryset = queryset.filter(stage=stage)

        ordering = self.request.query_params.get("ordering")
        allowed_ordering = ["amount", "-amount", "expected_close", "-expected_close", "created_at", "-created_at"]

        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

class OpportunityRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Opportunity.objects.select_related("customer", "assigned_to")
    serializer_class = OpportunitySerializer

class DashboardSummaryView(APIView):
    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_customers = Customer.objects.filter(is_active=True).count()

        won_revenue_this_month = (
            Opportunity.objects.filter(
                stage="WON",
                created_at__year=now.year,
                created_at__month=now.month,
            ).aggregate(total=Sum("amount"))["total"] or 0
        )

        active_opportunities = Opportunity.objects.exclude(stage__in=["WON", "LOST"]).count()

        new_customers_last_30_days = Customer.objects.filter(
            is_active=True,
            created_at__gte=thirty_days_ago
        ).count()

        opportunities_by_stage_qs = (
            Opportunity.objects.values("stage")
            .annotate(count=Count("id"))
            .order_by("stage")
        )

        opportunities_by_stage = [
            {
                "stage": item["stage"],
                "count": item["count"],
            }
            for item in opportunities_by_stage_qs
        ]

        recent_customers = Customer.objects.filter(is_active=True).order_by("-created_at")[:5]
        recent_customers_data = CustomerListSerializer(recent_customers, many=True).data

        return Response({
            "kpis": {
                "total_customers": total_customers,
                "won_revenue_this_month": won_revenue_this_month,
                "active_opportunities": active_opportunities,
                "new_customers_last_30_days": new_customers_last_30_days,
            },
            "opportunities_by_stage": opportunities_by_stage,
            "recent_customers": recent_customers_data,
        })
class CustomerNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer

    def get_queryset(self):
        customer_id = self.kwargs.get("pk")
        return Note.objects.filter(customer_id=customer_id).select_related("created_by")

    def perform_create(self, serializer):
        customer_id = self.kwargs.get("pk")
        serializer.save(
            created_by=self.request.user,
            customer_id=customer_id
        )