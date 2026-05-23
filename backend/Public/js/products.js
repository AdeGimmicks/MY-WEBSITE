const DEFAULT_PRODUCTS = [
  {
    "id": "samsung-smart-remote",
    "name": "Samsung Smart TV Remote",
    "description": "Compatible with most Samsung smart TVs.",
    "price": 0.05,
    "image": "Product images/Samsung Remote Pix/14.png",
    "page": "samsung-remote.html",
    "category": "TV Remotes",
    "stock": 25,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/Samsung Remote Pix/15.png",
      "Product images/Samsung Remote Pix/14.png",
      "Product images/Samsung Remote Pix/17.png",
      "Product images/Samsung Remote Pix/18.png",
      "Product images/Samsung Remote Pix/19.png"
    ]
  },
  {
    "id": "samsung-solar-remote",
    "name": "Samsung Solar TV Remote Replacement",
    "description": "BN59-01455A Solar Voice Remote Replacement.",
    "price": 18.99,
    "image": "Product images/Samsung Solar Remotes/1.png",
    "page": "samsungSolar-remote Replacement.html",
    "category": "TV Remotes",
    "stock": 20,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/Samsung Solar Remotes/1.png",
      "Product images/Samsung Solar Remotes/2.png",
      "Product images/Samsung Solar Remotes/3.jpg",
      "Product images/Samsung Solar Remotes/4.jpg",
      "Product images/Samsung Solar Remotes/5.jpg",
      "Product images/Samsung Solar Remotes/6.jpg"
    ]
  },
  {
    "id": "roku-streaming-remote",
    "name": "Roku Streaming Remote",
    "description": "Works with all Roku streaming devices.",
    "price": 12.49,
    "image": "Product images/Roku Remote control/26.png",
    "page": "Roku-remote.html",
    "category": "TV Remotes",
    "stock": 20,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/Roku Remote control/26.png",
      "Product images/Roku Remote control/27.png",
      "Product images/Roku Remote control/28.png",
      "Product images/Roku Remote control/29.png",
      "Product images/Roku Remote control/30.png",
      "Product images/Roku Remote control/31.png"
    ]
  },
  {
    "id": "fire-tv-voice-remote",
    "name": "Fire TV Voice Remote",
    "description": "Alexa-enabled with voice control features.",
    "price": 18.99,
    "image": "Product images/Alexa Remote Pix/1.png",
    "page": "Alexatv-remote.html",
    "category": "TV Remotes",
    "stock": 18,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/Alexa Remote Pix/1.png",
      "Product images/Alexa Remote Pix/2.png",
      "Product images/Alexa Remote Pix/3.png",
      "Product images/Alexa Remote Pix/4.png",
      "Product images/Alexa Remote Pix/5.png",
      "Product images/Alexa Remote Pix/6.png"
    ]
  },
  {
    "id": "vizio-tv-remote",
    "name": "Vizio TV Replacement Remote",
    "description": "Ready to use out of the box, no setup required.",
    "price": 16.5,
    "image": "Product images/Visio TV Remote/8.png",
    "page": "vizio-remote.html",
    "category": "TV Remotes",
    "stock": 18,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/Visio TV Remote/7.png",
      "Product images/Visio TV Remote/8.png",
      "Product images/Visio TV Remote/9.png",
      "Product images/Visio TV Remote/10.png",
      "Product images/Visio TV Remote/11.png",
      "Product images/Visio TV Remote/12.png"
    ]
  },
  {
    "id": "lg-magic-remote",
    "name": "LG Magic Remote",
    "description": "Smart pointer remote compatible with LG Smart TV.",
    "price": 16.5,
    "image": "Product images/LG Remotes Pix/1.png",
    "page": "lg tv-remote.html",
    "category": "TV Remotes",
    "stock": 20,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/LG Remotes Pix/1.png",
      "Product images/LG Remotes Pix/2.png",
      "Product images/LG Remotes Pix/3.png",
      "Product images/LG Remotes Pix/4.png",
      "Product images/LG Remotes Pix/5.png",
      "Product images/LG Remotes Pix/6.png"
    ]
  },
  {
    "id": "philips-tv-remote",
    "name": "Philips TV Remote Replacement",
    "description": "Compatible with Philips Smart TV.",
    "price": 13.99,
    "image": "Product images/Philip TV remote/22.png",
    "page": "philips tv-remote.html",
    "category": "TV Remotes",
    "stock": 16,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/Philip TV remote/21.png",
      "Product images/Philip TV remote/22.png",
      "Product images/Philip TV remote/23.png",
      "Product images/Philip TV remote/24.png",
      "Product images/Philip TV remote/25.png"
    ]
  },
  {
    "id": "phone-accessory-starter",
    "name": "Phone Accessory Starter Item 1",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter",
    "name": "Charger & Cable Starter Item 1",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "tv-remote-starter-1",
    "name": "TCL TV Remote Replacement",
    "description": "Replacement remote for TCL Roku TVs and compatible TCL smart TV models. Easy to use with quick access buttons for everyday streaming.",
    "price": 10,
    "image": "Product images/TCL Remote Replacements/81sDAEnRQ3L._AC_SL1500_.jpg",
    "page": "product.html?id=tv-remote-starter-1",
    "category": "TV Remotes",
    "stock": 20,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/TCL Remote Replacements/81sDAEnRQ3L._AC_SL1500_.jpg",
      "Product images/TCL Remote Replacements/61LBXnyGryL._AC_SL1500_.jpg",
      "Product images/TCL Remote Replacements/61aqHxexsWL._AC_SL1500_.jpg",
      "Product images/TCL Remote Replacements/51ye1Eqak2L._AC_SL1500_.jpg",
      "Product images/TCL Remote Replacements/71KYtV6lgCL._AC_SL1500_.jpg"
    ]
  },
  {
    "id": "tv-remote-starter-2",
    "name": "TV Remote Starter Item 2",
    "description": "Starter tv remotes product. Replace the photo, name, price, and details in Store Manager.",
    "price": 14.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=tv-remote-starter-2",
    "category": "TV Remotes",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "tv-remote-starter-3",
    "name": "TV Remote Starter Item 3",
    "description": "Starter tv remotes product. Replace the photo, name, price, and details in Store Manager.",
    "price": 14.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=tv-remote-starter-3",
    "category": "TV Remotes",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "tv-remote-starter-4",
    "name": "TV Remote Starter Item 4",
    "description": "Starter tv remotes product. Replace the photo, name, price, and details in Store Manager.",
    "price": 14.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=tv-remote-starter-4",
    "category": "TV Remotes",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "tv-remote-starter-5",
    "name": "TV Remote Starter Item 5",
    "description": "Starter tv remotes product. Replace the photo, name, price, and details in Store Manager.",
    "price": 14.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=tv-remote-starter-5",
    "category": "TV Remotes",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-2",
    "name": "Phone Accessory Starter Item 2",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-2",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-3",
    "name": "Phone Accessory Starter Item 3",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-3",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-4",
    "name": "Phone Accessory Starter Item 4",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-4",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-5",
    "name": "Phone Accessory Starter Item 5",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-5",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-6",
    "name": "Phone Accessory Starter Item 6",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-6",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-7",
    "name": "Phone Accessory Starter Item 7",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-7",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-8",
    "name": "Phone Accessory Starter Item 8",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-8",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-9",
    "name": "Phone Accessory Starter Item 9",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-9",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-10",
    "name": "Phone Accessory Starter Item 10",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-10",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-11",
    "name": "Phone Accessory Starter Item 11",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-11",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "phone-accessory-starter-12",
    "name": "Phone Accessory Starter Item 12",
    "description": "Starter phone accessories product. Replace the photo, name, price, and details in Store Manager.",
    "price": 9.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=phone-accessory-starter-12",
    "category": "Phone Accessories",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-2",
    "name": "Charger & Cable Starter Item 2",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-2",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-3",
    "name": "Charger & Cable Starter Item 3",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-3",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-4",
    "name": "Charger & Cable Starter Item 4",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-4",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-5",
    "name": "Charger & Cable Starter Item 5",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-5",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-6",
    "name": "Charger & Cable Starter Item 6",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-6",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-7",
    "name": "Charger & Cable Starter Item 7",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-7",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-8",
    "name": "Charger & Cable Starter Item 8",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-8",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-9",
    "name": "Charger & Cable Starter Item 9",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-9",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-10",
    "name": "Charger & Cable Starter Item 10",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-10",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-11",
    "name": "Charger & Cable Starter Item 11",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-11",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  },
  {
    "id": "charger-cable-starter-12",
    "name": "Charger & Cable Starter Item 12",
    "description": "Starter chargers & cables product. Replace the photo, name, price, and details in Store Manager.",
    "price": 7.99,
    "image": "Product images/product-placeholder.svg?slot=1",
    "page": "product.html?id=charger-cable-starter-12",
    "category": "Chargers & Cables",
    "stock": 10,
    "active": true,
    "featured": true,
    "gallery": [
      "Product images/product-placeholder.svg?slot=1",
      "Product images/product-placeholder.svg?slot=2",
      "Product images/product-placeholder.svg?slot=3",
      "Product images/product-placeholder.svg?slot=4",
      "Product images/product-placeholder.svg?slot=5",
      "Product images/product-placeholder.svg?slot=6"
    ]
  }
];

function loadManagerPreviewProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem('electronics-manager-catalog-backup') || 'null');
    return Array.isArray(saved) && saved.length ? saved : null;
  } catch (error) {
    return null;
  }
}

function normalizeCategory(category) {
  const value = String(category || '').trim();
  const lower = value.toLowerCase();

  if (!value || lower === 'remote controls' || lower.includes('remote')) return 'TV Remotes';
  if (lower.includes('phone')) return 'Phone Accessories';
  if (lower.includes('charger') || lower.includes('cable')) return 'Chargers & Cables';
  return value;
}

function normalizeProducts(products) {
  const merged = new Map(DEFAULT_PRODUCTS.map(product => [
    product.id,
    { ...product, category: normalizeCategory(product.category) }
  ]));

  (Array.isArray(products) ? products : []).forEach(product => {
    if (!product || !product.id) return;
    const seed = merged.get(product.id) || {};
    const seedHasRealImage = seed.image && !String(seed.image).includes('product-placeholder');
    const productIsEmptyStarter = /^TV Remote Starter Item/.test(String(product.name || ''))
      || String(product.image || '').includes('product-placeholder');
    if (seedHasRealImage && productIsEmptyStarter) return;

    merged.set(product.id, {
      ...seed,
      ...product,
      category: normalizeCategory(product.category || seed.category),
      gallery: Array.isArray(product.gallery) && product.gallery.length
        ? product.gallery
        : seed.gallery
    });
  });

  return Array.from(merged.values());
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('API unavailable');
    return normalizeProducts(await response.json());
  } catch (error) {
    const managerPreviewProducts = loadManagerPreviewProducts();
    if (managerPreviewProducts) return normalizeProducts(managerPreviewProducts);

    try {
      const fallback = await fetch('data/products.json');
      if (!fallback.ok) throw new Error('Fallback unavailable');
      return normalizeProducts(await fallback.json());
    } catch (fallbackError) {
      return normalizeProducts(DEFAULT_PRODUCTS);
    }
  }
}

