from django import forms
from phonenumber_field.formfields import PhoneNumberField
from .models import Order
import phonenumbers  # Import phonenumbers here

class OrderForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Имя'}))
    shipping_address = forms.CharField(max_length=255, required=True, widget=forms.TextInput(attrs={'placeholder': 'Адрес доставки'}))
    phone_number = PhoneNumberField(region="RU")
    message = forms.CharField(widget=forms.Textarea(attrs={'placeholder': 'Дополнительная информация'}), required=False)

    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        if not phone:
            raise forms.ValidationError("Пожалуйста, введите номер телефона.")
        try:
            phonenumbers.parse(str(phone), None)  # Validate the number
            return phone
        except phonenumbers.phonenumberutil.NumberParseException as e:
            raise forms.ValidationError(f"Неверный формат номера телефона: {e}")

    class Meta:
        model = Order
        fields = ['shipping_address', 'phone_number', 'message', 'name']
        widgets = {'cart': forms.HiddenInput()}
