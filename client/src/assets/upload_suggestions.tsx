import { CategoryEnum } from '@api/models/CategoryEnum'

export type Suggestion = {
  name: string
  image: string
  categories: CategoryEnum[]
  description: string
}

export const suggestions: Suggestion[] = [
  {
    name: 'Drill',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286803_Drill.jpg',
    categories: [CategoryEnum.TOOLS, CategoryEnum.ELECTRONICS],
    description:
      'Get your DIY projects done effortlessly with this powerful cordless drill.',
  },
  {
    name: 'Electric Saw',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860333_Electric_Saw.jpg',
    categories: [
      CategoryEnum.TOOLS,
      CategoryEnum.ELECTRONICS,
      CategoryEnum.GARDEN,
    ],
    description:
      'Effortlessly cut through wood and more with this efficient electric saw.',
  },
  {
    name: 'Lawn Mower',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860330_Lawn_Mower.jpg',
    categories: [CategoryEnum.ELECTRONICS, CategoryEnum.GARDEN],
    description:
      'Keep your lawn tidy and well-maintained with this reliable lawn mower.',
  },
  {
    name: 'Socket Set',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860319_Socket_Set.jpeg',
    categories: [CategoryEnum.TOOLS],
    description:
      'Handle different nuts and bolts with ease using this versatile socket set.',
  },
  {
    name: 'Fondue Set',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860328_Fondue_Set.jpg',
    categories: [CategoryEnum.COOKING],
    description:
      'Host delightful fondue parties with this complete fondue set.',
  },
  {
    name: 'Microphone',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286735_Microphone.jpg',
    categories: [CategoryEnum.MUSIC, CategoryEnum.ELECTRONICS],
    description:
      'Capture clear audio for various purposes using this reliable microphone.',
  },
  {
    name: 'Music Equipment',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860328_Music_Equipment.jpg',
    categories: [CategoryEnum.MUSIC, CategoryEnum.ELECTRONICS],
    description:
      'Enhance your music experience with this high-quality music equipment.',
  },
  {
    name: 'Electric Piano',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860328_Electric_Piano.jpg',
    categories: [CategoryEnum.ELECTRONICS, CategoryEnum.MUSIC],
    description:
      'Play beautiful melodies on this electric piano for an immersive experience.',
  },
  {
    name: 'Ski',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286738_Ski.jpg',
    categories: [CategoryEnum.CLOTHING, CategoryEnum.OTHER],
    description:
      'Hit the slopes with confidence using this high-quality ski gear.',
  },
  {
    name: 'Air Purifier',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860329_Air_Purifier.jpg',
    categories: [CategoryEnum.ELECTRONICS, CategoryEnum.CLEANING],
    description:
      'Breathe cleaner air with the help of this efficient air purifier.',
  },
  {
    name: 'Sprinklers',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286745_Sprinklers.jpg',
    categories: [CategoryEnum.GARDEN],
    description:
      'Efficiently water your garden and plants with these reliable sprinklers.',
  },
  {
    name: 'Wheelbarrow',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286747_Wheelbarrow.jpg',
    categories: [CategoryEnum.GARDEN],
    description:
      'Easily transport heavy loads in your garden with this sturdy wheelbarrow.',
  },
  {
    name: 'Grill',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286747_Grill.jpg',
    categories: [CategoryEnum.GARDEN, CategoryEnum.COOKING],
    description: 'Enjoy delicious grilled meals with this high-quality grill.',
  },
  {
    name: 'Gaming Console',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689645860330_Gaming_Console.jpg',
    categories: [CategoryEnum.ELECTRONICS, CategoryEnum.OTHER],
    description:
      'Immerse yourself in exciting gaming adventures with this gaming console.',
  },
  {
    name: 'Hammer',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286803_Hammer.jpg',
    categories: [CategoryEnum.TOOLS],
    description:
      'Drive nails and perform various tasks with this reliable hammer.',
  },
  {
    name: 'Amplifier',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286734_Amplifier.jpg',
    categories: [CategoryEnum.MUSIC, CategoryEnum.ELECTRONICS],
    description:
      'Amplify sound and enhance your projects with this versatile amplifier.',
  },
  {
    name: 'Toolbox',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286800_Toolbox.jpg',
    categories: [CategoryEnum.TOOLS],
    description:
      'Keep your tools organized and accessible with this durable toolbox.',
  },
  {
    name: 'Tent',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286738_Tent.jpg',
    categories: [CategoryEnum.GARDEN, CategoryEnum.OTHER],
    description:
      'Enjoy outdoor adventures with this spacious and easy-to-set-up tent.',
  },
  {
    name: 'Tools',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286802_Tools.jpg',
    categories: [CategoryEnum.TOOLS],
    description: 'Use these reliable tools to tackle various tasks with ease.',
  },
  {
    name: 'Projector',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286797_Projector.jpg',
    categories: [CategoryEnum.ELECTRONICS, CategoryEnum.ACCESSORIES],
    description:
      'Enjoy big-screen entertainment and presentations with this reliable projector.',
  },
  {
    name: 'Drone',
    image:
      'https://lendit-product-pictures.s3.amazonaws.com/1689643286795_Drone.jpg',
    categories: [CategoryEnum.ELECTRONICS],
    description:
      'Capture stunning aerial footage and enjoy flying this high-tech drone.',
  },
]
