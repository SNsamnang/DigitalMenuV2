import { create } from "framer-motion/client";

export const anachakCate = [
  { name: "សាលមុន" },
  { name: "ធូណា" },
  { name: "នីសុីន" },
  { name: "លាយ" },
  { name: "បន្លែ" },
  { name: "ទឺកជ្រលក់" },
];
export const anachakMenus = [
  {
    id: 1,
    name: "សាលមុន 250g",
    price: 15,
    image: "/anachak/Artboard 1.png",
    productType: "សាលមុន",
    category: "special",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 10,
    userid: 1,
    status: "Active",
    shop:"salmon"
  },
  {
    id: 2,
    name: "សាលមុន 500g",
    price: 15,
    image: "/anachak/Artboard 8.png",
    productType: "សាលមុន",
    category: "new",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 10,
    userid: 3,
    status: "Inactive",
    shop:"salmon"
  },
  {
    id: 3,
    name: "សាលមុន 100g",
    price: 15,
    image: "/anachak/Artboard 16.png",
    productType: "សាលមុន",
    category: "recommend",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 20,
    userid: 2,
    status: "Active",
    shop:"salmon"
  },
  {
    id: 4,
    name: "ធូណា 250g",
    price: 15.55,
    image: "/anachak/Artboard 2.png",
    productType: "ធូណា",
    category: "normal",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 10,
    userid: 3,
    status: "Active",
    shop:"salmon"
  },
  {
    id: 5,
    name: "ធូណា 500g",
    price: 15,
    image: "/anachak/Artboard 11.png",
    productType: "ធូណា",
    category: "special",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 10,
    userid: 1,
    status: "Inactive",
    shop:"salmon"
  },
  {
    id: 6,
    name: "ធូណា 100g",
    price: 15.99,
    image: "/anachak/Artboard 17.png",
    productType: "ធូណា",
    category: "new",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 0,
    userid: 2,
    status: "Active",
    shop:"salmon"
  },
  {
    id: 7,
    name: "នីសុីន 250g",
    price: 15,
    image: "/anachak/Artboard 2.png",
    productType: "នីសុីន",
    category: "recommend",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 20,
    userid: 3,
    status: "Inactive",
    shop:"salmon"
  },
  {
    id: 8,
    name: "នីសុីន 500g",
    price: 15,
    image: "/anachak/Artboard 11.png",
    productType: "នីសុីន",
    category: "normal",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 0,
    userid: 1,
    status: "Active",
    shop:"salmon"
  },
  {
    id: 9,
    name: "នីសុីន 100g",
    price: 15,
    image: "/anachak/Artboard 17.png",
    productType: "នីសុីន",
    category: "special",
    description:
      "A sweet and savory combo of ham, pineapple, and mozzarella on a tomato sauce base.",
    discount: 10,
    userid: 2,
    status: "Inactive",
    shop:"salmon"
  },
];

export const anachakSaleType = [
  { name: "special", value: "ពិសេស" },
  { name: "new", value: "ថ្មី" },
  { name: "recommend", value: "ណែនាំ" },
  { name: "normal", value: "ធម្មតា" },
];
export const users = [
  {
    id: 1,
    name: "nao samnang",
    email: "nang123@gmail.com",
    password: "123456",
    role: 1,
    status: 1,
  },
  {
    id: 2,
    name: "soy leap",
    email: "nang456@gmail.com",
    password: "123456",
    role: 2,
    status: 1,
  },
  {
    id: 3,
    name: "john doe",
    email: "john.doe@gmail.com",
    password: "password123",
    role: 3,
    status: 1,
  },
  {
    id: 4,
    name: "mary jane",
    email: "mary.jane@example.com",
    password: "password456",
    role: 2,
    status: 1,
  },
  {
    id: 5,
    name: "alex smith",
    email: "alex.smith@gmail.com",
    password: "alex123",
    role: 3,
    status: 1,
  },
  {
    id: 6,
    name: "emily brown",
    email: "emily.brown@hotmail.com",
    password: "brown123",
    role: 2,
    status: 1,
  },
  {
    id: 7,
    name: "michael johnson",
    email: "michael.johnson@yahoo.com",
    password: "michael789",
    role: 3,
    status: 1,
  },
  {
    id: 8,
    name: "susan lee",
    email: "susan.lee@outlook.com",
    password: "susan456",
    role: 2,
    status: 1,
  },
  {
    id: 9,
    name: "chris evans",
    email: "chris.evans@gmail.com",
    password: "evans123",
    role: 3,
    status: 0,
  },
  {
    id: 10,
    name: "lily white",
    email: "lily.white@example.com",
    password: "white123",
    role: 1,
    status: 1,
  },
  {
    id: 11,
    name: "david wilson",
    email: "david.wilson@gmail.com",
    password: "wilson123",
    role: 3,
    status: 0,
  },
  {
    id: 12,
    name: "olivia brown",
    email: "olivia.brown@yahoo.com",
    password: "brown2022",
    role: 2,
    status: 1,
  },
];
export const roles=[
  {
    id:1,
    role:"admin",
    description:"admin"
  },
  {
    id:2,
    role:"sub admin",
    description:"sub admin"
  },
  {
    id:3,
    role:"user",
    description:"user"
  },
]
export const anachakShop = [
  {
    id: 1,
    name: "ហាងសាលមុន",
    address: "ភូមិស្រុកបន្លែ ខេត្តកណ្តាល",
    phone: "012 345 678",
    users: 1,
    status: 1,
    profile: "/anachak/Artboard 1.png",
    created_at: "2025-02-02",
  },
  {
    id: 2,
    name: "ហាងធូណា",
    address: "ភូមិស្រុកបន្លែ ខេត្តកណ្តាល",
    phone: "012 345 678",
    users: 2,
    status: 1,
    profile: "/anachak/Artboard 2.png",
    created_at: "2025-03-02",
  },
  {
    id: 3,
    name: "ហាងនីសុីន",
    address: "ភូមិស្រុកបន្លែ ខេត្តកណ្តាល",
    phone: "012 345 678",
    users: 3,
    status: 1,
    profile: "/anachak/Artboard 3.png",
    created_at: "2025-04-02",
  },
  {
    id: 4,
    name: "ហាងលាយ",
    address: "ភូមិស្រុកបន្លែ ខេត្តកណ្តាល",
    phone: "012 345 678",
    users: 1,
    status: 1,
    profile: "/anachak/Artboard 4.png",
    created_at: "2025-05-02",
  },
  {
    id: 5,
    name: "ហាងបន្លែ",
    address: "ភូមិស្រុកបន្លែ ខេត្តកណ្តាល",
    phone: "012 345 678",
    users: 2,
    status: 1,
    profile: "/anachak/Artboard 5.png",
    created_at: "2025-03-02",
  },
  {
    id: 6,
    name: "ហាងទឺកជ្រលក់",
    address: "ភូមិស្រុកបន្លែ",
    phone: "012 345 678",
    users: 3,
    status: 1,
    profile: "/anachak/Artboard 6.png",
    created_at: "2025-05-02",
  },
];
