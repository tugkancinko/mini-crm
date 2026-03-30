from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer, Note, Opportunity


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class NoteSerializer(serializers.ModelSerializer):
    created_by = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ["id", "customer", "content", "created_by", "created_at"]
        read_only_fields = ["id", "created_by", "created_at"]


class OpportunitySerializer(serializers.ModelSerializer):
    assigned_to = UserSimpleSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="assigned_to",
        write_only=True,
        required=False,
        allow_null=True,
    )
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = [
            "id",
            "customer",
            "customer_name",
            "title",
            "amount",
            "stage",
            "assigned_to",
            "assigned_to_id",
            "expected_close",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        new_stage = attrs.get("stage")

        if instance and instance.stage == "LOST" and new_stage == "WON":
            raise serializers.ValidationError({
                "stage": "A LOST opportunity cannot be changed to WON."
            })

        return attrs


class CustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "company",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class CustomerDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    notes = NoteSerializer(many=True, read_only=True)
    opportunities = OpportunitySerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "company",
            "is_active",
            "created_at",
            "updated_at",
            "notes",
            "opportunities",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "company",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_email(self, value):
        qs = Customer.objects.filter(email=value)

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A customer with this email already exists."
            )

        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user