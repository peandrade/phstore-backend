import "dotenv/config";

import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function seedKits() {
  console.log("🎁 Starting kits seeding...");

  await prisma.kitProduct.deleteMany();
  await prisma.kit.deleteMany();
  console.log("✅ Existing kits cleaned!");

  const products = await prisma.product.findMany({
    include: { category: true },
  });

  const shirts = products.filter((p) => p.category.slug === "camisas");
  const caps = products.filter((p) => p.category.slug === "bones");

  const findProduct = (items: typeof products, search: string) =>
    items.find((p) => p.label.toLowerCase().includes(search.toLowerCase()));

  const calculateKitPrice = (items: { price: number }[], discountPercent: number) => {
    const original = items.reduce((sum, item) => sum + item.price, 0);
    const final = original * (1 - discountPercent / 100);
    return { original: Math.round(original * 100) / 100, final: Math.round(final * 100) / 100 };
  };

  const kitsData = [
    {
      slug: "kit-dev-completo",
      label: "Kit Dev Completo",
      description:
        "O kit perfeito para quem respira código! Inclui uma camisa React e um boné B7 para completar o visual.",
      discount: 15,
      products: [
        { search: "React Azul", category: "camisas" },
        { search: "Azul", category: "bones" },
      ],
      image: "kit-dev-completo.png",
    },
    {
      slug: "kit-fullstack",
      label: "Kit Fullstack Developer",
      description:
        "Frontend e backend em um só kit! Camisa Node.js + Camisa React para o dev que faz de tudo.",
      discount: 20,
      products: [
        { search: "Node", category: "camisas" },
        { search: "React Azul", category: "camisas" },
      ],
      image: "kit-fullstack.png",
    },
    {
      slug: "kit-php-lover",
      label: "Kit PHP Lover",
      description:
        "Para os amantes do elefante! Camisa PHP + Camisa Laravel, a dupla dinâmica do backend.",
      discount: 18,
      products: [
        { search: "PHP Azul", category: "camisas" },
        { search: "Laravel Branca", category: "camisas" },
      ],
      image: "kit-php-lover.png",
    },
    {
      slug: "kit-frontend-master",
      label: "Kit Frontend Master",
      description: "HTML, CSS e JavaScript - a santíssima trindade do frontend em um kit especial!",
      discount: 25,
      products: [
        { search: "HTML", category: "camisas" },
        { search: "CSS", category: "camisas" },
        { search: "JavaScript", category: "camisas" },
      ],
      image: "kit-frontend-master.png",
    },
    {
      slug: "kit-react-total",
      label: "Kit React Total",
      description:
        "Para quem é apaixonado por React! 3 camisas React em cores diferentes + boné combinando.",
      discount: 22,
      products: [
        { search: "React Azul", category: "camisas" },
        { search: "React Cinza", category: "camisas" },
        { search: "React Preta", category: "camisas" },
        { search: "Preto", category: "bones" },
      ],
      image: "kit-react-total.png",
    },
    {
      slug: "kit-laravel-collection",
      label: "Kit Laravel Collection",
      description:
        "Todas as cores de Laravel para você! O framework mais elegante em um kit completo.",
      discount: 20,
      products: [
        { search: "Laravel Azul", category: "camisas" },
        { search: "Laravel Branca", category: "camisas" },
        { search: "Laravel Cinza", category: "camisas" },
        { search: "Laravel Preta", category: "camisas" },
      ],
      image: "kit-laravel-collection.png",
    },
    {
      slug: "kit-bones-b7",
      label: "Kit Bonés B7 Premium",
      description: "Coleção completa de bonés B7! 5 cores para combinar com qualquer look.",
      discount: 30,
      products: [
        { search: "Azul", category: "bones" },
        { search: "Branco", category: "bones" },
        { search: "Cinza", category: "bones" },
        { search: "Preto", category: "bones" },
        { search: "Azul Claro", category: "bones" },
      ],
      image: "kit-bones-premium.png",
    },
    {
      slug: "kit-startup",
      label: "Kit Startup Developer",
      description:
        "Começando sua jornada dev? Este kit tem tudo que você precisa: camisa JavaScript + boné estiloso.",
      discount: 12,
      products: [
        { search: "JavaScript", category: "camisas" },
        { search: "Branco", category: "bones" },
      ],
      image: "kit-startup.png",
    },
    {
      slug: "kit-dark-mode",
      label: "Kit Dark Mode",
      description:
        "Para quem programa de noite! Todas as peças em tons escuros para combinar com seu terminal.",
      discount: 18,
      products: [
        { search: "React Preta", category: "camisas" },
        { search: "Node", category: "camisas" },
        { search: "Preto", category: "bones" },
      ],
      image: "kit-dark-mode.png",
    },
    {
      slug: "kit-web-basics",
      label: "Kit Web Basics",
      description:
        "O básico bem feito! HTML + CSS para começar sua jornada no desenvolvimento web.",
      discount: 15,
      products: [
        { search: "HTML", category: "camisas" },
        { search: "CSS", category: "camisas" },
      ],
      image: "kit-web-basics.png",
    },
    {
      slug: "kit-duo-casual",
      label: "Kit Duo Casual",
      description: "Combinação perfeita para o dia a dia: camisa PHP grafite + boné cinza.",
      discount: 10,
      products: [
        { search: "PHP Grafite", category: "camisas" },
        { search: "Cinza", category: "bones" },
      ],
      image: "kit-duo-casual.png",
    },
    {
      slug: "kit-react-native-mobile",
      label: "Kit Mobile Developer",
      description:
        "Para quem desenvolve apps! Camisa React Native exclusiva + boné para codar em qualquer lugar.",
      discount: 15,
      products: [
        { search: "React Native", category: "camisas" },
        { search: "Azul Claro", category: "bones" },
      ],
      image: "kit-mobile-dev.png",
    },
  ];

  for (const kitData of kitsData) {
    const kitProducts: { product: (typeof products)[0]; quantity: number }[] = [];

    for (const item of kitData.products) {
      const category = item.category === "camisas" ? shirts : caps;
      const product = findProduct(category, item.search);

      if (product) {
        kitProducts.push({ product, quantity: 1 });
      } else {
        console.warn(`⚠️ Product not found: ${item.search} in ${item.category}`);
      }
    }

    if (kitProducts.length === 0) {
      console.warn(`⚠️ Skipping kit ${kitData.slug} - no products found`);
      continue;
    }

    const prices = calculateKitPrice(
      kitProducts.map((kp) => kp.product),
      kitData.discount
    );

    const kit = await prisma.kit.create({
      data: {
        slug: kitData.slug,
        label: kitData.label,
        description: kitData.description,
        price: prices.final,
        originalPrice: prices.original,
        discount: kitData.discount,
        image: kitData.image,
        products: {
          create: kitProducts.map((kp) => ({
            productId: kp.product.id,
            quantity: kp.quantity,
          })),
        },
      },
    });

    console.log(`✅ Kit created: ${kit.label} (${kitProducts.length} products) - R$ ${kit.price}`);
  }

  const totalKits = await prisma.kit.count();
  console.log(`\n🎉 Kits seeding completed! Total: ${totalKits} kits`);
}

seedKits()
  .catch((e) => {
    console.error("❌ Error seeding kits:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
