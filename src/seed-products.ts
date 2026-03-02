import mongoose from "mongoose";
import Product from "./models/product.model";
import { connectDatabase } from "./database/mongodb";

const dairyProducts = [
    // --- MILK ---
    {
        name: "DDC Standard Milk (Blue)",
        description: "The most popular pasteurized standard milk from DDC. 3% Fat, 8.5% SNF. Daily essential for tea and coffee.",
        price: 110,
        category: "Milk",
        stock: 100,
        image: "https://sewapoint.com/kirana-images/68169c809c8644db-968c9fd4d6e8e6b8.png",
        calories: 60,
        protein: 3.1,
        fat: 3.0,
        carbohydrates: 4.7,
        isFeatured: true
    },
    {
        name: "DDC Whole Milk (Green)",
        description: "Full cream milk from DDC with 5% Fat. Rich and creamy, perfect for making curd (dahi) at home.",
        price: 140,
        category: "Milk",
        stock: 80,
        image: "https://sewapoint.com/image-1668674264572-goods-image.jpeg",
        calories: 85,
        protein: 3.5,
        fat: 5.0,
        carbohydrates: 4.8,
        isFeatured: false
    },
    {
        name: "DDC Tea Milk",
        description: "Specially formulated for tea shops. Gives a rich color and taste to tea.",
        price: 100,
        category: "Milk",
        stock: 50,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJPFAJEP7UzGxL0VJDFcGZAEE9r7asKhGckQ&s",
        calories: 55,
        protein: 3.0,
        fat: 1.5,
        carbohydrates: 4.7,
        isFeatured: false
    },
    {
        name: "Nd's Pasteurized Milk",
        description: "High-quality pasteurized milk from Nepal Dairy. Fresh from the farm.",
        price: 115,
        category: "Milk",
        stock: 60,
        image: "https://pyxis.nymag.com/v1/imgs/fc0/961/bd27c28b8cfe3adc4cbb34270328bfcb71-toned-raw-milk.1x.rsquare.w1400.jpg",
        calories: 62,
        protein: 3.2,
        fat: 3.2,
        carbohydrates: 4.6,
        isFeatured: false
    },
    {
        name: "Fresh Cow Milk (Local)",
        description: "Pure organic cow milk sourced directly from local farmers in Kathmandu valley.",
        price: 150,
        category: "Milk",
        stock: 30,
        image: "https://rethinkrural.raydientrural.com/hs-fs/hubfs/Blog_Photos/Rural_Life/Food/Uses_for_milk_lead.jpg?length=1151&name=Uses_for_milk_lead.jpg",
        calories: 65,
        protein: 3.3,
        fat: 4.0,
        carbohydrates: 4.9,
        isFeatured: true
    },

    // --- CURD / YOGURT ---
    {
        name: "Juju Dhau (Bhaktapur King Curd)",
        description: "Authentic Juju Dhau from Bhaktapur in traditional clay pot. Sweet, creamy, and custard-like texture.",
        price: 450,
        category: "Curd",
        stock: 25,
        image: "https://cdn.blanxer.com/uploads/647efbd251c1df3943258a4f/product_image-img_9818-1266.png",
        calories: 140,
        protein: 5.5,
        fat: 8.0,
        carbohydrates: 15,
        isFeatured: true
    },
    {
        name: "DDC Yoghurt (Plain)",
        description: "Classic DDC plain yoghurt (500ml). Natural taste, no added sugar.",
        price: 85,
        category: "Curd",
        stock: 75,
        image: "https://wholesalepasalplus.com/uploads/product//DDC_YOUGRT_200GM.jpg.png",
        calories: 60,
        protein: 3.5,
        fat: 3.0,
        carbohydrates: 4.7,
        isFeatured: false
    },
    {
        name: "Nd's Probiotic Dahi",
        description: "Probiotic rich curd from Nepal Dairy. Great for digestion and gut health.",
        price: 110,
        category: "Curd",
        stock: 40,
        image: "https://www.jiomart.com/images/product/original/490308245/amul-prolife-probiotic-dahi-400-g-product-images-o490308245-p606905748-0-202408011903.jpg?im=Resize=(1000,1000)",
        calories: 55,
        protein: 4.0,
        fat: 2.5,
        carbohydrates: 5.0,
        isFeatured: false
    },

    // --- GHEE & BUTTER ---
    {
        name: "DDC Pure Ghee (1L)",
        description: "Authorized pure gland ghee from DDC. The gold standard of ghee in Nepal. Rich aroma.",
        price: 1100,
        category: "Ghee",
        stock: 45,
        image: "https://dealayo.com/media/catalog/product/d/d/ddc-1l-1.png?width=265&height=265&store=default&image-type=image",
        calories: 900,
        protein: 0,
        fat: 100,
        carbohydrates: 0,
        isFeatured: true
    },
    {
        name: "DDC Table Butter (Salted)",
        description: "Classic salted butter (100g) from DDC. Perfect for bread and toast.",
        price: 130,
        category: "Butter",
        stock: 60,
        image: "https://pasal101.thulo.com.np/assets/tenant/uploads/media-uploader/pasal101/20240628011931_256833430.jpg",
        calories: 717,
        protein: 0.9,
        fat: 81,
        carbohydrates: 0.1,
        isFeatured: false
    },
    {
        name: "Amul Butter (500g)",
        description: "The taste of India, widely loved in Nepal. Creamy salted butter.",
        price: 680,
        category: "Butter",
        stock: 30,
        image: "https://www.jiomart.com/images/product/original/490001392/amul-pasteurised-butter-500-g-product-images-o490001392-p490001392-0-202508291839.jpg?im=Resize=(1000,1000)",
        calories: 717,
        protein: 0.9,
        fat: 81,
        carbohydrates: 0.1,
        isFeatured: true
    },
    {
        name: "Sitaram Ghee",
        description: "Pure cow ghee from Sitaram Gokul. Authentic taste and high nutritional value.",
        price: 1050,
        category: "Ghee",
        stock: 20,
        image: "https://img.drz.lazcdn.com/static/np/p/778a8817afb12b1df0d8c84c97ff6f97.jpg_720x720q80.jpg",
        calories: 900,
        protein: 0,
        fat: 100,
        carbohydrates: 0,
        isFeatured: false
    },

    // --- CHEESE & PANEER ---
    {
        name: "Himalayan Yak Cheese (Hard)",
        description: "Aged hard cheese made from Yak milk in the high Himalayas (Rasuwa/Langtang). Smoky, nutty flavor.",
        price: 1600,
        category: "Cheese",
        stock: 15,
        image: "https://nepalemarket.com/cdn/shop/files/NAM06006_600x600_crop_center.jpg?v=1686320355",
        calories: 400,
        protein: 30,
        fat: 32,
        carbohydrates: 1.5,
        isFeatured: true
    },
    {
        name: "Kanchan Cheese",
        description: "Semi-hard cow milk cheese, popular local variety. Great for sandwiches and snacks.",
        price: 1100,
        category: "Cheese",
        stock: 20,
        image: "https://np-live-21.slatic.net/kf/S7c1bb5b4aa964fdbb9f74ae4b923a184s.jpg",
        calories: 380,
        protein: 26,
        fat: 30,
        carbohydrates: 2.0,
        isFeatured: false
    },
    {
        name: "DDC Mozzarella",
        description: "Stretchable mozzarella cheese for Pizza. Best quality from DDC.",
        price: 950,
        category: "Cheese",
        stock: 30,
        image: "https://dealayo.com/media/catalog/product/m/o/mozerella-chess.png?width=265&height=265&store=default&image-type=image",
        calories: 280,
        protein: 24,
        fat: 20,
        carbohydrates: 2.5,
        isFeatured: false
    },
    {
        name: "Fresh Paneer",
        description: "Soft and fresh cottage cheese blocks. Essential for Paneer Butter Masala and Matar Paneer.",
        price: 850,
        category: "Paneer",
        stock: 50,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
        calories: 265,
        protein: 18,
        fat: 20,
        carbohydrates: 1.2,
        isFeatured: true
    },

    // --- ICE CREAM ---
    {
        name: "Nd's Vanilla Ice Cream (1L)",
        description: "Family pack vanilla ice cream from Nepal Dairy. Creamy and smooth.",
        price: 450,
        category: "Ice Cream",
        stock: 25,
        image: "https://5.imimg.com/data5/SELLER/Default/2025/8/537979872/ZH/IS/WX/231264240/1-liter-tub-01-57252fee27-500x500.png",
        calories: 207,
        protein: 3.5,
        fat: 11,
        carbohydrates: 24,
        isFeatured: false
    },
    {
        name: "Nd's 21 Love Ice Cream",
        description: "Famous '21 Love' flavor - a mix of vanilla, strawberry, and nuts. A Nepali favorite.",
        price: 550,
        category: "Ice Cream",
        stock: 20,
        image: "https://scontent.fktm3-1.fna.fbcdn.net/v/t39.30808-6/487967354_9807759639247280_4820724759934614610_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=13d280&_nc_ohc=_YTghpYjnOcQ7kNvwHWdJ5h&_nc_oc=AdnEC7jf8sfmhxFFM_VAUpv26Nkz1-I5cYq7o8SQ8bl1ZdFa-zNcfFpEKxppw-cWppr1H47e_vAz_lIh08LJtMse&_nc_zt=23&_nc_ht=scontent.fktm3-1.fna&_nc_gid=Cpea2Fz4cgw4-vnYKQ4LhQ&oh=00_Afs5qnRzIrjeL3FLqkM5MOdwUo--c41540UHoXRZMlUZqw&oe=69A20455",
        calories: 230,
        protein: 4.0,
        fat: 12,
        carbohydrates: 28,
        isFeatured: true
    },
    {
        name: "Chocolate Ripple Ice Cream",
        description: "Rich chocolate ice cream with fudge ripples.",
        price: 500,
        category: "Ice Cream",
        stock: 20,
        image: "https://anitalianinmykitchen.com/wp-content/uploads/2016/06/coffee-ice-cream-sq-1-of-1.jpg",
        calories: 250,
        protein: 4.0,
        fat: 14,
        carbohydrates: 30,
        isFeatured: false
    },

    // --- SWEETS & OTHERS ---
    {
        name: "Gundpak (Standard)",
        description: "Traditional Nepali sweet made from solidified milk (khoa), sugar, and nuts. Rich and nutritious.",
        price: 1200,
        category: "Sweets",
        stock: 15,
        image: "https://static-01.daraz.com.np/p/cb031c26a6b790b50afa5a6b54a93ab5.jpg",
        calories: 450,
        protein: 12,
        fat: 25,
        carbohydrates: 55,
        isFeatured: true
    },
    {
        name: "Pustakari",
        description: "Hard candy-like sweet made from milk and sugar. Chewy and long-lasting traditional treat.",
        price: 1000,
        category: "Sweets",
        stock: 15,
        image: "https://np-live-21.slatic.net/kf/S7d4100b88fc14185a1232e2af8087cbea.jpg",
        calories: 400,
        protein: 8,
        fat: 15,
        carbohydrates: 70,
        isFeatured: false
    },
    {
        name: "Rasbari (White)",
        description: "Soft cottage cheese balls soaked in sugar syrup. Served chilled.",
        price: 40,
        category: "Sweets",
        stock: 100,
        image: "https://cheers.com.np/uploads/products/09407649101144906141093164664990398421107.png",
        calories: 180,
        protein: 4,
        fat: 2,
        carbohydrates: 35,
        isFeatured: false
    },
    {
        name: "Lalmohan",
        description: "Deep fried mild solids balls soaked in rose-flavored sugar syrup.",
        price: 45,
        category: "Sweets",
        stock: 100,
        image: "https://sewapoint.com/image-1683283675478-salaka-lalmohan.jpeg",
        calories: 250,
        protein: 5,
        fat: 12,
        carbohydrates: 40,
        isFeatured: false
    },
    {
        name: "Fresh Cream (Daily)",
        description: "Unsweetened fresh cream collected daily. Use for cooking or making desserts.",
        price: 450,
        category: "Cream",
        stock: 20,
        image: "https://media.naheed.pk/catalog/product/cache/2f2d0cb0c5f92580479e8350be94f387/1/2/1267797-1.jpg",
        calories: 340,
        protein: 2.5,
        fat: 36,
        carbohydrates: 3.0,
        isFeatured: false
    }
];

async function seedProducts() {
    try {
        await connectDatabase();
        console.log("✅ Connected to database");

        // Clear existing products
        await Product.deleteMany({});
        console.log("🗑️  Cleared existing products");

        // Insert new products
        const inserted = await Product.insertMany(dairyProducts);
        console.log(`✅ Successfully seeded ${inserted.length} Nepali dairy products`);

        console.log("\n📦 Sample products:");
        inserted.slice(0, 3).forEach(product => {
            console.log(`  - ${product.name} (${product.category}): Rs. ${product.price}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding products:", error);
        process.exit(1);
    }
}

seedProducts();
