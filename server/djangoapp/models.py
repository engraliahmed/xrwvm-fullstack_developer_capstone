from django.db import models
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.

# <HINT> Create a Car Make model `class CarMake(models.Model)`:
# - Name
# - Description
# - Any other fields you would like to include in car make model
# - __str__ method to print a car make object
class CarMake(models.Model):
    # Name
    name = models.CharField(max_length=100)
    # Description
    description = models.CharField(max_length=500)

    # __str__ method to print a car make object
    def __str__(self):
        return self.name

# <HINT> Create a Car Model model `class CarModel(models.Model):`:
# - Many-To-One relationship to Car Make model (One Car Make has many
# Car Models, using ForeignKey field)
# - Name
# - Type (CharField with a choices argument to provide limited choices
# such as Sedan, SUV, WAGON, etc.)
# - Year (IntegerField) with min value 2015 and max value 2023
# - Any other fields you would like to include in car model
# - __str__ method to print a car make object
class CarModel(models.Model):
    # Many-To-One relationship to Car Make model
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    dealer_id = models.IntegerField(default=0) 
    name = models.CharField(max_length=100)

    CAR_TYPES = [
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('WAGON', 'Wagon'),
        ('TRUCK', 'Truck'),
        ('SPORTS', 'Sports Car'),
        ('OTHER', 'Other'),
    ]
    type = models.CharField(
        max_length=10,
        choices=CAR_TYPES,
        default='SUV'
    )

    # Year (IntegerField) with min value 2015 and max value 2023
    year = models.IntegerField(
        validators=[
            MaxValueValidator(2023), 
            MinValueValidator(2015)  
        ]
    )

    # __str__ method to print the car make and car model object
    def __str__(self):
        return f"{self.car_make.name} - {self.name} ({self.year})"

# <HINT> Create a plain Python class `CarDealer` to store dealer data
# from the external API (Optional, to be used later in Lab 3 or 4)
# class CarDealer:
#     # ...