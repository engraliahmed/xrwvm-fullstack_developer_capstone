# from django.contrib import admin
# from .models import related models


# Register your models here.

# CarModelInline class

# CarModelAdmin class

# CarMakeAdmin class with CarModelInline

# Register models here

from django.contrib import admin
from .models import CarMake, CarModel  # Models ko import karein


class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1


# CarMake Admin Class
class CarMakeAdmin(admin.ModelAdmin):
    inlines = [CarModelInline]
    list_display = ("name", "description")


# CarModel Admin Class
class CarModelAdmin(admin.ModelAdmin):
    list_display = ("name", "car_make", "dealer_id", "type", "year")
    list_filter = ("car_make", "type", "year")
    search_fields = ["name", "car_make__name"]  # Search functionality


admin.site.register(CarMake, CarMakeAdmin)
admin.site.register(CarModel, CarModelAdmin)
