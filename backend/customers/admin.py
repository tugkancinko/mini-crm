from django.contrib import admin
from .models import Customer, Note, Opportunity


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "email", "company", "is_active", "created_at", "updated_at")
    search_fields = ("first_name", "last_name", "email", "company")
    list_filter = ("is_active", "created_at", "updated_at")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "created_by", "created_at")
    search_fields = ("customer__email", "customer__first_name", "customer__last_name", "content")
    list_filter = ("created_at",)


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "customer", "amount", "stage", "assigned_to", "expected_close", "created_at")
    search_fields = ("title", "customer__email", "customer__first_name", "customer__last_name")
    list_filter = ("stage", "created_at", "expected_close")