function renderProductCard(product) {
  const price = Number(product.price || 0).toFixed(2);
  const stock = Number(product.stock || 0);
  const stockText = stock > 0 ? `${stock} in stock` : 'Out of stock';
  const disabledClass = stock > 0 ? '' : ' disabled';
  const productUrl = product.page || `product.html?id=${encodeURIComponent(product.id)}`;

  return `
    <div class="product-card">
      <a href="${productUrl}" class="product-link">
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <p><strong>$${price}</strong></p>
        <p class="stock-note">${stockText}</p>
      </a>
      <div class="buy-btn">
        <a href="#" class="btn small buy-now${disabledClass}"
          data-name="${product.name}"
          data-price="${price}"
          data-image="${product.image}"
          data-product-id="${product.id}">
          Buy Now
        </a>
        <a href="#" class="btn small add-to-cart${disabledClass}"
          data-name="${product.name}"
          data-price="${price}"
          data-image="${product.image}"
          data-product-id="${product.id}">
          Add to Cart
        </a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  const productLists = Array.from(document.querySelectorAll('[data-product-list]'));
  const categorySelect = document.querySelector('[data-product-category-filter]');
  const selectedCategoryFromUrl = new URLSearchParams(window.location.search).get('category') || 'all';
  const productId = document.body.dataset.productId;
  const existingProductMarkup = productLists[0] ? productLists[0].innerHTML : '';

  if (!productLists.length && !productId) return;

  try {
    const products = await loadProducts();

    if (productId) {
      const product = products.find(item => item.id === productId);
      if (product) updateProductDetail(product);
    }

    if (!productLists.length) return;

    const activeProducts = products.filter(product => product.active !== false);

    if (activeProducts.length === 0) {
      productLists.forEach(productList => {
        if (!productList.innerHTML.trim()) {
          productList.innerHTML = '<p>No products are available right now.</p>';
        }
      });
      return;
    }

    const categoryOptions = ['All Products', 'TV Remotes', 'Phone Accessories', 'Chargers & Cables'];
    if (categorySelect) {
      categorySelect.innerHTML = categoryOptions.map(category => `
        <option value="${category === 'All Products' ? 'all' : category}">${category}</option>
      `).join('');
      categorySelect.value = selectedCategoryFromUrl;
    }

    function renderList(productList) {
      const mode = productList.dataset.productList;
      const listCategory = productList.dataset.productCategory;
      const limit = Number(productList.dataset.productLimit || 0);
      const selectedCategory = categorySelect ? categorySelect.value : selectedCategoryFromUrl;
      const category = listCategory || (selectedCategory === 'all' ? '' : selectedCategory);
      let visibleProducts = activeProducts
        .filter(product => mode !== 'featured' || product.featured !== false)
        .filter(product => !category || product.category === category);

      if (limit > 0) visibleProducts = visibleProducts.slice(0, limit);

      productList.innerHTML = visibleProducts.length
        ? visibleProducts.map(renderProductCard).join('')
        : '<p class="empty-products">No products are available in this category yet.</p>';
    }

    function renderFilteredProducts() {
      productLists.forEach(renderList);

      if (typeof bindCartButtons === 'function') {
        bindCartButtons();
      }
    }

    if (categorySelect) categorySelect.addEventListener('change', renderFilteredProducts);
    renderFilteredProducts();
  } catch (error) {
    productLists.forEach(productList => {
      if (existingProductMarkup.trim()) {
        productList.innerHTML = existingProductMarkup;
      } else {
        productList.innerHTML = '<p>Products could not be loaded right now.</p>';
      }
    });
    console.error('Product loading error:', error);
  }
});

function updateProductDetail(product) {
  const price = Number(product.price || 0).toFixed(2);
  const title = document.querySelector('.product-info h2');
  const summary = document.querySelector('.product-info > p');
  const priceLine = Array.from(document.querySelectorAll('.product-info > p'))
    .find(paragraph => paragraph.textContent.includes('Price:'));
  const mainImage = document.getElementById('mainProductImage');

  if (title) title.textContent = product.name;
  if (summary) summary.textContent = product.description;
  if (priceLine) priceLine.innerHTML = `<strong>Price:</strong> $${price}`;
  if (mainImage) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  const gallery = Array.isArray(product.gallery) && product.gallery.length
    ? product.gallery
    : [];
  const thumbnailWrap = document.querySelector('.thumbnails');
  if (thumbnailWrap && gallery.length) {
    thumbnailWrap.innerHTML = gallery.slice(0, 6).map(image => `
      <img src="${image}" alt="${product.name}" onclick="changeImage(this.src)">
    `).join('');
  }

  document.querySelectorAll('.buy-now, .add-to-cart').forEach(button => {
    button.dataset.name = product.name;
    button.dataset.price = price;
    button.dataset.image = product.image;
    button.dataset.productId = product.id;
    button.classList.toggle('disabled', Number(product.stock || 0) <= 0 || product.active === false);
  });

  const existingStock = document.querySelector('.product-stock-note');
  if (existingStock) existingStock.remove();

  const stockNote = document.createElement('p');
  stockNote.className = 'stock-note product-stock-note';
  stockNote.textContent = Number(product.stock || 0) > 0
    ? `${Number(product.stock || 0)} in stock`
    : 'Out of stock';

  const buyButtons = document.querySelector('.product-info .buy-btn');
  if (buyButtons) buyButtons.before(stockNote);

  if (typeof bindCartButtons === 'function') {
    bindCartButtons();
  }
}
