import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");
  console.log("🗑️ Cleaning existing data...");

  await prisma.productMetadata.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.orderProduct.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.metadataValue.deleteMany();
  await prisma.categoryMetadata.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.category.deleteMany();

  console.log("✅ Database cleaned!");
  console.log("📁 Creating categories...");

  const categoryShirts = await prisma.category.create({
    data: {
      slug: "camisas",
      name: "Camisas",
    },
  });

  const categoryCaps = await prisma.category.create({
    data: {
      slug: "bones",
      name: "Bonés",
    },
  });

  console.log("✅ Categories created:", categoryShirts.name, categoryCaps.name);
  console.log("🏷️ Creating metadata for filters...");

  const metadataShirtTech = await prisma.categoryMetadata.create({
    data: {
      id: "shirt-tech",
      name: "Tecnologia",
      categoryId: categoryShirts.id,
    },
  });
  
  const metadataShirtColor = await prisma.categoryMetadata.create({
    data: {
      id: "shirt-color",
      name: "Cor",
      categoryId: categoryShirts.id,
    },
  });

  const metadataCapColor = await prisma.categoryMetadata.create({
    data: {
      id: "cap-color",
      name: "Cor",
      categoryId: categoryCaps.id,
    },
  });

  console.log("✅ Category metadata created!");
  console.log("🎨 Creating metadata values...");

  const techValues = await Promise.all([
    prisma.metadataValue.create({
      data: { id: "react", label: "React", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "react-native", label: "React Native", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "node", label: "Node.js", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "php", label: "PHP", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "laravel", label: "Laravel", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "javascript", label: "JavaScript", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "html", label: "HTML", categoryMetadataId: "shirt-tech" },
    }),
    prisma.metadataValue.create({
      data: { id: "css", label: "CSS", categoryMetadataId: "shirt-tech" },
    }),
  ]);

  const shirtColorValues = await Promise.all([
    prisma.metadataValue.create({
      data: { id: "shirt-azul", label: "Azul", categoryMetadataId: "shirt-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "shirt-branco", label: "Branco", categoryMetadataId: "shirt-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "shirt-cinza", label: "Cinza", categoryMetadataId: "shirt-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "shirt-preto", label: "Preto", categoryMetadataId: "shirt-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "shirt-verde", label: "Verde", categoryMetadataId: "shirt-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "shirt-laranja", label: "Laranja", categoryMetadataId: "shirt-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "shirt-amarelo", label: "Amarelo", categoryMetadataId: "shirt-color" },
    }),
  ]);

  const capColorValues = await Promise.all([
    prisma.metadataValue.create({
      data: { id: "cap-azul", label: "Azul", categoryMetadataId: "cap-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "cap-azul-claro", label: "Azul Claro", categoryMetadataId: "cap-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "cap-branco", label: "Branco", categoryMetadataId: "cap-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "cap-cinza", label: "Cinza", categoryMetadataId: "cap-color" },
    }),
    prisma.metadataValue.create({
      data: { id: "cap-preto", label: "Preto", categoryMetadataId: "cap-color" },
    }),
  ]);

  console.log("✅ Metadata values created!");
  console.log("🖼️ Creating banners...");

  await Promise.all([
    prisma.banner.create({
      data: {
        img: "banner_promo_1.jpg",
        link: "/categories/camisas",
      },
    }),
    prisma.banner.create({
      data: {
        img: "banner_promo_2.jpg",
        link: "/categories/bones",
      },
    }),
  ]);

  console.log("✅ Banners created!");
  console.log("👕 Creating shirt products...");

  const shirts = [
    {
      label: "Camisa React Azul",
      price: 79.9,
      description:
        "Camisa azul com logo do React, ideal para desenvolvedores front-end que amam essa biblioteca.",
      images: ["camiseta-react-azul.png"],
      tech: "react",
      color: "shirt-azul",
    },
    {
      label: "Camisa React Cinza",
      price: 79.9,
      description: "Camisa cinza com estampa React, perfeita para o dia a dia do desenvolvedor.",
      images: ["camiseta-react-cinza.png"],
      tech: "react",
      color: "shirt-cinza",
    },
    {
      label: "Camisa React Preta",
      price: 84.9,
      description: "Camisa preta elegante com logo React, para devs que gostam de estilo.",
      images: ["camiseta-react-preta.png"],
      tech: "react",
      color: "shirt-preto",
    },
    {
      label: "Camisa React Native",
      price: 89.9,
      description:
        "Camisa exclusiva React Native, para quem desenvolve apps mobile multiplataforma.",
      images: ["camiseta-react-native.png"],
      tech: "react-native",
      color: "shirt-cinza",
    },
    {
      label: "Camisa Node.js Verde",
      price: 74.9,
      description: "Camisa verde com logo Node.js, para desenvolvedores backend JavaScript.",
      images: ["camiseta-node.png"],
      tech: "node",
      color: "shirt-verde",
    },
    {
      label: "Camisa Node.js Preta",
      price: 79.9,
      description: "Camisa preta com estampa Node.js, estilo e código no mesmo lugar.",
      images: ["camiseta-node-preta.png"],
      tech: "node",
      color: "shirt-preto",
    },
    {
      label: "Camisa PHP Azul",
      price: 69.9,
      description: "Camisa azul clássica com logo PHP, para os amantes do elefante.",
      images: ["camiseta-php.png"],
      tech: "php",
      color: "shirt-azul",
    },
    {
      label: "Camisa PHP Grafite",
      price: 74.9,
      description: "Camisa grafite com estampa PHP, elegância para desenvolvedores web.",
      images: ["camiseta-php-grafite.png"],
      tech: "php",
      color: "shirt-cinza",
    },    
    {
      label: "Camisa Laravel Azul",
      price: 84.9,
      description: "Camisa azul com logo Laravel, para quem ama o framework PHP mais elegante.",
      images: ["camiseta-laravel-azul.png"],
      tech: "laravel",
      color: "shirt-azul",
    },
    {
      label: "Camisa Laravel Branca",
      price: 79.9,
      description: "Camisa branca clean com estampa Laravel, perfeita para qualquer ocasião.",
      images: ["camiseta-laravel-branca.png"],
      tech: "laravel",
      color: "shirt-branco",
    },
    {
      label: "Camisa Laravel Cinza",
      price: 79.9,
      description: "Camisa cinza com logo Laravel, combinação perfeita de conforto e estilo.",
      images: ["camiseta-Laravel-cinza.png"],
      tech: "laravel",
      color: "shirt-cinza",
    },
    {
      label: "Camisa Laravel Preta",
      price: 84.9,
      description: "Camisa preta premium com estampa Laravel, para devs que valorizam qualidade.",
      images: ["camiseta-laravel-preta.png"],
      tech: "laravel",
      color: "shirt-preto",
    },
    {
      label: "Camisa JavaScript",
      price: 69.9,
      description: "Camisa amarela icônica com logo JavaScript, a linguagem da web.",
      images: ["camiseta-js.png"],
      tech: "javascript",
      color: "shirt-amarelo",
    },
    {
      label: "Camisa HTML",
      price: 64.9,
      description: "Camisa laranja com logo HTML5, para quem começou pelo básico e nunca esqueceu.",
      images: ["camiseta-html.png"],
      tech: "html",
      color: "shirt-laranja",
    },
    {
      label: "Camisa CSS",
      price: 64.9,
      description: "Camisa azul com logo CSS3, para os mestres do estilo na web.",
      images: ["camiseta-css.png"],
      tech: "css",
      color: "shirt-azul",
    },
  ];

  for (const shirt of shirts) {
    const product = await prisma.product.create({
      data: {
        label: shirt.label,
        price: shirt.price,
        description: shirt.description,
        categoryId: categoryShirts.id,
        viewsCount: Math.floor(Math.random() * 500),
        salesCount: Math.floor(Math.random() * 100),
      },
    });
    
    for (const imageUrl of shirt.images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
        },
      });
    }
    
    await prisma.productMetadata.create({
      data: {
        productId: product.id,
        categoryMetadataId: "shirt-tech",
        metadataValueId: shirt.tech,
      },
    });
    
    await prisma.productMetadata.create({
      data: {
        productId: product.id,
        categoryMetadataId: "shirt-color",
        metadataValueId: shirt.color,
      },
    });
  }

  console.log("✅ Shirt products created:", shirts.length);
  console.log("🧢 Creating cap products...");

  const caps = [
    {
      label: "Boné B7 Azul",
      price: 49.9,
      description: "Boné azul marinho com logo B7, estilo e conforto para o dia a dia.",
      images: ["bone-b7-azul.png"],
      color: "cap-azul",
    },
    {
      label: "Boné B7 Azul Claro",
      price: 49.9,
      description: "Boné azul claro com logo B7, perfeito para dias ensolarados.",
      images: ["bone-b7-azul-claro.png"],
      color: "cap-azul-claro",
    },
    {
      label: "Boné B7 Branco",
      price: 44.9,
      description: "Boné branco clean com logo B7, combina com tudo.",
      images: ["bone-b7-branco.png"],
      color: "cap-branco",
    },
    {
      label: "Boné B7 Cinza",
      price: 44.9,
      description: "Boné cinza com logo B7, versátil e estiloso.",
      images: ["bone-b7-cinza.png"],
      color: "cap-cinza",
    },
    {
      label: "Boné B7 Preto",
      price: 49.9,
      description: "Boné preto clássico com logo B7, elegância para qualquer ocasião.",
      images: ["bone-b7-preto.png"],
      color: "cap-preto",
    },
    {
      label: "Boné B7 Preto Premium",
      price: 54.9,
      description: "Boné preto premium com acabamento especial e logo B7 bordado.",
      images: ["bone-b7-preto2.png"],
      color: "cap-preto",
    },
  ];

  for (const cap of caps) {
    const product = await prisma.product.create({
      data: {
        label: cap.label,
        price: cap.price,
        description: cap.description,
        categoryId: categoryCaps.id,
        viewsCount: Math.floor(Math.random() * 300),
        salesCount: Math.floor(Math.random() * 80),
      },
    });
    
    for (const imageUrl of cap.images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
        },
      });
    }
    
    await prisma.productMetadata.create({
      data: {
        productId: product.id,
        categoryMetadataId: "cap-color",
        metadataValueId: cap.color,
      },
    });
  }

  console.log("✅ Cap products created:", caps.length);

  const totalProducts = await prisma.product.count();
  const totalImages = await prisma.productImage.count();
  const totalCategories = await prisma.category.count();

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("📊 Summary:");
  console.log(`   - Categories: ${totalCategories}`);
  console.log(`   - Products: ${totalProducts}`);
  console.log(`   - Product Images: ${totalImages}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
