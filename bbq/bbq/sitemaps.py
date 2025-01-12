from django.contrib import sitemaps
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from basket.models import Product


class ProductSitemap(Sitemap):
    changefreq = 'daily'
    priority = 0.8
    protocol = 'https'

    def items(self):
        return Product.objects.all()



class StaticViewSitemap(sitemaps.Sitemap):
    priority = 0.5
    changefreq = "daily"
    protocol = 'https'

    def items(self):
        return ["basket:about", ]

    def location(self, item):
        return reverse(item)
